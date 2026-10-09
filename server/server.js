import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initDatabase, isDbConnected, getDbStatusInfo } from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import adminRoutes from './routes/admin.js';
import orderRoutes from './routes/orders.js';
import photographerRoutes from './routes/photographers.js';
import availabilityRoutes from './routes/availability.js';
import quotationRoutes from './routes/quotations.js';
import paymentRoutes from './routes/payments.js';
import notificationRoutes from './routes/notifications.js';
import authRoutes from './routes/auth.js';
import creatorsRoutes from './routes/creators.js';
import bookingsRoutes from './routes/bookings.js';
import inquiriesRoutes from './routes/inquiries.js';
import servicesRoutes from './routes/services.js';

dotenv.config({ override: true });

const app = express();
const PORT = process.env.PORT || 5001;
const FRONTEND_URL = process.env.FRONTEND_URL || process.env.VITE_APP_URL || 'https://vibenoww.com';

// CORS configuration
const allowedOrigins = [
  FRONTEND_URL,
  process.env.VITE_APP_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()) : [])
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error('Blocked by CORS policy'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-deletion-token', 'x-admin-email', 'x-admin-key', 'x-access-token']
}));

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Static file storage for creator uploads (profile photos & backgrounds)
const uploadsDir = path.resolve(__dirname, '../uploads');
const creatorsDir = path.join(uploadsDir, 'creators');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(creatorsDir)) {
  fs.mkdirSync(creatorsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir, { maxAge: '1d' }));
app.use('/api/uploads', express.static(uploadsDir, { maxAge: '1d' }));

// Health Check Endpoint (Section 40)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    database: isDbConnected() ? 'connected' : 'resilient',
    dbDetails: getDbStatusInfo(),
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/photographers', photographerRoutes);
app.use('/api/creators', creatorsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/inquiries', inquiriesRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/auth', authRoutes);

// Serve static frontend files in production
const distPath = path.resolve(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api') || req.path.startsWith('/health')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(`[Server Error] ${req.method} ${req.url}:`, err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server
async function startServer() {
  console.log('🚀 Initializing VibeNoww Production Backend...');
  await initDatabase();

  app.listen(PORT, () => {
    console.log(`✅ VibeNoww Server running on port ${PORT}`);
    console.log(`📡 Health Check: /health`);
    console.log(`🔌 API Base URL: /api`);
  });
}

startServer();

export default app;
