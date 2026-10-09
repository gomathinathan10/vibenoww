import express from 'express';
import { getDbPool, isDbConnected, memoryStore } from '../config/db.js';

const router = express.Router();

/**
 * GET /api/payments
 * List payment records with work code filtering
 */
router.get('/', async (req, res) => {
  try {
    const { workCode } = req.query;

    if (isDbConnected()) {
      const pool = getDbPool();
      let query = `
        SELECT p.*, o.customer_name, o.shoot_type 
        FROM payments p
        JOIN orders o ON p.work_id = o.id
        WHERE 1=1
      `;
      const params = [];
      if (workCode) {
        query += ' AND p.work_code = ?';
        params.push(workCode);
      }
      query += ' ORDER BY p.paid_at DESC';

      const [rows] = await pool.query(query, params);
      const formatted = rows.map(r => ({
        id: r.id,
        workId: r.work_id,
        workCode: r.work_code,
        customerName: r.customer_name,
        shootType: r.shoot_type,
        amount: Number(r.amount) || 0,
        paymentType: r.payment_type,
        paymentStatus: r.payment_status,
        transactionReference: r.transaction_reference,
        paymentMethod: r.payment_method,
        notes: r.notes,
        paidAt: r.paid_at,
        createdAt: r.created_at
      }));

      return res.json({ success: true, data: formatted });
    } else {
      let result = [...memoryStore.payments];
      if (workCode) {
        result = result.filter(p => p.workCode === workCode);
      }
      return res.json({ success: true, data: result });
    }
  } catch (error) {
    console.error('Error fetching payments:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve payments' });
  }
});

/**
 * POST /api/payments
 * Record a payment against an order
 */
router.post('/', async (req, res) => {
  try {
    const {
      workCode,
      amount,
      paymentType = 'ADVANCE',
      paymentStatus = 'PAID',
      transactionReference,
      paymentMethod = 'UPI / Bank Transfer',
      notes
    } = req.body;

    if (!workCode || !amount) {
      return res.status(400).json({ success: false, message: 'workCode and amount are required' });
    }

    const numAmount = Number(amount);

    if (isDbConnected()) {
      const pool = getDbPool();
      const [orderRows] = await pool.query('SELECT id, status FROM orders WHERE work_code = ? LIMIT 1', [workCode]);
      if (orderRows.length === 0) {
        return res.status(404).json({ success: false, message: `Order ${workCode} not found` });
      }
      const order = orderRows[0];
      const ref = transactionReference || `TXN-${Date.now().toString().slice(-6)}`;

      const [result] = await pool.query(
        `INSERT INTO payments (
          work_id, work_code, amount, payment_type, payment_status,
          transaction_reference, payment_method, notes, paid_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [order.id, workCode, numAmount, paymentType, paymentStatus, ref, paymentMethod, notes || null]
      );

      // If advance received and order was QUOTED/ASSIGNED, move to CONFIRMED
      if (paymentStatus === 'PAID' && (order.status === 'QUOTED' || order.status === 'ASSIGNED' || order.status === 'NEW')) {
        await pool.query('UPDATE orders SET status = "CONFIRMED", updated_at = NOW() WHERE id = ?', [order.id]);
      }

      await pool.query(
        `INSERT INTO activity_logs (work_code, actor, action, details)
         VALUES (?, 'Payment Gateway', 'PAYMENT_RECORDED', ?)`,
        [workCode, `Payment of ₹${numAmount.toLocaleString('en-IN')} (${paymentType}) recorded. Ref: ${ref}`]
      );

      await pool.query(
        `INSERT INTO notifications (title, message, type, work_code)
         VALUES (?, ?, 'PAYMENT', ?)`,
        [
          `Payment Received: ${workCode}`,
          `₹${numAmount.toLocaleString('en-IN')} received for ${workCode}.`,
          workCode
        ]
      );

      return res.status(201).json({
        success: true,
        message: 'Payment recorded successfully',
        data: {
          id: result.insertId,
          workCode,
          amount: numAmount,
          transactionReference: ref,
          paymentType,
          paymentStatus
        }
      });
    } else {
      const paymentObj = {
        id: Date.now(),
        workCode,
        amount: numAmount,
        paymentType,
        paymentStatus,
        transactionReference: transactionReference || `TXN-${Date.now().toString().slice(-6)}`,
        paymentMethod,
        notes,
        paidAt: new Date().toISOString()
      };
      memoryStore.payments.push(paymentObj);

      const order = memoryStore.orders.find(o => o.workCode === workCode);
      if (order && (order.status === 'QUOTED' || order.status === 'ASSIGNED' || order.status === 'NEW')) {
        order.status = 'CONFIRMED';
      }

      return res.status(201).json({ success: true, data: paymentObj });
    }
  } catch (error) {
    console.error('Error recording payment:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to record payment' });
  }
});

export default router;
