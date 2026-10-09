import express from 'express';
import { query } from '../db.js';

const router = express.Router();

// Real Dynamic Dashboard Analytics computed directly from MySQL
async function getDashboardStats(req, res) {
  try {
    // 1. Creators statistics
    const [creatorStats] = await query(`
      SELECT 
        COUNT(*) as total_creators,
        COUNT(CASE WHEN verified = TRUE THEN 1 END) as verified_creators,
        COUNT(CASE WHEN featured = TRUE THEN 1 END) as featured_creators,
        COALESCE(AVG(rating), 5.0) as average_creator_rating
      FROM creators 
      WHERE is_active = TRUE
    `);

    // 2. Bookings & Orders statistics
    const [bookingStats] = await query(`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_orders,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_orders,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
        COALESCE(SUM(total_amount), 0) as total_gross_value,
        COALESCE(SUM(CASE WHEN status IN ('confirmed', 'completed') THEN total_amount ELSE 0 END), 0) as total_confirmed_revenue,
        COALESCE(SUM(advance_amount), 0) as total_advance_collected
      FROM bookings
    `);

    // 3. Quotations statistics
    const [quoteStats] = await query(`
      SELECT 
        COUNT(*) as total_quotations,
        COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_quotations,
        COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_quotations,
        COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_quotations,
        COALESCE(SUM(estimated_amount), 0) as total_pipeline_value,
        COALESCE(SUM(studio_margin), 0) as total_projected_margins
      FROM quotations
    `);

    // 4. Inquiries statistics
    const [inquiryStats] = await query(`
      SELECT 
        COUNT(*) as total_inquiries,
        COUNT(CASE WHEN status = 'new' THEN 1 END) as new_inquiries,
        COUNT(CASE WHEN status = 'contacted' THEN 1 END) as contacted_inquiries
      FROM inquiries
    `);

    // 5. Recent 5 orders
    const recentOrders = await query(`
      SELECT b.id, b.order_number, b.client_name, b.service_name, b.event_date, b.total_amount, b.status, b.created_at,
             c.name as creator_name
      FROM bookings b
      LEFT JOIN creators c ON b.creator_id = c.id
      ORDER BY b.created_at DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      stats: {
        creators: {
          total: creatorStats.total_creators || 0,
          verified: creatorStats.verified_creators || 0,
          featured: creatorStats.featured_creators || 0,
          averageRating: parseFloat(creatorStats.average_creator_rating || 5.0).toFixed(1)
        },
        orders: {
          total: bookingStats.total_orders || 0,
          pending: bookingStats.pending_orders || 0,
          confirmed: bookingStats.confirmed_orders || 0,
          inProgress: bookingStats.in_progress_orders || 0,
          completed: bookingStats.completed_orders || 0,
          cancelled: bookingStats.cancelled_orders || 0,
          revenue: parseFloat(bookingStats.total_confirmed_revenue || 0),
          advanceCollected: parseFloat(bookingStats.total_advance_collected || 0)
        },
        quotations: {
          total: quoteStats.total_quotations || 0,
          draft: quoteStats.draft_quotations || 0,
          sent: quoteStats.sent_quotations || 0,
          accepted: quoteStats.accepted_quotations || 0,
          pipelineValue: parseFloat(quoteStats.total_pipeline_value || 0),
          margins: parseFloat(quoteStats.total_projected_margins || 0)
        },
        inquiries: {
          total: inquiryStats.total_inquiries || 0,
          new: inquiryStats.new_inquiries || 0,
          contacted: inquiryStats.contacted_inquiries || 0
        },
        recentOrders: recentOrders || []
      }
    });
  } catch (err) {
    console.error('Fetch dashboard stats error:', err);
    res.status(500).json({ success: false, message: 'Failed to compute dashboard analytics from database.' });
  }
}

router.get('/', getDashboardStats);
router.get('/dashboard', getDashboardStats);

export default router;
