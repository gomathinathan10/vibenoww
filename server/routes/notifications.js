import express from 'express';
import { getDbPool, isDbConnected, memoryStore } from '../config/db.js';

const router = express.Router();

/**
 * GET /api/notifications
 * Fetch live system notifications
 */
router.get('/', async (req, res) => {
  try {
    if (isDbConnected()) {
      const pool = getDbPool();
      const [rows] = await pool.query('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50');
      const formatted = rows.map(r => ({
        id: r.id,
        title: r.title,
        message: r.message,
        type: r.type,
        workCode: r.work_code,
        isRead: Boolean(r.is_read),
        createdAt: r.created_at
      }));
      return res.json({ success: true, data: formatted });
    } else {
      return res.json({ success: true, data: memoryStore.notifications });
    }
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve notifications' });
  }
});

/**
 * PUT /api/notifications/:id/read
 * Mark notification as read
 */
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    if (isDbConnected()) {
      const pool = getDbPool();
      await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = ?', [id]);
      return res.json({ success: true, message: 'Notification marked as read' });
    } else {
      const notif = memoryStore.notifications.find(n => String(n.id) === String(id));
      if (notif) notif.is_read = true;
      return res.json({ success: true, message: 'Notification marked as read' });
    }
  } catch (error) {
    console.error('Error updating notification:', error);
    return res.status(500).json({ success: false, message: 'Failed to update notification' });
  }
});

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read
 */
router.put('/read-all', async (req, res) => {
  try {
    if (isDbConnected()) {
      const pool = getDbPool();
      await pool.query('UPDATE notifications SET is_read = TRUE');
      return res.json({ success: true, message: 'All notifications marked as read' });
    } else {
      memoryStore.notifications.forEach(n => { n.is_read = true; });
      return res.json({ success: true, message: 'All notifications marked as read' });
    }
  } catch (error) {
    console.error('Error clearing notifications:', error);
    return res.status(500).json({ success: false, message: 'Failed to clear notifications' });
  }
});

export default router;
