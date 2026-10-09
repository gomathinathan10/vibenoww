import express from 'express';
import { query } from '../db.js';

const router = express.Router();

// Get all inquiries
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let sql = 'SELECT * FROM inquiries WHERE 1=1';
    const params = [];

    if (status && status !== 'all') {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC';

    const inquiries = await query(sql, params);
    res.json({ success: true, count: inquiries.length, data: inquiries });
  } catch (err) {
    console.error('Fetch inquiries error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch inquiries.' });
  }
});

// Submit new contact / concierge inquiry
router.post('/', async (req, res) => {
  try {
    const {
      name,
      email,
      phone = '',
      eventType = 'General Inquiry',
      budget = '',
      preferredDate = '',
      message
    } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
    }

    const result = await query(
      `INSERT INTO inquiries (name, email, phone, event_type, budget, preferred_date, message, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'new')`,
      [name, email, phone, eventType, budget, preferredDate, message]
    );

    res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully! Our concierge team will reach out promptly.',
      inquiryId: result.insertId
    });
  } catch (err) {
    console.error('Create inquiry error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit inquiry.' });
  }
});

// Update inquiry status
router.put('/:id/status', async (req, res) => {
  try {
    const inquiryId = parseInt(req.params.id, 10);
    const { status } = req.body;

    await query('UPDATE inquiries SET status = ? WHERE id = ?', [status, inquiryId]);
    res.json({ success: true, message: 'Inquiry status updated.' });
  } catch (err) {
    console.error('Update inquiry error:', err);
    res.status(500).json({ success: false, message: 'Failed to update inquiry.' });
  }
});

// Delete inquiry
router.delete('/:id', async (req, res) => {
  try {
    const inquiryId = parseInt(req.params.id, 10);
    await query('DELETE FROM inquiries WHERE id = ?', [inquiryId]);
    res.json({ success: true, message: 'Inquiry deleted successfully.' });
  } catch (err) {
    console.error('Delete inquiry error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete inquiry.' });
  }
});

export default router;
