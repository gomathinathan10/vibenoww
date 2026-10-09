import express from 'express';
import { query } from '../db.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { enforceDeletionApproval } from '../services/deleteApprovalService.js';

const router = express.Router();

// Get all creators with optional filtering and search
router.get('/', async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, rating, location, featured } = req.query;

    let sql = 'SELECT * FROM creators WHERE is_active = TRUE';
    const params = [];

    if (category && category !== 'all' && category !== 'All Categories') {
      sql += ' AND (category = ? OR JSON_CONTAINS(specialties, JSON_QUOTE(?)))';
      params.push(category, category);
    }

    if (featured === 'true' || featured === '1') {
      sql += ' AND featured = TRUE';
    }

    if (location) {
      sql += ' AND location LIKE ?';
      params.push(`%${location}%`);
    }

    if (minPrice) {
      sql += ' AND starting_price >= ?';
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      sql += ' AND starting_price <= ?';
      params.push(parseFloat(maxPrice));
    }

    if (rating) {
      sql += ' AND rating >= ?';
      params.push(parseFloat(rating));
    }

    if (search) {
      sql += ' AND (name LIKE ? OR title LIKE ? OR location LIKE ? OR bio LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    sql += ' ORDER BY featured DESC, rating DESC, id ASC';

    const creators = await query(sql, params);

    // Fetch portfolio items for each creator
    const creatorIds = creators.map(c => c.id);
    let portfolioMap = {};

    if (creatorIds.length > 0) {
      const placeholders = creatorIds.map(() => '?').join(',');
      const portfolioItems = await query(
        `SELECT * FROM portfolio_items WHERE creator_id IN (${placeholders})`,
        creatorIds
      );
      portfolioItems.forEach(item => {
        if (!portfolioMap[item.creator_id]) {
          portfolioMap[item.creator_id] = [];
        }
        portfolioMap[item.creator_id].push(item);
      });
    }

    const formattedCreators = creators.map(c => ({
      id: c.id,
      name: c.name,
      studioName: c.studio_name || c.title || `${c.name} Photography Studio`,
      title: c.title,
      category: c.category,
      specialties: typeof c.specialties === 'string' ? JSON.parse(c.specialties || '[]') : (c.specialties || []),
      location: c.location,
      rating: parseFloat(c.rating || 5.0),
      reviewCount: c.review_count,
      startingPrice: parseFloat(c.starting_price),
      priceUnit: c.price_unit,
      experienceYears: c.experience_years,
      verified: Boolean(c.verified),
      featured: Boolean(c.featured),
      avatar: c.avatar,
      coverImage: c.cover_image,
      bio: c.bio,
      languages: typeof c.languages === 'string' ? JSON.parse(c.languages || '[]') : (c.languages || []),
      equipment: c.equipment,
      status: c.status || (c.is_active ? 'APPROVED' : 'PENDING'),
      rejectionReason: c.rejection_reason || null,
      portfolio: portfolioMap[c.id] || []
    }));

    res.json({
      success: true,
      count: formattedCreators.length,
      data: formattedCreators
    });
  } catch (err) {
    console.error('Fetch creators error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch creators from database.' });
  }
});

// Get creator by ID with portfolio and reviews
router.get('/:id', async (req, res) => {
  try {
    const creatorId = parseInt(req.params.id, 10);
    const creators = await query('SELECT * FROM creators WHERE id = ?', [creatorId]);

    if (!creators || creators.length === 0) {
      return res.status(404).json({ success: false, message: 'Creator not found.' });
    }

    const c = creators[0];
    const portfolio = await query('SELECT * FROM portfolio_items WHERE creator_id = ?', [creatorId]);
    const reviews = await query('SELECT * FROM reviews WHERE creator_id = ? AND is_approved = TRUE ORDER BY created_at DESC', [creatorId]);

    const formattedCreator = {
      id: c.id,
      name: c.name,
      studioName: c.studio_name || c.title || `${c.name} Photography Studio`,
      title: c.title,
      category: c.category,
      specialties: typeof c.specialties === 'string' ? JSON.parse(c.specialties || '[]') : (c.specialties || []),
      location: c.location,
      rating: parseFloat(c.rating || 5.0),
      reviewCount: c.review_count,
      startingPrice: parseFloat(c.starting_price),
      priceUnit: c.price_unit,
      experienceYears: c.experience_years,
      verified: Boolean(c.verified),
      featured: Boolean(c.featured),
      avatar: c.avatar,
      coverImage: c.cover_image,
      bio: c.bio,
      languages: typeof c.languages === 'string' ? JSON.parse(c.languages || '[]') : (c.languages || []),
      equipment: c.equipment,
      status: c.status || (c.is_active ? 'APPROVED' : 'PENDING'),
      rejectionReason: c.rejection_reason || null,
      portfolio: portfolio || [],
      reviews: reviews || []
    };

    res.json({ success: true, data: formattedCreator });
  } catch (err) {
    console.error('Get creator detail error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve creator details.' });
  }
});

