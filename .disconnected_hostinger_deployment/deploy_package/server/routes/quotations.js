import express from 'express';
import { getDbPool, isDbConnected, memoryStore } from '../config/db.js';

const router = express.Router();

/**
 * GET /api/quotations
 * List all quotations with workCode, photographer details, and studio margins
 */
router.get('/', async (req, res) => {
  try {
    const { workCode } = req.query;

    if (isDbConnected()) {
      const pool = getDbPool();
      let query = `
        SELECT q.*, o.customer_name, o.shoot_type, o.shoot_date, p.name AS photographer_name
        FROM quotations q
        JOIN orders o ON q.work_id = o.id
        LEFT JOIN photographers p ON q.photographer_id = p.id
        WHERE 1=1
      `;
      const params = [];
      if (workCode) {
        query += ' AND q.work_code = ?';
        params.push(workCode);
      }
      query += ' ORDER BY q.created_at DESC';

      const [rows] = await pool.query(query, params);
      const formatted = rows.map(r => ({
        id: r.id,
        workId: r.work_id,
        workCode: r.work_code,
        customerName: r.customer_name,
        shootType: r.shoot_type,
        shootDate: r.shoot_date instanceof Date ? r.shoot_date.toISOString().split('T')[0] : r.shoot_date,
        photographerId: r.photographer_id,
        photographerName: r.photographer_name,
        photographerCost: Number(r.photographer_cost) || 0,
        customerPrice: Number(r.customer_price) || 0,
        studioMargin: Number(r.studio_margin) || 0,
        status: r.status,
        deliverables: r.deliverables,
        notes: r.notes,
        createdAt: r.created_at,
        updatedAt: r.updated_at
      }));

      return res.json({ success: true, data: formatted });
    } else {
      let result = [...memoryStore.quotations];
      if (workCode) {
        result = result.filter(q => q.workCode === workCode);
      }
      return res.json({ success: true, data: result });
    }
  } catch (error) {
    console.error('Error fetching quotations:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve quotations' });
  }
});

/**
 * POST /api/quotations
 * Create or update quotation for workCode
 */
router.post('/', async (req, res) => {
  try {
    const {
      workCode,
      photographerId,
      photographerCost = 0,
      customerPrice = 0,
      deliverables,
      notes,
      status = 'DRAFT'
    } = req.body;

    if (!workCode) {
      return res.status(400).json({ success: false, message: 'workCode is required' });
    }

    const pCost = Number(photographerCost) || 0;
    const cPrice = Number(customerPrice) || 0;
    const margin = Math.max(0, cPrice - pCost);

    if (isDbConnected()) {
      const pool = getDbPool();
      const [orderRows] = await pool.query('SELECT id FROM orders WHERE work_code = ? LIMIT 1', [workCode]);
      if (orderRows.length === 0) {
        return res.status(404).json({ success: false, message: `Order ${workCode} not found` });
      }
      const workId = orderRows[0].id;

      const [existing] = await pool.query('SELECT id FROM quotations WHERE work_code = ? LIMIT 1', [workCode]);

      if (existing.length > 0) {
        await pool.query(
          `UPDATE quotations 
           SET photographer_id = ?, photographer_cost = ?, customer_price = ?, studio_margin = ?,
               deliverables = ?, notes = ?, status = ?, updated_at = NOW()
           WHERE work_code = ?`,
          [photographerId || null, pCost, cPrice, margin, deliverables || null, notes || null, status, workCode]
        );
      } else {
        await pool.query(
          `INSERT INTO quotations (
            work_id, work_code, photographer_id, photographer_cost,
            customer_price, studio_margin, status, deliverables, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [workId, workCode, photographerId || null, pCost, cPrice, margin, status, deliverables || null, notes || null]
        );
      }

      // Update order status if quotation is sent/quoted
      if (status === 'SENT' || status === 'ACCEPTED') {
        await pool.query('UPDATE orders SET status = "QUOTED", updated_at = NOW() WHERE work_code = ?', [workCode]);
      }

      await pool.query(
        `INSERT INTO activity_logs (work_code, actor, action, details)
         VALUES (?, 'Admin', 'QUOTATION_SAVED', ?)`,
        [workCode, `Quotation saved: Photographer Cost: ₹${pCost.toLocaleString('en-IN')}, Customer Price: ₹${cPrice.toLocaleString('en-IN')}, Margin: ₹${margin.toLocaleString('en-IN')}`]
      );

      return res.json({
        success: true,
        message: 'Quotation saved successfully',
        data: { workCode, photographerCost: pCost, customerPrice: cPrice, studioMargin: margin, status }
      });
    } else {
      const existingIdx = memoryStore.quotations.findIndex(q => q.workCode === workCode);
      const qObj = {
        id: Date.now(),
        workCode,
        photographerId,
        photographerCost: pCost,
        customerPrice: cPrice,
        studioMargin: margin,
        deliverables,
        notes,
        status,
        updatedAt: new Date()
      };
      if (existingIdx >= 0) {
        memoryStore.quotations[existingIdx] = { ...memoryStore.quotations[existingIdx], ...qObj };
      } else {
        memoryStore.quotations.push(qObj);
      }
      return res.json({ success: true, data: qObj });
    }
  } catch (error) {
    console.error('Error saving quotation:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to save quotation' });
  }
});

export default router;
