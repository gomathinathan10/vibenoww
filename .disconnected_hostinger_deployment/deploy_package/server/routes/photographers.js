import express from 'express';
import { getDbPool, isDbConnected, memoryStore } from '../config/db.js';

const router = express.Router();

/**
 * GET /api/photographers
 * Fetch all photographers with approval status, service areas, and ratings
 */
router.get('/', async (req, res) => {
  try {
    const { approvalStatus, status, location } = req.query;

    if (isDbConnected()) {
      const pool = getDbPool();
      let query = 'SELECT * FROM photographers WHERE 1=1';
      const params = [];

      if (approvalStatus && approvalStatus !== 'ALL') {
        query += ' AND approval_status = ?';
        params.push(approvalStatus);
      }
      if (status && status !== 'ALL') {
        query += ' AND status = ?';
        params.push(status);
      }
      if (location) {
        query += ' AND (location LIKE ? OR service_areas LIKE ?)';
        params.push(`%${location}%`, `%${location}%`);
      }

      query += ' ORDER BY created_at DESC';
      const [rows] = await pool.query(query, params);

      // Fetch availability dates for each photographer
      const [availRows] = await pool.query('SELECT photographer_id, date, status, work_code FROM availability');

      const formatted = rows.map(r => {
        const pAvail = availRows.filter(a => a.photographer_id === r.id);
        const bookedDates = pAvail
          .filter(a => a.status === 'BOOKED')
          .map(a => a.date instanceof Date ? a.date.toISOString().split('T')[0] : a.date);
        const blockedDates = pAvail
          .filter(a => a.status === 'BLOCKED')
          .map(a => a.date instanceof Date ? a.date.toISOString().split('T')[0] : a.date);

        return {
          id: r.id,
          name: r.name,
          studioName: r.studio_name || `${r.name} Photography Studio`,
          phone: r.phone,
          email: r.email,
          location: r.location,
          specialties: r.specialization ? r.specialization.split(',').map(s => s.trim()) : ['Wedding', 'Events'],
          avatar: r.profile_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80',
          startingPrice: Number(r.starting_price) || 15000,
          priceUnit: r.price_unit || 'per day',
          experienceYears: r.experience_years || 3,
          bio: r.bio || '',
          serviceAreas: r.service_areas ? r.service_areas.split(',').map(s => s.trim()) : ['Tamil Nadu'],
          languages: r.languages ? r.languages.split(',').map(s => s.trim()) : ['Tamil', 'English'],
          equipment: r.equipment || 'Sony A7 IV, 24-70mm GM II',
          rating: Number(r.rating) || 5.0,
          reviewCount: r.review_count || 12,
          status: r.status,
          approvalStatus: r.approval_status,
          bookedDates,
          blockedDates,
          joinedDate: r.created_at
        };
      });

      return res.json({ success: true, data: formatted });
    } else {
      let result = [...memoryStore.photographers];
      if (approvalStatus && approvalStatus !== 'ALL') {
        result = result.filter(p => (p.approval_status || p.approvalStatus) === approvalStatus);
      }
      return res.json({ success: true, data: result });
    }
  } catch (error) {
    console.error('Error fetching photographers:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve photographers' });
  }
});

/**
 * GET /api/photographers/:id
 * Retrieve single photographer by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isDbConnected()) {
      const pool = getDbPool();
      const [rows] = await pool.query('SELECT * FROM photographers WHERE id = ? OR phone = ? LIMIT 1', [id, id]);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Photographer not found' });
      }
      const r = rows[0];
      const [availRows] = await pool.query('SELECT date, status FROM availability WHERE photographer_id = ?', [r.id]);
      const bookedDates = availRows.filter(a => a.status === 'BOOKED').map(a => a.date instanceof Date ? a.date.toISOString().split('T')[0] : a.date);
      const availableDates = availRows.filter(a => a.status === 'AVAILABLE').map(a => a.date instanceof Date ? a.date.toISOString().split('T')[0] : a.date);

      const parsedSpecialties = r.specialization ? r.specialization.split(',').map(s => s.trim()).filter(Boolean) : ['Wedding Photography', 'Pre-Wedding', 'Candid', 'Portrait'];
      const parsedLanguages = r.languages ? r.languages.split(',').map(s => s.trim()).filter(Boolean) : ['Tamil', 'English'];

      return res.json({
        success: true,
        data: {
          id: r.id,
          name: r.name,
          studioName: r.studio_name || `${r.name} Photography Studio`,
          phone: r.phone,
          email: r.email,
          location: r.location,
          specialties: parsedSpecialties,
          specialization: parsedSpecialties.join(', '),
          avatar: r.profile_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80',
          startingPrice: Number(r.starting_price) || 15000,
          priceUnit: r.price_unit || 'per day',
          experienceYears: r.experience_years || 3,
          bio: r.bio || '',
          serviceAreas: r.service_areas ? r.service_areas.split(',').map(s => s.trim()) : ['Tamil Nadu'],
          languages: parsedLanguages,
          equipment: r.equipment || 'Sony A7 IV, 24-70mm GM II',
          rating: Number(r.rating) || 5.0,
          reviewCount: r.review_count || 12,
          status: r.status,
          approvalStatus: r.approval_status,
          bookedDates,
          availableDates,
          joinedDate: r.created_at
        }
      });
    } else {
      const p = memoryStore.photographers.find(x => x.id === id || x.phone === id);
      if (!p) return res.status(404).json({ success: false, message: 'Photographer not found' });
      return res.json({ success: true, data: p });
    }
  } catch (error) {
    console.error('Error fetching single photographer:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve photographer' });
  }
});

/**
 * POST /api/photographers
 * Register new photographer (from onboarding modal)
 */
