import express from 'express';
import { getDbPool, isDbConnected, memoryStore } from '../config/db.js';
import { generateUniqueWorkCode } from '../services/vnCodeService.js';
import { assignAndLockDates } from '../services/availabilityService.js';

const router = express.Router();

/**
 * GET /api/orders
 * Fetch all orders with optional filtering by status, search query, or photographer
 */
router.get('/', async (req, res) => {
  try {
    const { status, search, photographerId } = req.query;

    if (isDbConnected()) {
      const pool = getDbPool();
      let query = 'SELECT * FROM orders WHERE 1=1';
      const params = [];

      if (status && status !== 'ALL') {
        query += ' AND status = ?';
        params.push(status);
      }
      if (photographerId) {
        query += ' AND assigned_photographer_id = ?';
        params.push(photographerId);
      }
      if (search) {
        query += ' AND (work_code LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ? OR location LIKE ?)';
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern, searchPattern);
      }

      query += ' ORDER BY created_at DESC';
      const [rows] = await pool.query(query, params);

      const formatted = rows.map(r => ({
        id: r.id,
        workCode: r.work_code,
        customerName: r.customer_name,
        customerPhone: r.customer_phone,
        customerEmail: r.customer_email,
        eventType: r.shoot_type,
        shootType: r.shoot_type,
        shootDate: r.shoot_date instanceof Date ? r.shoot_date.toISOString().split('T')[0] : r.shoot_date,
        shootEndDate: r.shoot_end_date instanceof Date ? r.shoot_end_date.toISOString().split('T')[0] : r.shoot_end_date,
        shootDates: r.shoot_dates_json ? JSON.parse(r.shoot_dates_json) : [r.shoot_date],
        shootTime: r.shoot_time,
        shootLocation: r.location,
        location: r.location,
        requiredServices: r.requirements ? r.requirements.split(',').map(s => s.trim()) : [],
        customerMessage: r.customer_notes,
        status: r.status,
        estimatedBudget: Number(r.estimated_budget) || 0,
        assignedPhotographerId: r.assigned_photographer_id,
        assignedPhotographerName: r.assigned_photographer_name,
        durationDays: r.duration_days,
        durationHours: r.duration_hours,
        numberOfPeople: r.number_of_people,
        createdAt: r.created_at,
        updatedAt: r.updated_at
      }));

      return res.json({ success: true, data: formatted });
    } else {
      let result = [...memoryStore.orders];
      if (status && status !== 'ALL') {
        result = result.filter(o => o.status === status);
      }
      if (photographerId) {
        result = result.filter(o => o.assignedPhotographerId === photographerId);
      }
      if (search) {
        const s = search.toLowerCase();
        result = result.filter(o => 
          (o.workCode && o.workCode.toLowerCase().includes(s)) ||
          (o.customerName && o.customerName.toLowerCase().includes(s)) ||
          (o.customerPhone && o.customerPhone.includes(s)) ||
          (o.location && o.location.toLowerCase().includes(s))
        );
      }
      return res.json({ success: true, data: result });
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve orders' });
  }
});

/**
 * POST /api/orders
 * Create a new order (from website booking, multi-day booking, or admin manual entry)
 * Safe unique VN-##### code generated on backend
 */
