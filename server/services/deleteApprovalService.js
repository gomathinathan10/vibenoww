import crypto from 'crypto';
import { getDbPool, isDbConnected, memoryStore } from '../config/db.js';

/**
 * Record an audit log entry in the permanent audit trail
 */
export async function recordAuditLog({
  adminId = null,
  adminEmail = 'admin@vibenoww.com',
  adminName = 'VibeNoww Admin',
  action,
  targetType,
  targetId,
  targetDetails = '',
  reason = 'Admin action',
  result = 'SUCCESS',
  ip = '127.0.0.1',
  userAgent = 'VibeNoww Admin Portal'
}) {
  try {
    const detailsStr = typeof targetDetails === 'object' ? JSON.stringify(targetDetails) : String(targetDetails || '');

    if (isDbConnected()) {
      const pool = getDbPool();
      await pool.query(
        `INSERT INTO audit_logs (
          admin_id, admin_email, admin_name, action, target_type, target_id,
          target_details, deletion_reason, result, ip_address, user_agent, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          adminId ? String(adminId) : null,
          adminEmail || 'admin@vibenoww.com',
          adminName || 'Admin',
          action,
          targetType,
          String(targetId),
          detailsStr,
          reason,
          result,
          ip || 'unknown',
          userAgent || 'unknown'
        ]
      );
    } else {
      memoryStore.auditLogs = memoryStore.auditLogs || [];
      memoryStore.auditLogs.unshift({
        id: memoryStore.auditLogs.length + 1,
        admin_id: adminId,
        admin_email: adminEmail,
        admin_name: adminName,
        action,
        target_type: targetType,
        target_id: String(targetId),
        target_details: detailsStr,
        deletion_reason: reason,
        result,
        ip_address: ip,
        user_agent: userAgent,
        created_at: new Date().toISOString()
      });
    }
  } catch (err) {
    console.error('Audit log write note:', err.message);
  }
}

/**
 * STEP 2: Initiate deletion, validate target, inspect cascade safety, generate single-use token
 */
export async function initiateDeletion({
  adminEmail = 'admin@vibenoww.com',
  adminName = 'VibeNoww Admin',
  adminId = null,
  targetType,
  targetId,
  reason,
  ip = '127.0.0.1',
  userAgent = 'Admin Portal'
}) {
  if (!targetType || !targetId) {
    throw new Error('Target type and target record ID are required.');
  }

  const cleanReason = String(reason || '').trim();
  if (!cleanReason || cleanReason.length < 3) {
    throw new Error('A valid deletion justification reason (at least 3 characters) is mandatory.');
  }

  const validTypes = ['photographer', 'creator', 'order', 'booking', 'user', 'customer', 'inquiry', 'lead', 'quotation', 'service'];
  const normType = targetType.toLowerCase().trim();
  if (!validTypes.includes(normType)) {
    throw new Error(`Invalid target type: ${targetType}. Must be one of: ${validTypes.join(', ')}`);
  }

  let targetRecord = null;
  let targetName = '';
  let targetSummary = '';
  let actionType = 'PERMANENT_DELETE';
  let cascadeNotes = [];

  if (isDbConnected()) {
    const pool = getDbPool();

    // 1. CREATOR / PHOTOGRAPHER
    if (normType === 'photographer' || normType === 'creator') {
      const [rows] = await pool.query('SELECT * FROM photographers WHERE id = ? OR phone = ? LIMIT 1', [targetId, targetId]);
      if (rows.length === 0) {
        throw new Error(`Creator record #${targetId} not found.`);
      }
      targetRecord = rows[0];
      targetName = targetRecord.name || targetRecord.studio_name || `Creator #${targetId}`;

      // Check cascade / relationship safety:
      // Does creator have historical bookings or completed shoots?
      const [shoots] = await pool.query(
        'SELECT id, work_code, status, customer_name, estimated_budget FROM orders WHERE assigned_photographer_id = ?',
        [targetRecord.id]
      );

      const [payments] = await pool.query(
        'SELECT p.id, p.amount FROM payments p JOIN orders o ON p.work_id = o.id WHERE o.assigned_photographer_id = ?',
        [targetRecord.id]
      );

      const completedOrActive = shoots.filter(s => ['CONFIRMED', 'SHOOT_IN_PROGRESS', 'IN_PROGRESS', 'COMPLETED'].includes(s.status));

      if (completedOrActive.length > 0 || payments.length > 0) {
        // High business integrity requirement: Soft delete / Archive to preserve financial history!
        actionType = 'ARCHIVE_CREATOR';
        cascadeNotes.push(`Has ${completedOrActive.length} active/completed shoots and ${payments.length} financial transactions. Record will be safely archived/deactivated to preserve historical shoot and invoice integrity.`);
      } else {
        actionType = 'DELETE_CREATOR';
        cascadeNotes.push(`Clean creator account with 0 historical shoots or payments. Safe for permanent deletion.`);
      }

      targetSummary = `${targetName} (${targetRecord.phone || targetRecord.email || targetRecord.location || 'Tamil Nadu'}) | ${shoots.length} shoots linked`;
    }

    // 2. ORDER / BOOKING / SHOOT
    else if (normType === 'order' || normType === 'booking') {
      const [rows] = await pool.query('SELECT * FROM orders WHERE id = ? OR work_code = ? LIMIT 1', [targetId, targetId]);
      if (rows.length === 0) {
        throw new Error(`Order/Booking #${targetId} not found.`);
      }
      targetRecord = rows[0];
      targetName = `${targetRecord.work_code} — ${targetRecord.customer_name} (${targetRecord.shoot_type})`;

      // Check payments
      const [payments] = await pool.query('SELECT * FROM payments WHERE work_id = ? OR work_code = ?', [targetRecord.id, targetRecord.work_code]);

      if (payments.length > 0 && ['COMPLETED', 'CONFIRMED'].includes(targetRecord.status)) {
        actionType = 'ARCHIVE_ORDER';
        cascadeNotes.push(`Order has ${payments.length} payment records. Will be cancelled/archived to maintain financial reporting integrity.`);
      } else {
        actionType = 'DELETE_ORDER';
        cascadeNotes.push(`Order has 0 completed transactions. Safe for permanent deletion.`);
      }

      targetSummary = `${targetRecord.work_code}: ${targetRecord.customer_name} (${targetRecord.shoot_type} on ${targetRecord.shoot_date})`;
    }

    // 3. USER / CUSTOMER
    else if (normType === 'user' || normType === 'customer') {
      const [rows] = await pool.query('SELECT * FROM users WHERE id = ? OR email = ? LIMIT 1', [targetId, targetId]);
      if (rows.length === 0) {
        throw new Error(`User account #${targetId} not found.`);
      }
      targetRecord = rows[0];
      if (targetRecord.role === 'ADMIN' || targetRecord.email === 'admin@vibenoww.com') {
        throw new Error('Master Administrator account cannot be deleted. Operation blocked by safety policy.');
      }
      targetName = `${targetRecord.name} (${targetRecord.email || targetRecord.phone})`;
      actionType = 'DELETE_USER';
      targetSummary = `User #${targetRecord.id}: ${targetRecord.name} [Role: ${targetRecord.role}]`;
    }

    // 4. INQUIRY / LEAD
    else if (normType === 'inquiry' || normType === 'lead') {
      const [rows] = await pool.query('SELECT * FROM inquiries WHERE id = ? LIMIT 1', [targetId]);
      if (rows.length === 0) {
        throw new Error(`Inquiry lead #${targetId} not found.`);
      }
      targetRecord = rows[0];
      targetName = `Lead #${targetRecord.id} — ${targetRecord.name} (${targetRecord.event_type || 'Event'})`;
      actionType = 'DELETE_LEAD';
      targetSummary = `${targetRecord.name} (${targetRecord.email}, ${targetRecord.phone})`;
    }

    // 5. QUOTATION
    else if (normType === 'quotation') {
      const [rows] = await pool.query('SELECT * FROM quotations WHERE id = ? OR work_code = ? LIMIT 1', [targetId, targetId]);
      if (rows.length === 0) {
        throw new Error(`Quotation #${targetId} not found.`);
      }
      targetRecord = rows[0];
      targetName = `Quotation for Work #${targetRecord.work_code}`;
      actionType = 'DELETE_QUOTATION';
      targetSummary = `Quotation #${targetRecord.id} (Customer Price: ₹${targetRecord.customer_price})`;
    }

    // 6. SERVICE
    else if (normType === 'service') {
      targetName = `Service #${targetId}`;
      actionType = 'DELETE_SERVICE';
      targetSummary = `Platform Service item #${targetId}`;
    }

  } else {
    // Memory store fallback
    targetName = `${targetType} #${targetId}`;
    actionType = `DELETE_${normType.toUpperCase()}`;
    targetSummary = `Record #${targetId}`;
    cascadeNotes.push('Resilient memory-mode record.');
  }

  // Generate cryptographic single-use token
  const token = `del_tok_${Date.now()}_${crypto.randomBytes(16).toString('hex')}`;
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity
  const expiresAtSql = expiresAt.toISOString().slice(0, 19).replace('T', ' ');

  const detailsObj = {
    targetName,
    targetSummary,
    cascadeNotes,
    actionType
  };

  if (isDbConnected()) {
    const pool = getDbPool();
    await pool.query(
      `INSERT INTO deletion_approvals (
        token, admin_email, target_type, target_id, target_name,
        target_details, reason, action_type, status, expires_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, NOW())`,
      [
        token,
        adminEmail,
        normType,
        String(targetId),
        targetName,
        JSON.stringify(detailsObj),
        cleanReason,
        actionType,
        expiresAtSql
      ]
    );
  } else {
    memoryStore.deletionApprovals = memoryStore.deletionApprovals || [];
    memoryStore.deletionApprovals.push({
      token,
      admin_email: adminEmail,
      target_type: normType,
      target_id: String(targetId),
      target_name: targetName,
      target_details: JSON.stringify(detailsObj),
      reason: cleanReason,
      action_type: actionType,
      status: 'PENDING',
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString()
    });
  }

  // Record audit trail step
  await recordAuditLog({
    adminId,
    adminEmail,
    adminName,
    action: `INITIATE_${actionType}`,
    targetType: normType,
    targetId: String(targetId),
    targetDetails: detailsObj,
    reason: cleanReason,
    result: 'SUCCESS',
    ip,
    userAgent
  });

  return {
    success: true,
    message: 'Deletion approval step 2 completed. Token issued for final step 3 verification.',
    token,
    targetType: normType,
    targetId: String(targetId),
    targetName,
    targetSummary,
    actionType,
    cascadeNotes,
    reason: cleanReason,
    expiresAt: expiresAt.toISOString()
  };
}

