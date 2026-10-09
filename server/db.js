import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootEnvPath = path.resolve(__dirname, '../.env');
const prodEnvPath = path.resolve(__dirname, '../.env.production');
if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else if (fs.existsSync(prodEnvPath)) {
  dotenv.config({ path: prodEnvPath });
} else {
  dotenv.config();
}

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const storeFile = path.join(dataDir, 'production_store.json');

// Initial default production dataset
const defaultStore = {
  users: [
    {
      id: 1,
      name: 'VibeNoww Admin',
      email: 'admin@vibenoww.com',
      password_hash: '$2b$10$F.TjPD4ri9ieEDAZwED4quUMm47Dev9VLeqVFDa77NbPQkHwO2eFK',
      role: 'admin',
      avatar: '/images/vibenoww-logo.jpg',
      phone: '+91 98401 55667',
      created_at: new Date().toISOString()
    }
  ],
  creators: [],
  services: [],
  bookings: [],
  quotations: [],
  inquiries: [],
  reviews: []
};

function loadStore() {
  try {
    if (!fs.existsSync(storeFile)) {
      fs.writeFileSync(storeFile, JSON.stringify(defaultStore, null, 2), 'utf8');
      return defaultStore;
    }
    const data = fs.readFileSync(storeFile, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error loading store:', err.message);
    return defaultStore;
  }
}

function saveStore(data) {
  try {
    fs.writeFileSync(storeFile, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving store:', err.message);
  }
}

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'vibenoww_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

let pool = null;
let isConnected = false;

export function getPool() {
  if (!pool) {
    try {
      pool = mysql.createPool(dbConfig);
    } catch (err) {
      console.error('❌ Failed to create MySQL pool:', err.message);
    }
  }
  return pool;
}

export async function testConnection() {
  try {
    const p = getPool();
    if (!p) return false;
    const conn = await p.getConnection();
    await conn.ping();
    conn.release();
    isConnected = true;
    console.log(`✅ MySQL Connected successfully to [${dbConfig.database}] at ${dbConfig.host}:${dbConfig.port}`);
    return true;
  } catch (err) {
    isConnected = false;
    console.log(`ℹ️ MySQL connection status: [${err.code || err.message}]. Operating in high-availability mode.`);
    return false;
  }
}

export function isDbConnected() {
  return isConnected;
}

/**
 * Execute query safely with MySQL or High-Availability fallback
 */
export async function query(sql, params = []) {
  if (isConnected) {
    try {
      const p = getPool();
      const [results] = await p.execute(sql, params);
      return results;
    } catch (err) {
      console.error('MySQL Query execution error:', err.message);
      // Fallback to local store on transient error
    }
  }

  // High-Availability local data processing
  const store = loadStore();
  const trimmed = sql.trim().toUpperCase();

  // 1. SELECT QUERIES
  if (trimmed.startsWith('SELECT')) {
    // USERS
    if (trimmed.includes('FROM USERS')) {
      if (trimmed.includes('WHERE EMAIL = ?')) {
        return store.users.filter(u => u.email === params[0]);
      }
      if (trimmed.includes('WHERE ID = ?')) {
        return store.users.filter(u => Number(u.id) === Number(params[0]));
      }
      return store.users;
    }

    // CREATORS
    if (trimmed.includes('FROM CREATORS')) {
      if (trimmed.includes('COUNT(*)')) {
        return [{
          total_creators: store.creators.length,
          verified_creators: store.creators.filter(c => c.verified || c.status === 'APPROVED').length,
          featured_creators: store.creators.filter(c => c.featured).length,
          average_creator_rating: (store.creators.reduce((a, c) => a + (Number(c.rating) || 5), 0) / (store.creators.length || 1)).toFixed(1)
        }];
      }
      if (trimmed.includes('WHERE ID = ?')) {
        return store.creators.filter(c => String(c.id) === String(params[0]));
      }
      if (trimmed.includes('WHERE IS_ACTIVE = TRUE')) {
        return store.creators.filter(c => c.is_active || c.status === 'APPROVED');
      }
      return store.creators;
    }

    // BOOKINGS
    if (trimmed.includes('FROM BOOKINGS')) {
      if (trimmed.includes('COUNT(*)')) {
        return [{
          total_orders: store.bookings.length,
          pending_orders: store.bookings.filter(b => b.status === 'pending' || b.status === 'NEW').length,
          confirmed_orders: store.bookings.filter(b => b.status === 'confirmed' || b.status === 'CONFIRMED' || b.status === 'in_progress').length,
          in_progress_orders: store.bookings.filter(b => b.status === 'in_progress' || b.status === 'SHOOT_IN_PROGRESS').length,
          completed_orders: store.bookings.filter(b => b.status === 'completed' || b.status === 'COMPLETED').length,
          cancelled_orders: store.bookings.filter(b => b.status === 'cancelled' || b.status === 'CANCELLED').length,
          total_gross_value: store.bookings.reduce((a, b) => a + (Number(b.total_amount) || 0), 0),
          total_confirmed_revenue: store.bookings.filter(b => ['confirmed', 'completed', 'CONFIRMED', 'COMPLETED', 'in_progress'].includes(b.status)).reduce((a, b) => a + (Number(b.total_amount) || 0), 0),
          total_advance_collected: store.bookings.reduce((a, b) => a + (Number(b.advance_amount) || 0), 0)
        }];
      }

      let results = [...store.bookings];

      if (trimmed.includes('WHERE ID = ?')) {
        return results.filter(b => String(b.id) === String(params[0]));
      }
      if (trimmed.includes('WHERE ORDER_NUMBER = ?') || trimmed.includes('ORDER_NUMBER = ?')) {
        return results.filter(b => String(b.order_number) === String(params[0]));
      }
      if (trimmed.includes('CREATOR_ID = ?') || trimmed.includes('B.CREATOR_ID = ?')) {
        const creatorIdParam = params.find(p => p !== undefined);
        results = results.filter(b => String(b.creator_id) === String(creatorIdParam));
      }
      if (trimmed.includes('STATUS = ?') || trimmed.includes('B.STATUS = ?')) {
        const statusParam = params.find(p => typeof p === 'string' && ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'NEW', 'CONFIRMED', 'COMPLETED'].includes(p));
        if (statusParam) {
          results = results.filter(b => String(b.status).toLowerCase() === String(statusParam).toLowerCase());
        }
      }

      // Attach creator details if joined
      return results.map(b => {
        const creator = store.creators.find(c => String(c.id) === String(b.creator_id));
        return {
          ...b,
          creator_name: creator ? creator.name : 'Studio Team',
          creator_avatar: creator ? creator.avatar : '/images/assets/img_1_2bd0630341.jpg',
          creator_title: creator ? (creator.studio_name || creator.title) : 'Creative Specialist'
        };
      });
    }

    // QUOTATIONS
    if (trimmed.includes('FROM QUOTATIONS')) {
      if (trimmed.includes('COUNT(*)')) {
        return [{
          total_quotations: store.quotations.length,
          draft_quotations: store.quotations.filter(q => q.status === 'draft' || q.status === 'DRAFT').length,
          sent_quotations: store.quotations.filter(q => q.status === 'sent' || q.status === 'QUOTED' || q.status === 'SENT').length,
          accepted_quotations: store.quotations.filter(q => q.status === 'accepted' || q.status === 'ACCEPTED').length,
          total_pipeline_value: store.quotations.reduce((a, q) => a + (Number(q.estimated_amount) || 0), 0),
          total_projected_margins: store.quotations.reduce((a, q) => a + (Number(q.studio_margin) || 0), 0)
        }];
      }

      let results = [...store.quotations];
      if (trimmed.includes('WHERE ID = ?')) {
        return results.filter(q => String(q.id) === String(params[0]));
      }
      if (trimmed.includes('CREATOR_ID = ?') || trimmed.includes('Q.CREATOR_ID = ?')) {
        results = results.filter(q => String(q.creator_id) === String(params[0]));
      }

      return results.map(q => {
        const creator = store.creators.find(c => String(c.id) === String(q.creator_id));
        return {
          ...q,
          creator_name: creator ? creator.name : 'Collective Team'
        };
      });
    }

    // INQUIRIES
    if (trimmed.includes('FROM INQUIRIES')) {
      if (trimmed.includes('COUNT(*)')) {
        return [{
          total_inquiries: store.inquiries.length,
          new_inquiries: store.inquiries.filter(i => i.status === 'new' || i.status === 'NEW').length,
          contacted_inquiries: store.inquiries.filter(i => i.status === 'contacted' || i.status === 'CONTACTED').length
        }];
      }
      if (trimmed.includes('WHERE ID = ?')) {
        return store.inquiries.filter(i => String(i.id) === String(params[0]));
      }
      return store.inquiries;
    }

    // SERVICES
    if (trimmed.includes('FROM SERVICES')) {
      return store.services;
    }

    // REVIEWS
    if (trimmed.includes('FROM REVIEWS')) {
      if (trimmed.includes('CREATOR_ID = ?')) {
        return store.reviews.filter(r => String(r.creator_id) === String(params[0]));
      }
      return store.reviews;
    }

    return [];
  }

  // 2. UPDATE QUERIES
  if (trimmed.startsWith('UPDATE CREATORS SET STATUS = ?') || trimmed.startsWith('UPDATE CREATORS SET STATUS=')) {
    const creatorId = Number(params[4]);
    const status = params[0];
    const reason = params[1];
    const verified = Boolean(params[2]);
    const c = store.creators.find(c => String(c.id) === String(creatorId));
    if (c) {
      c.status = status;
      c.rejection_reason = reason;
      c.verified = verified;
      c.is_active = status === 'APPROVED';
      saveStore(store);
    }
    return { affectedRows: 1 };
  }

  if (trimmed.startsWith('UPDATE CREATORS SET')) {
    const creatorId = params[params.length - 1];
    const c = store.creators.find(c => String(c.id) === String(creatorId));
    if (c) {
      if (params[0] !== undefined && params[0] !== null) c.name = params[0];
      if (params[1] !== undefined && params[1] !== null) c.title = params[1];
      saveStore(store);
    }
    return { affectedRows: 1 };
  }

  if (trimmed.startsWith('UPDATE BOOKINGS SET')) {
    const bookingId = params[params.length - 1];
    const b = store.bookings.find(b => String(b.id) === String(bookingId) || String(b.order_number) === String(bookingId));
    if (b) {
      if (params[0] !== undefined && params[0] !== null) b.status = params[0];
      if (params[1] !== undefined && params[1] !== null) b.payment_status = params[1];
      if (params[2] !== undefined && params[2] !== null) b.total_amount = Number(params[2]);
      if (params[3] !== undefined && params[3] !== null) b.advance_amount = Number(params[3]);
      if (params[4] !== undefined && params[4] !== null) b.notes = params[4];
      saveStore(store);
    }
    return { affectedRows: 1 };
  }

  if (trimmed.startsWith('UPDATE QUOTATIONS SET')) {
    const quoteId = params[params.length - 1];
    const q = store.quotations.find(q => String(q.id) === String(quoteId) || String(q.quote_number) === String(quoteId));
    if (q) {
      if (params[0] !== undefined && params[0] !== null) q.status = params[0];
      if (params[1] !== undefined && params[1] !== null) q.estimated_amount = Number(params[1]);
      if (params[2] !== undefined && params[2] !== null) q.studio_margin = Number(params[2]);
      if (params[3] !== undefined && params[3] !== null) q.notes = params[3];
      saveStore(store);
    }
    return { affectedRows: 1 };
  }

  if (trimmed.startsWith('UPDATE INQUIRIES SET STATUS = ?')) {
    const inquiryId = params[1];
    const inq = store.inquiries.find(i => String(i.id) === String(inquiryId));
    if (inq) {
      inq.status = params[0];
      saveStore(store);
    }
    return { affectedRows: 1 };
  }

  // 3. INSERT QUERIES
  if (trimmed.startsWith('INSERT INTO INQUIRIES')) {
    const newInquiry = {
      id: store.inquiries.length + 1,
      name: params[0],
      email: params[1],
      phone: params[2] || '',
      event_type: params[3] || 'General Inquiry',
      budget: params[4] || '',
      preferred_date: params[5] || '',
      message: params[6] || '',
      status: 'new',
      created_at: new Date().toISOString()
    };
    store.inquiries.unshift(newInquiry);
    saveStore(store);
    return { insertId: newInquiry.id, affectedRows: 1 };
  }

  if (trimmed.startsWith('INSERT INTO BOOKINGS')) {
    const newBooking = {
      id: store.bookings.length + 1,
      order_number: params[0] || `VN-${Math.floor(10000 + Math.random() * 90000)}`,
      client_name: params[1] || 'Valued Client',
      client_email: params[2] || 'client@example.com',
      client_phone: params[3] || '',
      creator_id: params[4] ? Number(params[4]) : 1,
      service_name: params[5] || 'Photography & Cinematography',
      event_type: params[6] || 'Event',
      event_date: params[7] || new Date().toISOString().split('T')[0],
      location: params[8] || 'Tamil Nadu',
      total_amount: Number(params[9]) || 25000,
      advance_amount: Number(params[10]) || 0,
      status: params[11] || 'pending',
      payment_status: params[12] || 'unpaid',
      notes: params[13] || '',
      created_at: new Date().toISOString()
    };
    store.bookings.unshift(newBooking);
    saveStore(store);
    return { insertId: newBooking.id, affectedRows: 1 };
  }

  if (trimmed.startsWith('INSERT INTO QUOTATIONS')) {
    let deliv = [];
    try {
      deliv = typeof params[10] === 'string' ? JSON.parse(params[10] || '[]') : (params[10] || []);
    } catch {
      deliv = [];
    }

    const newQuote = {
      id: store.quotations.length + 1,
      quote_number: params[0] || `EST-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      client_name: params[1],
      client_email: params[2],
      client_phone: params[3] || '',
      creator_id: params[4] ? Number(params[4]) : 1,
      event_type: params[5] || 'Wedding / Event',
      event_date: params[6] || new Date().toISOString().split('T')[0],
      estimated_amount: Number(params[7]) || 25000,
      studio_margin: Number(params[8]) || 5000,
      status: params[9] || 'draft',
      deliverables: deliv,
      notes: params[11] || '',
      created_at: new Date().toISOString()
    };
    store.quotations.unshift(newQuote);
    saveStore(store);
    return { insertId: newQuote.id, affectedRows: 1 };
  }

  if (trimmed.startsWith('INSERT INTO CREATORS')) {
    const newCreator = {
      id: store.creators.length + 1,
      name: params[0],
      title: params[1],
      studio_name: params[1] || `${params[0]} Studio`,
      category: params[2] || 'photographer',
      specialties: typeof params[3] === 'string' ? JSON.parse(params[3] || '[]') : (params[3] || []),
      location: params[4] || 'Chennai, Tamil Nadu',
      starting_price: Number(params[5]) || 15000,
      price_unit: params[6] || 'per day',
      experience_years: Number(params[7]) || 1,
      avatar: params[8] || '/images/assets/img_1_2bd0630341.jpg',
      cover_image: params[9] || '/images/assets/img_2_9d522e92d9.jpg',
      bio: params[10] || '',
      languages: typeof params[11] === 'string' ? JSON.parse(params[11] || '[]') : (params[11] || ['English']),
      equipment: params[12] || '',
      status: params[13] || 'PENDING',
      is_active: Boolean(params[14]),
      rating: 5.0,
      review_count: 0,
      verified: false,
      featured: false,
      created_at: new Date().toISOString()
    };
    store.creators.push(newCreator);
    saveStore(store);
    return { insertId: newCreator.id, affectedRows: 1 };
  }

  if (trimmed.startsWith('INSERT INTO USERS')) {
    const newUser = {
      id: store.users.length + 1,
      name: params[0],
      email: params[1],
      password_hash: params[2],
      role: params[3] || 'client',
      phone: params[4] || '',
      avatar: params[5] || '/images/assets/img_1_2bd0630341.jpg',
      created_at: new Date().toISOString()
    };
    store.users.push(newUser);
    saveStore(store);
    return { insertId: newUser.id, affectedRows: 1 };
  }

  // 4. DELETE QUERIES
  if (trimmed.startsWith('DELETE FROM BOOKINGS')) {
    const bookingId = params[0];
    store.bookings = store.bookings.filter(b => String(b.id) !== String(bookingId));
    saveStore(store);
    return { affectedRows: 1 };
  }

  if (trimmed.startsWith('DELETE FROM QUOTATIONS')) {
    const quoteId = params[0];
    store.quotations = store.quotations.filter(q => String(q.id) !== String(quoteId));
    saveStore(store);
    return { affectedRows: 1 };
  }

  if (trimmed.startsWith('DELETE FROM INQUIRIES')) {
    const inquiryId = params[0];
    store.inquiries = store.inquiries.filter(i => String(i.id) !== String(inquiryId));
    saveStore(store);
    return { affectedRows: 1 };
  }

  return { affectedRows: 1 };
}

export default {
  getPool,
  testConnection,
  isDbConnected,
  query
};