router.post('/', async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      shootType,
      eventType,
      shootDate,
      shootEndDate,
      shootDates,
      shootTime,
      location,
      shootLocation,
      requirements,
      requiredServices,
      estimatedBudget,
      durationDays = 1,
      durationHours,
      numberOfPeople,
      customerNotes,
      customerMessage,
      assignedPhotographerId,
      assignedPhotographerName
    } = req.body;

    if (!customerName || !customerPhone || (!shootDate && (!shootDates || shootDates.length === 0))) {
      return res.status(400).json({
        success: false,
        message: 'Customer name, phone, and shoot date are required'
      });
    }

    const workCode = await generateUniqueWorkCode();
    const finalShootType = shootType || eventType || 'Photography Shoot';
    const finalLocation = location || shootLocation || 'Client Location';
    const datesArray = shootDates && shootDates.length > 0 ? shootDates : [shootDate];
    const primaryShootDate = datesArray[0] || shootDate;
    const finalEndDate = shootEndDate || datesArray[datesArray.length - 1] || primaryShootDate;
    const finalReqs = requiredServices ? requiredServices.join(', ') : (requirements || '');
    const finalNotes = customerNotes || customerMessage || '';

    if (isDbConnected()) {
      const pool = getDbPool();
      const [result] = await pool.query(
        `INSERT INTO orders (
          work_code, customer_name, customer_phone, customer_email,
          shoot_type, shoot_date, shoot_end_date, shoot_dates_json,
          shoot_time, location, requirements, status, estimated_budget,
          assigned_photographer_id, assigned_photographer_name,
          duration_days, duration_hours, number_of_people, customer_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          workCode,
          customerName,
          customerPhone,
          customerEmail || null,
          finalShootType,
          primaryShootDate,
          finalEndDate,
          JSON.stringify(datesArray),
          shootTime || 'Full Day',
          finalLocation,
          finalReqs,
          assignedPhotographerId ? 'ASSIGNED' : 'NEW',
          Number(estimatedBudget) || 0,
          assignedPhotographerId || null,
          assignedPhotographerName || null,
          durationDays || datesArray.length,
          durationHours || 'Full Day',
          numberOfPeople || 'Standard',
          finalNotes
        ]
      );

      // Create notification for admin
      await pool.query(
        `INSERT INTO notifications (title, message, type, work_code)
         VALUES (?, ?, 'NEW_ORDER', ?)`,
        [
          `New Shoot Request: ${workCode}`,
          `New enquiry for ${finalShootType} from ${customerName} (${customerPhone}).`,
          workCode
        ]
      );

      // Create initial activity log
      await pool.query(
        `INSERT INTO activity_logs (work_code, actor, action, details)
         VALUES (?, 'Website Customer', 'ORDER_CREATED', ?)`,
        [workCode, `Order initiated for ${finalShootType} on ${primaryShootDate}.`]
      );

      // If assigned directly, lock dates
      if (assignedPhotographerId) {
        await assignAndLockDates({
          workCode,
          photographerId: assignedPhotographerId,
          photographerName: assignedPhotographerName,
          force: false
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: {
          id: result.insertId,
          workCode,
          customerName,
          customerPhone,
          shootType: finalShootType,
          shootDate: primaryShootDate,
          shootDates: datesArray,
          location: finalLocation,
          status: assignedPhotographerId ? 'ASSIGNED' : 'NEW'
        }
      });
    } else {
      const newOrder = {
        id: Date.now(),
        workCode,
        customerName,
        customerPhone,
        customerEmail,
        eventType: finalShootType,
        shootType: finalShootType,
        shootDate: primaryShootDate,
        shootEndDate: finalEndDate,
        shootDates: datesArray,
        shootTime: shootTime || 'Full Day',
        shootLocation: finalLocation,
        location: finalLocation,
        requiredServices: Array.isArray(requiredServices) ? requiredServices : [finalReqs],
        customerMessage: finalNotes,
        status: assignedPhotographerId ? 'ASSIGNED' : 'NEW',
        estimatedBudget: Number(estimatedBudget) || 0,
        assignedPhotographerId: assignedPhotographerId || null,
        assignedPhotographerName: assignedPhotographerName || null,
        durationDays: durationDays || datesArray.length,
        durationHours: durationHours || 'Full Day',
        numberOfPeople: numberOfPeople || 'Standard',
        createdAt: new Date().toISOString()
      };

      memoryStore.orders.unshift(newOrder);
      memoryStore.notifications.unshift({
        id: Date.now(),
        title: `New Shoot Request: ${workCode}`,
        message: `New enquiry for ${finalShootType} from ${customerName}`,
        type: 'NEW_ORDER',
        work_code: workCode,
        is_read: false,
        created_at: new Date()
      });

      return res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: newOrder
      });
    }
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to create order' });
  }
});

/**
 * GET /api/orders/:code
 * Get single order with dossier information (quotations, payments, logs)
 */
router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;

    if (isDbConnected()) {
      const pool = getDbPool();
      const [rows] = await pool.query('SELECT * FROM orders WHERE work_code = ? OR id = ? LIMIT 1', [code, code]);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      const r = rows[0];
      const actualCode = r.work_code;
      const [quotationRows] = await pool.query('SELECT * FROM quotations WHERE work_code = ? LIMIT 1', [actualCode]);
      const [paymentRows] = await pool.query('SELECT * FROM payments WHERE work_code = ? ORDER BY paid_at ASC', [actualCode]);
      const [logRows] = await pool.query('SELECT * FROM activity_logs WHERE work_code = ? ORDER BY created_at DESC', [actualCode]);

      const dossier = {
        id: r.id,
        workCode: r.work_code,
        customerName: r.customer_name,
        customerPhone: r.customer_phone,
        customerEmail: r.customer_email,
        eventType: r.shoot_type,
        shootType: r.shoot_type,
        shootDate: r.shoot_date instanceof Date ? r.shoot_date.toISOString().split('T')[0] : r.shoot_date,
        shootEndDate: r.shoot_end_date instanceof Date ? r.shoot_end_date.toISOString().split('T')[0] : r.shoot_end_date,
        shootDates: r.shoot_dates_json ? JSON.parse(r.shoot_dates_json) : [r.shoot_date],
        shootTime: r.shoot_time,
        shootLocation: r.location,
        location: r.location,
        requiredServices: r.requirements ? r.requirements.split(',').map(s => s.trim()) : [],
        customerMessage: r.customer_notes,
        status: r.status,
        estimatedBudget: Number(r.estimated_budget) || 0,
        assignedPhotographerId: r.assigned_photographer_id,
        assignedPhotographerName: r.assigned_photographer_name,
        durationDays: r.duration_days,
        durationHours: r.duration_hours,
        numberOfPeople: r.number_of_people,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        quotation: quotationRows[0] || null,
        payments: paymentRows || [],
        activityLogs: logRows || []
      };

      return res.json({ success: true, data: dossier });
    } else {
      const order = memoryStore.orders.find(o => o.workCode === code || String(o.id) === String(code));
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      return res.json({ success: true, data: order });
    }
  } catch (error) {
    console.error('Error fetching order dossier:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve order' });
  }
});

/**
 * POST /api/orders/:code/assign
 * Assign photographer with transaction lock and conflict validation
 */
router.post('/:code/assign', async (req, res) => {
  try {
    const { code } = req.params;
    const { photographerId, photographerName, force = false } = req.body;

    if (!photographerId) {
      return res.status(400).json({ success: false, message: 'Photographer ID is required' });
    }

    let actualWorkCode = code;
    if (isDbConnected()) {
      const pool = getDbPool();
      const [orderRows] = await pool.query('SELECT work_code FROM orders WHERE work_code = ? OR id = ? LIMIT 1', [code, code]);
      if (orderRows.length > 0) {
        actualWorkCode = orderRows[0].work_code;
      }
    } else {
      const order = memoryStore.orders.find(o => o.workCode === code || String(o.id) === String(code));
      if (order) actualWorkCode = order.workCode;
    }

    const result = await assignAndLockDates({
      workCode: actualWorkCode,
      photographerId,
      photographerName,
      force
    });

    return res.json({
      success: true,
      message: 'Photographer assigned and dates locked successfully',
      data: result
    });
  } catch (error) {
    console.error('Assignment error:', error.message);
    return res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * PUT /api/orders/:code/status
 * Update order lifecycle status
 */
router.put('/:code/status', async (req, res) => {
  try {
    const { code } = req.params;
    const { status, reason, notes, actor = 'Admin' } = req.body;
    const finalReason = notes || reason || '';

    const validStatuses = ['NEW', 'PENDING', 'ASSIGNED', 'QUOTED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'INCOMPLETE', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status: ${status}` });
    }

    if (isDbConnected()) {
      const pool = getDbPool();
      const [orderRows] = await pool.query('SELECT * FROM orders WHERE work_code = ? OR id = ? LIMIT 1', [code, code]);
      if (orderRows.length === 0) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      const order = orderRows[0];
      const actualWorkCode = order.work_code;

      await pool.query('UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?', [status, order.id]);

      await pool.query(
        `INSERT INTO activity_logs (work_code, actor, action, details)
         VALUES (?, ?, 'STATUS_UPDATE', ?)`,
        [actualWorkCode, actor, `Status changed to ${status}. ${finalReason}`]
      );

      await pool.query(
        `INSERT INTO notifications (title, message, type, work_code)
         VALUES (?, ?, 'STATUS_CHANGE', ?)`,
        [
          `Order Status: ${actualWorkCode} is now ${status}`,
          `Order ${actualWorkCode} updated to ${status}.`,
          actualWorkCode
        ]
      );

      return res.json({ success: true, message: `Status updated to ${status}` });
    } else {
      const order = memoryStore.orders.find(o => o.workCode === code || String(o.id) === String(code));
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
      order.status = status;
      return res.json({ success: true, message: `Status updated to ${status}` });
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
});

