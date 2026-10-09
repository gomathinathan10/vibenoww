import { getDbPool, isDbConnected, memoryStore } from '../config/db.js';
import { recordAuditLog } from './deleteApprovalService.js';

/**
 * Check photographer availability across requested dates.
 * Returns { isAvailable: boolean, reason?: string, conflictingDates?: string[] }
 */
export async function checkPhotographerAvailability(photographerId, shootDates, excludeWorkCode = null) {
  const dates = Array.isArray(shootDates) ? shootDates : [shootDates];
  if (!dates || dates.length === 0) {
    return { isAvailable: true };
  }

  if (isDbConnected()) {
    const pool = getDbPool();
    const placeholders = dates.map(() => '?').join(',');
    const query = `
      SELECT date, status, work_code, block_reason 
      FROM availability 
      WHERE photographer_id = ? AND date IN (${placeholders})
    `;
    const [rows] = await pool.query(query, [photographerId, ...dates]);

    const conflicts = [];
    for (const row of rows) {
      const formattedDate = row.date instanceof Date 
        ? row.date.toISOString().split('T')[0] 
        : String(row.date).slice(0, 10);

      if (row.status === 'BOOKED' && row.work_code !== excludeWorkCode) {
        conflicts.push(`${formattedDate} (Booked for ${row.work_code || 'Another Order'})`);
      } else if (row.status === 'BLOCKED') {
        conflicts.push(`${formattedDate} (Blocked: ${row.block_reason || 'Personal Leave'})`);
      }
    }

    if (conflicts.length > 0) {
      return {
        isAvailable: false,
        reason: `Photographer has conflict on: ${conflicts.join(', ')}`,
        conflictingDates: conflicts
      };
    }
    return { isAvailable: true };
  } else {
    // Memory fallback
    const conflicts = [];
    for (const d of dates) {
      const entry = memoryStore.availability.find(
        a => a.photographer_id === photographerId && a.date === d
      );
      if (entry) {
        if (entry.status === 'BOOKED' && entry.work_code !== excludeWorkCode) {
          conflicts.push(`${d} (Booked for ${entry.work_code || 'Another Order'})`);
        } else if (entry.status === 'BLOCKED') {
          conflicts.push(`${d} (Blocked: ${entry.block_reason || 'Personal Leave'})`);
        }
      }
    }
    if (conflicts.length > 0) {
      return {
        isAvailable: false,
        reason: `Photographer has conflict on: ${conflicts.join(', ')}`,
        conflictingDates: conflicts
      };
    }
    return { isAvailable: true };
  }
}

/**
 * Transactional assignment and date locking to prevent double booking.
 */