/**
 * STEP 3: Confirm final deletion using valid approval token
 */
export async function confirmDeletion({
  token,
  targetType,
  targetId,
  confirmation,
  adminEmail = 'admin@vibenoww.com',
  adminName = 'VibeNoww Admin',
  adminId = null,
  ip = '127.0.0.1',
  userAgent = 'Admin Portal'
}) {
  if (!token) {
    throw new Error('Approval token is required to execute deletion.');
  }

  if (String(confirmation).toUpperCase() !== 'CONFIRM') {
    throw new Error('Explicit confirmation code "CONFIRM" is required.');
  }

  let approval = null;

  if (isDbConnected()) {
    const pool = getDbPool();
    const [rows] = await pool.query(
      'SELECT * FROM deletion_approvals WHERE token = ? LIMIT 1',
      [token]
    );

    if (rows.length === 0) {
      await recordAuditLog({
        adminId, adminEmail, adminName,
        action: 'DELETE_REJECTED_INVALID_TOKEN',
        targetType: targetType || 'unknown',
        targetId: targetId || 'unknown',
        reason: 'Invalid or forged token',
        result: 'BLOCKED',
        ip, userAgent
      });
      throw new Error('Invalid or forged deletion approval token.');
    }

    approval = rows[0];

    // Check token status
    if (approval.status !== 'PENDING') {
      throw new Error(`Deletion token has already been ${approval.status.toLowerCase()}. Each token is strictly single-use.`);
    }

    // Check expiration
    const expiryDate = new Date(approval.expires_at);
    if (expiryDate < new Date()) {
      await pool.query('UPDATE deletion_approvals SET status = "EXPIRED" WHERE id = ?', [approval.id]);
      await recordAuditLog({
        adminId, adminEmail, adminName,
        action: 'DELETE_REJECTED_EXPIRED_TOKEN',
        targetType: approval.target_type,
        targetId: approval.target_id,
        reason: 'Approval token expired (exceeded 5 minutes)',
        result: 'BLOCKED',
        ip, userAgent
      });
      throw new Error('Deletion approval session has expired (exceeded 5 minutes). Please restart from Step 1.');
    }

    // Check target match
    if (targetId && String(approval.target_id) !== String(targetId)) {
      throw new Error('Token does not match the target record ID.');
    }
    if (targetType && approval.target_type.toLowerCase() !== String(targetType).toLowerCase()) {
      throw new Error('Token does not match the target record type.');
    }

    const { action_type: actionType, target_id: actualTargetId } = approval;

    // EXECUTE ACTION SAFELY
    if (actionType === 'ARCHIVE_CREATOR') {
      // Soft-delete creator: deactivate, preserve historical shoots
      await pool.query(
        `UPDATE photographers 
         SET status = 'INACTIVE', approval_status = 'REJECTED' 
         WHERE id = ?`,
        [actualTargetId]
      );
      // Release future availability
      await pool.query('DELETE FROM availability WHERE photographer_id = ? AND status = "AVAILABLE"', [actualTargetId]);
      // Update linked user if exists
      const [uRows] = await pool.query('SELECT user_id, phone, email FROM photographers WHERE id = ?', [actualTargetId]);
      if (uRows.length > 0 && uRows[0].user_id) {
        await pool.query('UPDATE users SET status = "INACTIVE" WHERE id = ?', [uRows[0].user_id]);
      }
    } else if (actionType === 'DELETE_CREATOR') {
      // Safe permanent deletion: 0 historical shoots
      const [uRows] = await pool.query('SELECT user_id, phone, email FROM photographers WHERE id = ?', [actualTargetId]);
      await pool.query('DELETE FROM availability WHERE photographer_id = ?', [actualTargetId]);
      await pool.query('UPDATE orders SET assigned_photographer_id = NULL, assigned_photographer_name = NULL WHERE assigned_photographer_id = ?', [actualTargetId]);
      await pool.query('DELETE FROM photographers WHERE id = ?', [actualTargetId]);
      if (uRows.length > 0 && uRows[0].user_id) {
        await pool.query('DELETE FROM users WHERE id = ? AND role = "PHOTOGRAPHER"', [uRows[0].user_id]);
      }
    } else if (actionType === 'ARCHIVE_ORDER') {
      // Soft-delete order
      await pool.query(
        `UPDATE orders SET status = 'CANCELLED' WHERE id = ? OR work_code = ?`,
        [actualTargetId, actualTargetId]
      );
      await pool.query('DELETE FROM availability WHERE work_id = ? OR work_code = ?', [actualTargetId, actualTargetId]);
    } else if (actionType === 'DELETE_ORDER') {
      // Safe permanent deletion of order
      await pool.query('DELETE FROM availability WHERE work_id = ? OR work_code = ?', [actualTargetId, actualTargetId]);
      await pool.query('DELETE FROM quotations WHERE work_id = ? OR work_code = ?', [actualTargetId, actualTargetId]);
      await pool.query('DELETE FROM payments WHERE work_id = ? OR work_code = ?', [actualTargetId, actualTargetId]);
      await pool.query('DELETE FROM orders WHERE id = ? OR work_code = ?', [actualTargetId, actualTargetId]);
    } else if (actionType === 'DELETE_USER') {
      await pool.query('DELETE FROM users WHERE id = ? AND role != "ADMIN"', [actualTargetId]);
    } else if (actionType === 'DELETE_LEAD') {
      await pool.query('DELETE FROM inquiries WHERE id = ?', [actualTargetId]);
    } else if (actionType === 'DELETE_QUOTATION') {
      await pool.query('DELETE FROM quotations WHERE id = ?', [actualTargetId]);
    } else if (actionType === 'DELETE_SERVICE') {
      // Service deletion if custom table exists
    }

    // Mark token as confirmed/used
    await pool.query('UPDATE deletion_approvals SET status = "CONFIRMED" WHERE id = ?', [approval.id]);

    // Permanent Audit Record
    await recordAuditLog({
      adminId,
      adminEmail,
      adminName,
      action: actionType,
      targetType: approval.target_type,
      targetId: actualTargetId,
      targetDetails: approval.target_details,
      reason: approval.reason,
      result: 'SUCCESS',
      ip,
      userAgent
    });

    return {
      success: true,
      message: `Record ${approval.target_name || actualTargetId} successfully ${actionType.startsWith('ARCHIVE') ? 'archived' : 'permanently deleted'}.`,
      actionType,
      targetType: approval.target_type,
      targetId: actualTargetId
    };

  } else {
    // Memory mode execution
    const appIndex = (memoryStore.deletionApprovals || []).findIndex(a => a.token === token);
    if (appIndex === -1) {
      throw new Error('Invalid deletion approval token.');
    }
    const app = memoryStore.deletionApprovals[appIndex];
    if (app.status !== 'PENDING') {
      throw new Error(`Token already ${app.status.toLowerCase()}.`);
    }

    app.status = 'CONFIRMED';
    const normType = app.target_type;
    const actualTargetId = app.target_id;

    if (normType === 'photographer' || normType === 'creator') {
      memoryStore.photographers = memoryStore.photographers.filter(p => p.id !== actualTargetId);
      memoryStore.availability = memoryStore.availability.filter(a => a.photographer_id !== actualTargetId);
    } else if (normType === 'order' || normType === 'booking') {
      memoryStore.orders = memoryStore.orders.filter(o => o.id !== Number(actualTargetId) && o.workCode !== actualTargetId && o.id !== actualTargetId);
    } else if (normType === 'user' || normType === 'customer') {
      memoryStore.users = memoryStore.users.filter(u => u.id !== Number(actualTargetId) && u.role !== 'ADMIN');
    }

    await recordAuditLog({
      adminId,
      adminEmail,
      adminName,
      action: app.action_type || 'DELETE_RECORD',
      targetType: normType,
      targetId: actualTargetId,
      targetDetails: app.target_details,
      reason: app.reason,
      result: 'SUCCESS',
      ip,
      userAgent
    });

    return {
      success: true,
      message: `Record ${app.target_name || actualTargetId} deleted successfully.`,
      actionType: app.action_type,
      targetType: normType,
      targetId: actualTargetId
    };
  }
}

