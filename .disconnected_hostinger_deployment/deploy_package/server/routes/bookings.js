import express from 'express';
import { query } from '../db.js';

const router = express.Router();

// Helper to generate unique order numbers (e.g. VIBE-2026-8942)
function generateOrderNumber() {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const year = new Date().getFullYear();
  return `VIBE-${year}-${randomNum}`;
}

// Get all bookings / orders (with creatorId filter support)
router.get('/', async (req, res) => {
  try {
    const { status, search, creatorId } = req.query;

    let sql = `
      SELECT b.*, c.name as creator_name, c.avatar as creator_avatar, c.title as creator_title
      FROM bookings b
      LEFT JOIN creators c ON b.creator_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (creatorId && creatorId !== 'all') {
      sql += ' AND b.creator_id = ?';
      params.push(parseInt(creatorId, 10));
    }

    if (status && status !== 'all') {
      sql += ' AND b.status = ?';
      params.push(status);
    }

    if (search) {
      sql += ' AND (b.order_number LIKE ? OR b.client_name LIKE ? OR b.client_email LIKE ? OR b.service_name LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    sql += ' ORDER BY b.created_at DESC';

    const bookings = await query(sql, params);

    const formatted = bookings.map(b => ({
      id: b.id,
      orderNumber: b.order_number,
      workCode: b.order_number,
      clientName: b.client_name,
      customerName: b.client_name,
      clientEmail: b.client_email,
      customerEmail: b.client_email,
      clientPhone: b.client_phone,
      customerPhone: b.client_phone,
      creatorId: b.creator_id,
      assignedPhotographerId: b.creator_id ? String(b.creator_id) : 'c1',
      creatorName: b.creator_name || 'Studio Team',
      assignedPhotographerName: b.creator_name || 'Studio Team',
      creatorAvatar: b.creator_avatar || '/images/assets/img_1_2bd0630341.jpg',
      creatorTitle: b.creator_title || 'Creative Specialist',
      serviceName: b.service_name,
      eventType: b.event_type,
      eventDate: b.event_date ? new Date(b.event_date).toISOString().split('T')[0] : '',
      shootDate: b.event_date ? new Date(b.event_date).toISOString().split('T')[0] : '',
      location: b.location,
      shootLocation: b.location,
      totalAmount: parseFloat(b.total_amount || 0),
      finalAmount: parseFloat(b.total_amount || 0),
      advanceAmount: parseFloat(b.advance_amount || 0),
      status: b.status,
      paymentStatus: b.payment_status,
      notes: b.notes,
      createdAt: b.created_at
    }));

    res.json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (err) {
    console.error('Fetch bookings error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch bookings from database.' });
  }
});

// Create new booking / order
router.post('/', async (req, res) => {
  try {
    const {
      orderNumber = generateOrderNumber(),
      clientName,
      customerName = clientName,
      clientEmail,
      customerEmail = clientEmail,
      clientPhone,
      customerPhone = clientPhone,
      creatorId = null,
      assignedPhotographerId = creatorId,
      photographerId = assignedPhotographerId,
      serviceName = 'Photography & Videography',
      eventType = 'General Event',
      eventDate,
      shootDate = eventDate,
      location = 'Client Location',
      shootLocation = location,
      totalAmount = 15000,
      finalAmount = totalAmount,
      advanceAmount = 0,
      status = 'pending',
      paymentStatus = 'unpaid',
      notes = ''
    } = req.body;

    const finalClientName = customerName || clientName;
    const finalClientEmail = customerEmail || clientEmail || 'client@vibenoww.com';
    const finalClientPhone = customerPhone || clientPhone || '+91 98400 00000';

    if (!finalClientName) {
      return res.status(400).json({ success: false, message: 'Client name is required.' });
    }

    const resolvedCreatorId = photographerId ? parseInt(String(photographerId).replace(/[^0-9]/g, '') || '1', 10) : 1;
    const formattedDate = shootDate || eventDate || new Date().toISOString().split('T')[0];

    const result = await query(
      `INSERT INTO bookings 
       (order_number, client_name, client_email, client_phone, creator_id, service_name, event_type, event_date, location, total_amount, advance_amount, status, payment_status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderNumber,
        finalClientName,
        finalClientEmail,
        finalClientPhone,
        resolvedCreatorId,
        serviceName,
        eventType,
        formattedDate,
        shootLocation || location,
        parseFloat(finalAmount || totalAmount || 15000),
        parseFloat(advanceAmount || 0),
        status,
        paymentStatus,
        notes
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Booking order placed successfully!',
      orderNumber,
      bookingId: result.insertId,
      creatorId: resolvedCreatorId
    });
  } catch (err) {
    console.error('Create booking error:', err);
    res.status(500).json({ success: false, message: 'Failed to create booking in database.' });
  }
});

// Update booking status or details
router.put('/:id', async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { status, paymentStatus, totalAmount, advanceAmount, notes } = req.body;

    await query(
      `UPDATE bookings SET
       status = COALESCE(?, status),
       payment_status = COALESCE(?, payment_status),
       total_amount = COALESCE(?, total_amount),
       advance_amount = COALESCE(?, advance_amount),
       notes = COALESCE(?, notes)
       WHERE id = ? OR order_number = ?`,
      [status, paymentStatus, totalAmount, advanceAmount, notes, bookingId, bookingId]
    );

    res.json({ success: true, message: 'Booking updated successfully.' });
  } catch (err) {
    console.error('Update booking error:', err);
    res.status(500).json({ success: false, message: 'Failed to update booking in database.' });
  }
});

// Delete booking
router.delete('/:id', async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id, 10);
    await query('DELETE FROM bookings WHERE id = ?', [bookingId]);
    res.json({ success: true, message: 'Booking removed successfully.' });
  } catch (err) {
    console.error('Delete booking error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete booking from database.' });
  }
});

export default router;
