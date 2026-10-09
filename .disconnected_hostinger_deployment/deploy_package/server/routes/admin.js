import express from 'express';
import { getDbPool, isDbConnected, memoryStore } from '../config/db.js';

const router = express.Router();

/**
 * GET /api/admin/dashboard
 * Return live computed counts from MySQL database
 */
router.get('/dashboard', async (req, res) => {
  try {
    if (isDbConnected()) {
      const pool = getDbPool();

      const [[orderStats]] = await pool.query(`
        SELECT 
          COUNT(*) AS total_orders,
          SUM(CASE WHEN status = 'NEW' THEN 1 ELSE 0 END) AS new_orders,
          SUM(CASE WHEN status IN ('NEW', 'PENDING', 'ASSIGNED', 'QUOTED') THEN 1 ELSE 0 END) AS pending_orders,
          SUM(CASE WHEN status = 'CONFIRMED' THEN 1 ELSE 0 END) AS confirmed_orders,
          SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed_works,
          SUM(CASE WHEN status = 'INCOMPLETE' THEN 1 ELSE 0 END) AS incomplete_works
        FROM orders
      `);

      const [[photographerStats]] = await pool.query(`
        SELECT 
          COUNT(*) AS total_photographers,
          SUM(CASE WHEN status = 'ACTIVE' AND approval_status = 'APPROVED' THEN 1 ELSE 0 END) AS active_photographers,
          SUM(CASE WHEN approval_status = 'PENDING' THEN 1 ELSE 0 END) AS pending_approvals
        FROM photographers
      `);

      const [[quotationStats]] = await pool.query(`
        SELECT 
          COUNT(*) AS total_quotations,
          SUM(CASE WHEN status = 'DRAFT' OR status = 'SENT' THEN 1 ELSE 0 END) AS pending_quotations
        FROM quotations
      `);

      const [[paymentStats]] = await pool.query(`
        SELECT 
          COUNT(*) AS total_payments,
          COALESCE(SUM(amount), 0) AS total_revenue,
          SUM(CASE WHEN payment_status = 'PENDING' THEN 1 ELSE 0 END) AS pending_payments
        FROM payments
      `);

      const [[notifStats]] = await pool.query(`
        SELECT COUNT(*) AS unread_notifications FROM notifications WHERE is_read = FALSE
      `);

      // Count photographers available today
      const todayStr = new Date().toISOString().split('T')[0];
      const [[bookedToday]] = await pool.query(`
        SELECT COUNT(DISTINCT photographer_id) AS booked_count 
        FROM availability 
        WHERE date = ? AND status IN ('BOOKED', 'BLOCKED')
      `, [todayStr]);

      const activeCount = photographerStats.active_photographers || 0;
      const availableTodayCount = Math.max(0, activeCount - (bookedToday.booked_count || 0));

      return res.json({
        success: true,
        data: {
          totalOrders: orderStats.total_orders || 0,
          newOrders: orderStats.new_orders || 0,
          pendingOrders: orderStats.pending_orders || 0,
          confirmedOrders: orderStats.confirmed_orders || 0,
          completedWorks: orderStats.completed_works || 0,
          incompleteWorks: orderStats.incomplete_works || 0,
          totalPhotographers: photographerStats.total_photographers || 0,
          activePhotographers: activeCount,
          availablePhotographersToday: availableTodayCount,
          pendingPhotographerApprovals: photographerStats.pending_approvals || 0,
          pendingQuotations: quotationStats.pending_quotations || 0,
          totalPayments: paymentStats.total_payments || 0,
          totalRevenue: Number(paymentStats.total_revenue) || 0,
          pendingPayments: paymentStats.pending_payments || 0,
          unreadNotifications: notifStats.unread_notifications || 0
        }
      });
    } else {
      // Memory fallback stats
      const totalOrders = memoryStore.orders.length;
      const newOrders = memoryStore.orders.filter(o => o.status === 'NEW').length;
      const pendingOrders = memoryStore.orders.filter(o => ['NEW', 'PENDING', 'ASSIGNED', 'QUOTED'].includes(o.status)).length;
      const confirmedOrders = memoryStore.orders.filter(o => o.status === 'CONFIRMED').length;
      const completedWorks = memoryStore.orders.filter(o => o.status === 'COMPLETED').length;
      const incompleteWorks = memoryStore.orders.filter(o => o.status === 'INCOMPLETE').length;
      const activePhotographers = memoryStore.photographers.filter(p => p.status === 'ACTIVE' && p.approval_status === 'APPROVED').length;
      const pendingApprovals = memoryStore.photographers.filter(p => p.approval_status === 'PENDING').length;
      const pendingQuotations = memoryStore.quotations.filter(q => q.status === 'DRAFT' || q.status === 'SENT').length;
      const unreadNotifications = memoryStore.notifications.filter(n => !n.is_read).length;

      return res.json({
        success: true,
        data: {
          totalOrders,
          newOrders,
          pendingOrders,
          confirmedOrders,
          completedWorks,
          incompleteWorks,
          totalPhotographers: memoryStore.photographers.length,
          activePhotographers,
          availablePhotographersToday: activePhotographers,
          pendingPhotographerApprovals: pendingApprovals,
          pendingQuotations,
          totalPayments: memoryStore.payments.length,
          totalRevenue: memoryStore.payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
          pendingPayments: 0,
          unreadNotifications
        }
      });
    }
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve dashboard statistics' });
  }
});

export default router;
