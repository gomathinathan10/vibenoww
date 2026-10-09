import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { testConnection, isDbConnected } from './db.js';

import authRoutes from './routes/auth.js';
import creatorRoutes from './routes/creators.js';
import serviceRoutes from './routes/services.js';
import bookingRoutes from './routes/bookings.js';
import quotationRoutes from './routes/quotations.js';
import inquiryRoutes from './routes/inquiries.js';
import reviewRoutes from './routes/reviews.js';
import statsRoutes from './routes/stats.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check & DB Status Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    databaseConnected: isDbConnected(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/creators', creatorRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/stats', statsRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.'
  });
});

// Start Server
async function startServer() {
  console.log('🔄 Checking MySQL database connection...');
  await testConnection();

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ VibeNoww Backend API Server running on port ${PORT}`);
    console.log(`📡 Endpoints available at /api/`);
  });

  // Keep server alive
  setInterval(() => {}, 1000 * 60 * 60);

  process.on('SIGTERM', () => {
    server.close(() => console.log('Server terminated'));
  });
}

startServer();