/**
 * Cancel a pending deletion token
 */
export async function cancelDeletion({
  token,
  reason = 'Admin cancelled approval modal',
  adminEmail = 'admin@vibenoww.com',
  adminName = 'VibeNoww Admin',
  adminId = null,
  ip = '127.0.0.1',
  userAgent = 'Admin Portal'
}) {
  if (!token) return { success: true, message: 'No token to cancel.' };

  if (isDbConnected()) {
    const pool = getDbPool();
    const [rows] = await pool.query('SELECT * FROM deletion_approvals WHERE token = ? LIMIT 1', [token]);
    if (rows.length > 0) {
      const app = rows[0];
      await pool.query('UPDATE deletion_approvals SET status = "CANCELLED" WHERE id = ?', [app.id]);
      await recordAuditLog({
        adminId,
        adminEmail,
        adminName,
        action: 'DELETE_CANCELLED',
        targetType: app.target_type,
        targetId: app.target_id,
        reason: reason || app.reason,
        result: 'CANCELLED',
        ip,
        userAgent
      });
    }
  } else {
    const app = (memoryStore.deletionApprovals || []).find(a => a.token === token);
    if (app) {
      app.status = 'CANCELLED';
      await recordAuditLog({
        adminId,
        adminEmail,
        adminName,
        action: 'DELETE_CANCELLED',
        targetType: app.target_type,
        targetId: app.target_id,
        reason: reason || app.reason,
        result: 'CANCELLED',
        ip,
        userAgent
      });
    }
  }

  return { success: true, message: 'Deletion workflow cancelled.' };
}