/**
 * POST /api/orders/:code/quotation
 * Submit proposal quote for an order
 */
router.post('/:code/quotation', async (req, res) => {
  try {
    const { code } = req.params;
    const quotationData = req.body;

    if (isDbConnected()) {
      const pool = getDbPool();
      const [orderRows] = await pool.query('SELECT * FROM orders WHERE work_code = ? OR id = ? LIMIT 1', [code, code]);
      if (orderRows.length === 0) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      const order = orderRows[0];
      const actualWorkCode = order.work_code;
      const workId = order.id;
      const photographerId = order.assigned_photographer_id || quotationData.photographerId || null;

      const pCost = Number(quotationData.photographyCharge || quotationData.photographerCost || quotationData.finalAmount || 0);
      const cPrice = Number(quotationData.finalAmount || quotationData.customerPrice || pCost);
      const margin = Math.max(0, cPrice - pCost);
      const notes = quotationData.quotationNotes || quotationData.notes || '';
      const deliverables = typeof quotationData.deliverables === 'string' ? quotationData.deliverables : JSON.stringify(quotationData.deliverables || []);

      const [existing] = await pool.query('SELECT id FROM quotations WHERE work_code = ? LIMIT 1', [actualWorkCode]);
      if (existing.length > 0) {
        await pool.query(
          `UPDATE quotations 
           SET photographer_id = ?, photographer_cost = ?, customer_price = ?, studio_margin = ?,
               deliverables = ?, notes = ?, status = 'SENT', updated_at = NOW()
           WHERE work_code = ?`,
          [photographerId, pCost, cPrice, margin, deliverables, notes, actualWorkCode]
        );
      } else {
        await pool.query(
          `INSERT INTO quotations (
            work_id, work_code, photographer_id, photographer_cost,
            customer_price, studio_margin, status, deliverables, notes
          ) VALUES (?, ?, ?, ?, ?, ?, 'SENT', ?, ?)`,
          [workId, actualWorkCode, photographerId, pCost, cPrice, margin, deliverables, notes]
        );
      }

      await pool.query('UPDATE orders SET status = "QUOTED", estimated_budget = ?, updated_at = NOW() WHERE id = ?', [cPrice, workId]);

      await pool.query(
        `INSERT INTO activity_logs (work_code, actor, action, details)
         VALUES (?, 'Creator', 'QUOTATION_SUBMITTED', ?)`,
        [actualWorkCode, `Proposal quotation submitted: ₹${cPrice.toLocaleString('en-IN')}`]
      );

      return res.json({
        success: true,
        message: 'Quotation submitted successfully',
        data: { workCode: actualWorkCode, finalAmount: cPrice }
      });
    } else {
      const order = memoryStore.orders.find(o => o.workCode === code || String(o.id) === String(code));
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
      order.status = 'QUOTED';
      order.quotation = quotationData;
      return res.json({ success: true, message: 'Quotation submitted', data: quotationData });
    }
  } catch (error) {
    console.error('Error submitting quotation:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to submit quotation' });
  }
});

export default router;