export async function assignAndLockDates({ workCode, photographerId, photographerName, force = false }) {
  if (isDbConnected()) {
    const pool = getDbPool();
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Fetch the order
      const [orderRows] = await connection.query(
        'SELECT * FROM orders WHERE work_code = ? FOR UPDATE',
        [workCode]
      );
      if (orderRows.length === 0) {
        throw new Error(`Order with Work Code ${workCode} not found.`);
      }
      const order = orderRows[0];
      let dates = [];
      if (order.shoot_dates_json) {
        try {
          dates = JSON.parse(order.shoot_dates_json);
        } catch (e) {
          dates = [order.shoot_date ? new Date(order.shoot_date).toISOString().split('T')[0] : ''];
        }
      } else if (order.shoot_date) {
        dates = [new Date(order.shoot_date).toISOString().split('T')[0]];
      }

      // Check availability under transaction lock
      if (!force && dates.length > 0) {
        const placeholders = dates.map(() => '?').join(',');
        const [conflictRows] = await connection.query(
          `SELECT date, status, work_code, block_reason 
           FROM availability 
           WHERE photographer_id = ? AND date IN (${placeholders}) FOR UPDATE`,
          [photographerId, ...dates]
        );

        const activeConflicts = conflictRows.filter(
          r => (r.status === 'BOOKED' && r.work_code !== workCode) || r.status === 'BLOCKED'
        );

        if (activeConflicts.length > 0) {
          const conflictDetails = activeConflicts.map(c => 
            `${c.date instanceof Date ? c.date.toISOString().split('T')[0] : c.date} (${c.status})`
          ).join(', ');
          throw new Error(`Photographer is already booked or blocked on: ${conflictDetails}.`);
        }
      }

      // Release any previously locked dates for this order if photographer changed
      await connection.query(
        'DELETE FROM availability WHERE work_code = ?',
        [workCode]
      );

      // Lock new dates
      for (const d of dates) {
        if (!d) continue;
        await connection.query(
          `INSERT INTO availability (photographer_id, date, status, work_id, work_code, block_reason)
           VALUES (?, ?, 'BOOKED', ?, ?, 'Confirmed Shoot Booking')
           ON DUPLICATE KEY UPDATE status = 'BOOKED', work_id = VALUES(work_id), work_code = VALUES(work_code), block_reason = VALUES(block_reason)`,
          [photographerId, d, order.id, workCode]
        );
      }

      // Update the order assignment status
      await connection.query(
        `UPDATE orders 
         SET assigned_photographer_id = ?, assigned_photographer_name = ?, status = 'ASSIGNED', updated_at = NOW() 
         WHERE work_code = ?`,
        [photographerId, photographerName || null, workCode]
      );

      // Add activity log
      await connection.query(
        `INSERT INTO activity_logs (work_code, actor, action, details)
         VALUES (?, 'Admin', 'ASSIGN_PHOTOGRAPHER', ?)`,
        [workCode, `Assigned photographer ${photographerName || photographerId} and locked ${dates.length} shoot date(s).`]
      );

      try {
        await recordAuditLog({
          adminId: '1',
          adminEmail: 'admin@vibenoww.com',
          adminName: 'VibeNoww Admin',
          action: 'ORDER_ASSIGNED',
          targetType: 'order',
          targetId: workCode,
          targetDetails: { workCode, photographerId, photographerName, datesLocked: dates },
          reason: `Assigned shoot to ${photographerName || photographerId}`
        });
      } catch (aErr) {
        console.warn('Audit log write notice:', aErr.message);
      }

      // Add notification
      await connection.query(
        `INSERT INTO notifications (title, message, type, work_code)
         VALUES (?, ?, 'ASSIGNMENT', ?)`,
        [
          `Photographer Assigned: ${workCode}`,
          `${photographerName || 'Photographer'} has been assigned to order ${workCode}.`,
          workCode
        ]
      );

      await connection.commit();
      return { success: true, workCode, photographerId, datesLocked: dates };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } else {
    // Memory fallback logic
    const order = memoryStore.orders.find(o => o.workCode === workCode);
    if (!order) throw new Error(`Order ${workCode} not found.`);

    const dates = order.shootDates || [order.shootDate];
    if (!force) {
      const availCheck = await checkPhotographerAvailability(photographerId, dates, workCode);
      if (!availCheck.isAvailable) {
        throw new Error(availCheck.reason);
      }
    }

    // Remove previous locks
    memoryStore.availability = memoryStore.availability.filter(a => a.work_code !== workCode);

    // Add new locks
    for (const d of dates) {
      memoryStore.availability.push({
        id: Date.now() + Math.random(),
        photographer_id: photographerId,
        date: d,
        status: 'BOOKED',
        work_id: order.id,
        work_code: workCode,
        block_reason: 'Confirmed Shoot Booking'
      });
    }

    order.assignedPhotographerId = photographerId;
    order.assignedPhotographerName = photographerName;
    order.status = 'ASSIGNED';

    memoryStore.activityLogs.push({
      id: Date.now(),
      work_code: workCode,
      actor: 'Admin',
      action: 'ASSIGN_PHOTOGRAPHER',
      details: `Assigned ${photographerName || photographerId}`,
      created_at: new Date()
    });

    return { success: true, workCode, photographerId, datesLocked: dates };
  }
}
