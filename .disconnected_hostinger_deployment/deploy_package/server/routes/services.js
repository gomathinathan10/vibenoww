import express from 'express';
import { query } from '../db.js';

const router = express.Router();

// Get all services
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let sql = 'SELECT * FROM services WHERE is_active = TRUE';
    const params = [];

    if (category && category !== 'all') {
      sql += ' AND category = ?';
      params.push(category);
    }

    sql += ' ORDER BY id ASC';

    const services = await query(sql, params);
    res.json({ success: true, count: services.length, data: services });
  } catch (err) {
    console.error('Fetch services error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch services.' });
  }
});

// Create service
router.post('/', async (req, res) => {
  try {
    const { title, category, icon, description, startingPrice = 5000, priceUnit = 'package' } = req.body;

    if (!title || !category) {
      return res.status(400).json({ success: false, message: 'Title and category are required.' });
    }

    const result = await query(
      'INSERT INTO services (title, category, icon, description, starting_price, price_unit) VALUES (?, ?, ?, ?, ?, ?)',
      [title, category, icon, description, startingPrice, priceUnit]
    );

    res.status(201).json({ success: true, message: 'Service created.', serviceId: result.insertId });
  } catch (err) {
    console.error('Create service error:', err);
    res.status(500).json({ success: false, message: 'Failed to create service.' });
  }
});

// Delete service
router.delete('/:id', async (req, res) => {
  try {
    const serviceId = parseInt(req.params.id, 10);
    await query('UPDATE services SET is_active = FALSE WHERE id = ?', [serviceId]);
    res.json({ success: true, message: 'Service removed.' });
  } catch (err) {
    console.error('Delete service error:', err);
    res.status(500).json({ success: false, message: 'Failed to remove service.' });
  }
});

export default router;
