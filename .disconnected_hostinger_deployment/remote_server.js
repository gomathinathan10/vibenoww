import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initDatabase, isDbConnected } from './config/db.js';

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

dotenv.config({ override: true });

const app = express();
const PORT = process.env.PORT || 5001;
const FRONTEND_URL = process.env.FRONTEND_URL || process.env.VITE_APP_URL || 'https://vibenoww.com';

// CORS configuration
const allowedOrigins = [
  FRONTEND_URL,
  process.env.VITE_APP_URL,
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()) : [])
].filter(Boolean);

// In development, dynamically include localhost origins
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push(
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000'
  );
}

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
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint (Section 40)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    database: isDbConnected() ? 'connected' : 'resilient',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/photographers', photographerRoutes);
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