/**
 * Helper to block direct destructive API calls that do not possess a verified token
 */
export async function enforceDeletionApproval(req, res, targetType, targetId) {
  const token = req.headers['x-deletion-token'] || req.query.deletion_token || req.body?.deletionToken;

  if (!token) {
    await recordAuditLog({
      adminEmail: req.user?.email || req.headers['x-admin-email'] || 'unauthorized',
      adminName: req.user?.name || 'Direct API Caller',
      action: 'DIRECT_DELETE_BLOCKED',
      targetType,
      targetId: String(targetId),
      reason: 'Attempted one-click or unapproved deletion bypass',
      result: 'BLOCKED',
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    return res.status(403).json({
      success: false,
      code: 'DELETION_APPROVAL_REQUIRED',
      message: 'Destructive deletion blocked. VibeNoww security policy requires the mandatory 3-step deletion approval workflow. Direct API calls are not permitted.'
    });
  }

  // Token was supplied - confirm deletion
  try {
    const result = await confirmDeletion({
      token,
      targetType,
      targetId,
      confirmation: 'CONFIRM',
      adminEmail: req.user?.email || 'admin@vibenoww.com',
      adminName: req.user?.name || 'Admin',
      adminId: req.user?.id,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent']
    });
    return res.json(result);
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
}