router.post('/', async (req, res) => {
  try {
    const {
      name,
      studioName,
      phone,
      email,
      location,
      specialties,
      specialization,
      startingPrice,
      experienceYears,
      bio,
      serviceAreas,
      languages,
      equipment,
      avatar,
      profileImage
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and phone are required' });
    }

    const id = `p_${Date.now()}`;
    const specStr = specialties ? (Array.isArray(specialties) ? specialties.join(', ') : specialties) : (specialization || 'Wedding Photography');
    const areasStr = serviceAreas ? (Array.isArray(serviceAreas) ? serviceAreas.join(', ') : serviceAreas) : 'Tirunelveli';
    const langStr = languages ? (Array.isArray(languages) ? languages.join(', ') : languages) : 'Tamil, English';
    const imgUrl = avatar || profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80';

    if (isDbConnected()) {
      const pool = getDbPool();
      await pool.query(
        `INSERT INTO photographers (
          id, name, studio_name, phone, email, location,
          specialization, profile_image, starting_price,
          experience_years, bio, service_areas, languages,
          equipment, status, approval_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', 'PENDING')`,
        [
          id,
          name,
          studioName || `${name} Photography Studio`,
          phone,
          email || null,
          location || 'Tamil Nadu',
          specStr,
          imgUrl,
          Number(startingPrice) || 15000,
          Number(experienceYears) || 2,
          bio || '',
          areasStr,
          langStr,
          equipment || 'Professional Mirrorless Camera Kit'
        ]
      );

      await pool.query(
        `INSERT INTO notifications (title, message, type)
         VALUES (?, ?, 'PHOTOGRAPHER_REGISTRATION')`,
        [
          `New Photographer Onboarding: ${name}`,
          `${name} (${studioName || 'Studio'}) submitted registration for approval.`
        ]
      );

      return res.status(201).json({
        success: true,
        message: 'Photographer registration submitted for approval',
        data: { id, name, approvalStatus: 'PENDING' }
      });
    } else {
      const newP = {
        id,
        name,
        studioName: studioName || `${name} Studio`,
        phone,
        email,
        location,
        specialties: [specStr],
        avatar: imgUrl,
        startingPrice: Number(startingPrice) || 15000,
        experienceYears: Number(experienceYears) || 2,
        bio,
        status: 'ACTIVE',
        approval_status: 'PENDING',
        rating: 5.0,
        reviewCount: 0,
        bookedDates: [],
        blockedDates: []
      };
      memoryStore.photographers.unshift(newP);
      return res.status(201).json({ success: true, data: newP });
    }
  } catch (error) {
    console.error('Error registering photographer:', error);
    return res.status(500).json({ success: false, message: 'Failed to register photographer' });
  }
});

/**
 * PUT /api/photographers/:id/status
 * Approve, Reject, or Toggle status
 */
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { approvalStatus, status } = req.body;

    if (isDbConnected()) {
      const pool = getDbPool();
      let query = 'UPDATE photographers SET updated_at = NOW()';
      const params = [];

      if (approvalStatus) {
        query += ', approval_status = ?';
        params.push(approvalStatus);
      }
      if (status) {
        query += ', status = ?';
        params.push(status);
      }

      query += ' WHERE id = ?';
      params.push(id);

      await pool.query(query, params);
      return res.json({ success: true, message: 'Photographer status updated successfully' });
    } else {
      const p = memoryStore.photographers.find(x => x.id === id);
      if (!p) return res.status(404).json({ success: false, message: 'Photographer not found' });
      if (approvalStatus) p.approval_status = approvalStatus;
      if (status) p.status = status;
      return res.json({ success: true, message: 'Status updated' });
    }
  } catch (error) {
    console.error('Error updating photographer status:', error);
    return res.status(500).json({ success: false, message: 'Failed to update photographer status' });
  }
});

export default router;
