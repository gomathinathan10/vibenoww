import express from 'express';
import { getDbPool, isDbConnected, memoryStore } from '../config/db.js';
import { checkPhotographerAvailability } from '../services/availabilityService.js';

const router = express.Router();

/**
 * GET /api/availability
 * Fetch availability matrix and records
 */
router.get('/', async (req, res) => {
  try {
    const { photographerId, startDate, endDate } = req.query;

    if (isDbConnected()) {
      const pool = getDbPool();
      let query = `
        SELECT a.*, p.name AS photographer_name, p.studio_name 
        FROM availability a
        JOIN photographers p ON a.photographer_id = p.id
        WHERE 1=1
      `;
      const params = [];

      if (photographerId) {
        query += ' AND a.photographer_id = ?';
        params.push(photographerId);
      }
      if (startDate) {
        query += ' AND a.date >= ?';
        params.push(startDate);
      }
      if (endDate) {
        query += ' AND a.date <= ?';
        params.push(endDate);
      }

      query += ' ORDER BY a.date ASC';
      const [rows] = await pool.query(query, params);

      const formatted = rows.map(r => ({
        id: r.id,
        photographerId: r.photographer_id,
        photographerName: r.photographer_name,
        date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : r.date,
        status: r.status,
        workId: r.work_id,
        workCode: r.work_code,
        blockReason: r.block_reason
      }));

      return res.json({ success: true, data: formatted });
    } else {
      let result = [...memoryStore.availability];
      if (photographerId) {
        result = result.filter(a => a.photographer_id === photographerId);
      }
      return res.json({ success: true, data: result });
    }
  } catch (error) {
    console.error('Error fetching availability:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve availability' });
  }
});

/**
 * POST /api/availability/check
 * Check conflicts for specific photographer and dates
 */
router.post('/check', async (req, res) => {
  try {
    const { photographerId, dates, excludeWorkCode } = req.body;
    if (!photographerId || !dates) {
      return res.status(400).json({ success: false, message: 'Photographer ID and dates are required' });
    }
    const result = await checkPhotographerAvailability(photographerId, dates, excludeWorkCode);
    return res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error checking availability:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/availability/block
 * Set blackout / personal block dates
 */
router.post('/block', async (req, res) => {
  try {
    const { photographerId, date, reason = 'Personal Leave' } = req.body;
    if (!photographerId || !date) {
      return res.status(400).json({ success: false, message: 'Photographer ID and date are required' });
    }

    if (isDbConnected()) {
      const pool = getDbPool();
      await pool.query(
        `INSERT INTO availability (photographer_id, date, status, block_reason)
         VALUES (?, ?, 'BLOCKED', ?)
         ON DUPLICATE KEY UPDATE status = 'BLOCKED', block_reason = VALUES(block_reason)`,
        [photographerId, date, reason]
      );
      return res.json({ success: true, message: `Date ${date} blocked successfully` });
    } else {
      const existingIdx = memoryStore.availability.findIndex(
        a => a.photographer_id === photographerId && a.date === date
      );
      if (existingIdx >= 0) {
        memoryStore.availability[existingIdx].status = 'BLOCKED';
        memoryStore.availability[existingIdx].block_reason = reason;
      } else {
        memoryStore.availability.push({
          id: Date.now(),
          photographer_id: photographerId,
          date,
          status: 'BLOCKED',
          block_reason: reason
        });
      }
      return res.json({ success: true, message: `Date ${date} blocked successfully` });
    }
  } catch (error) {
    console.error('Error blocking date:', error);
    return res.status(500).json({ success: false, message: 'Failed to block date' });
  }
});

/**
 * DELETE /api/availability/block
 * Remove block / make available
 */
router.delete('/block', async (req, res) => {
  try {
    const { photographerId, date } = req.body;
    if (!photographerId || !date) {
      return res.status(400).json({ success: false, message: 'Photographer ID and date are required' });
    }

    if (isDbConnected()) {
      const pool = getDbPool();
      await pool.query(
        'DELETE FROM availability WHERE photographer_id = ? AND date = ? AND status = "BLOCKED"',
        [photographerId, date]
      );
      return res.json({ success: true, message: `Block for ${date} removed successfully` });
    } else {
      memoryStore.availability = memoryStore.availability.filter(
        a => !(a.photographer_id === photographerId && a.date === date && a.status === 'BLOCKED')
      );
      return res.json({ success: true, message: `Block for ${date} removed successfully` });
    }
  } catch (error) {
    console.error('Error unblocking date:', error);
    return res.status(500).json({ success: false, message: 'Failed to unblock date' });
  }
});

export default router;