// Get photographer studio by creator ID
router.get('/:id/studio', async (req, res) => {
  try {
    const creatorId = parseInt(req.params.id, 10);
    const creators = await query('SELECT * FROM creators WHERE id = ?', [creatorId]);

    if (!creators || creators.length === 0) {
      return res.status(404).json({ success: false, message: 'Photographer Studio not found.' });
    }

    const c = creators[0];
    const portfolio = await query('SELECT * FROM portfolio_items WHERE creator_id = ?', [creatorId]);
    const reviews = await query('SELECT * FROM reviews WHERE creator_id = ? AND is_approved = TRUE ORDER BY created_at DESC', [creatorId]);
    const bookings = await query('SELECT * FROM bookings WHERE creator_id = ? ORDER BY event_date ASC', [creatorId]);

    const studioData = {
      id: c.id,
      name: c.name,
      studioName: c.studio_name || `${c.name} Photography Studio`,
      title: c.title,
      category: c.category,
      specialties: typeof c.specialties === 'string' ? JSON.parse(c.specialties || '[]') : (c.specialties || []),
      location: c.location,
      rating: parseFloat(c.rating || 5.0),
      reviewCount: c.review_count,
      startingPrice: parseFloat(c.starting_price),
      priceUnit: c.price_unit,
      experienceYears: c.experience_years,
      verified: Boolean(c.verified),
      featured: Boolean(c.featured),
      avatar: c.avatar,
      coverImage: c.cover_image,
      bio: c.bio,
      languages: typeof c.languages === 'string' ? JSON.parse(c.languages || '[]') : (c.languages || []),
      equipment: c.equipment,
      status: c.status || (c.is_active ? 'APPROVED' : 'PENDING'),
      rejectionReason: c.rejection_reason || null,
      portfolio: portfolio || [],
      reviews: reviews || [],
      bookings: bookings || []
    };

    res.json({ success: true, studio: studioData, data: studioData });
  } catch (err) {
    console.error('Get studio error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve photographer studio.' });
  }
});

// Create new creator (Registration / Onboarding)
router.post('/', async (req, res) => {
  try {
    const {
      name,
      studioName,
      title = studioName || `${name} Photography Studio`,
      category = 'photographer',
      creatorType = category,
      specialties = [],
      location = 'Chennai, Tamil Nadu',
      startingPrice = 15000,
      priceUnit = 'per day',
      experienceYears = 3,
      avatar = '',
      coverImage = '',
      bio = '',
      languages = ['English'],
      equipment = '',
      portfolio = []
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Creator name is required.' });
    }

    const result = await query(
      `INSERT INTO creators 
       (name, title, category, specialties, location, starting_price, price_unit, experience_years, avatar, cover_image, bio, languages, equipment, status, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        title,
        creatorType || category || 'photographer',
        JSON.stringify(specialties),
        location,
        startingPrice,
        priceUnit,
        experienceYears,
        avatar,
        coverImage,
        bio,
        JSON.stringify(languages),
        equipment,
        'PENDING',
        0
      ]
    );

    const creatorId = result.insertId;

    // Save portfolio items if any
    if (portfolio && Array.isArray(portfolio) && portfolio.length > 0) {
      for (const item of portfolio) {
        await query(
          'INSERT INTO portfolio_items (creator_id, type, title, url, thumbnail) VALUES (?, ?, ?, ?, ?)',
          [creatorId, item.type || 'image', item.title || 'Work', item.url, item.thumb || item.thumbnail || item.url]
        );
      }
    }

    res.status(201).json({
      success: true,
      message: 'Creator application submitted successfully. Awaiting admin approval.',
      id: creatorId,
      creatorId,
      status: 'PENDING',
      name,
      studioName: studioName || title
    });
  } catch (err) {
    console.error('Create creator error:', err);
    res.status(500).json({ success: false, message: 'Failed to create creator in database.' });
  }
});

// Update creator
router.put('/:id', async (req, res) => {
  try {
    const creatorId = parseInt(req.params.id, 10);
    const {
      name,
      title,
      category,
      specialties,
      location,
      startingPrice,
      priceUnit,
      experienceYears,
      avatar,
      coverImage,
      bio,
      languages,
      equipment,
      verified,
      featured
    } = req.body;

    await query(
      `UPDATE creators SET
       name = COALESCE(?, name),
       title = COALESCE(?, title),
       category = COALESCE(?, category),
       specialties = COALESCE(?, specialties),
       location = COALESCE(?, location),
       starting_price = COALESCE(?, starting_price),
       price_unit = COALESCE(?, price_unit),
       experience_years = COALESCE(?, experience_years),
       avatar = COALESCE(?, avatar),
       cover_image = COALESCE(?, cover_image),
       bio = COALESCE(?, bio),
       languages = COALESCE(?, languages),
       equipment = COALESCE(?, equipment),
       verified = COALESCE(?, verified),
       featured = COALESCE(?, featured)
       WHERE id = ?`,
      [
        name,
        title,
        category,
        specialties ? JSON.stringify(specialties) : null,
        location,
        startingPrice,
        priceUnit,
        experienceYears,
        avatar,
        coverImage,
        bio,
        languages ? JSON.stringify(languages) : null,
        equipment,
        verified,
        featured,
        creatorId
      ]
    );

    res.json({ success: true, message: 'Creator profile updated successfully.' });
  } catch (err) {
    console.error('Update creator error:', err);
    res.status(500).json({ success: false, message: 'Failed to update creator.' });
  }
});

// Delete creator - protected by 3-step deletion approval
router.delete('/:id', async (req, res) => {
  return enforceDeletionApproval(req, res, 'creator', req.params.id);
});


// Update creator approval status (Admin action)
router.put('/:id/status', async (req, res) => {
  try {
    const creatorId = parseInt(req.params.id, 10);
    const { status, rejectionReason = null } = req.body;

    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value. Must be PENDING, APPROVED, REJECTED, or SUSPENDED.' });
    }

    await query(
      'UPDATE creators SET status = ?, rejection_reason = ?, verified = ?, is_active = ? WHERE id = ?',
      [status, rejectionReason, status === 'APPROVED' ? 1 : 0, status !== 'SUSPENDED' && status !== 'REJECTED' ? 1 : 0, creatorId]
    );

    res.json({
      success: true,
      message: `Creator status updated to ${status}.`,
      status
    });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ success: false, message: 'Failed to update creator status.' });
  }
});

export default router;
