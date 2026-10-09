import express from 'express';
import { query } from '../db.js';

const router = express.Router();

// Get reviews (optionally for a creator)
router.get('/', async (req, res) => {
  try {
    const { creator_id } = req.query;
    let sql = 'SELECT * FROM reviews WHERE is_approved = TRUE';
    const params = [];

    if (creator_id) {
      sql += ' AND creator_id = ?';
      params.push(parseInt(creator_id, 10));
    }

    sql += ' ORDER BY created_at DESC';

    const reviews = await query(sql, params);
    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (err) {
    console.error('Fetch reviews error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews.' });
  }
});

// Post a review
router.post('/', async (req, res) => {
  try {
    const { creatorId, clientName, rating, comment, eventType = 'Event' } = req.body;

    if (!creatorId || !clientName || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Creator ID, client name, rating, and comment are required.' });
    }

    const result = await query(
      'INSERT INTO reviews (creator_id, client_name, rating, comment, event_type, is_approved) VALUES (?, ?, ?, ?, ?, TRUE)',
      [parseInt(creatorId, 10), clientName, parseFloat(rating), comment, eventType]
    );

    // Recalculate average rating & review count for creator
    const stats = await query(
      'SELECT AVG(rating) as avg_rating, COUNT(id) as total_reviews FROM reviews WHERE creator_id = ? AND is_approved = TRUE',
      [parseInt(creatorId, 10)]
    );

    if (stats && stats.length > 0) {
      const avg = parseFloat(stats[0].avg_rating || 5.0).toFixed(1);
      const count = stats[0].total_reviews || 1;
      await query('UPDATE creators SET rating = ?, review_count = ? WHERE id = ?', [avg, count, parseInt(creatorId, 10)]);
    }

    res.status(201).json({ success: true, message: 'Review submitted successfully!', reviewId: result.insertId });
  } catch (err) {
    console.error('Create review error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit review.' });
  }
});

export default router;
