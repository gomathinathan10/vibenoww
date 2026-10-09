import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables (.env and .env.production)
const rootEnvPath = path.resolve(__dirname, '../../.env');
const prodEnvPath = path.resolve(__dirname, '../../.env.production');
if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath, override: true });
} else if (fs.existsSync(prodEnvPath)) {
  dotenv.config({ path: prodEnvPath, override: true });
} else {
  dotenv.config({ override: true });
}

let pool = null;
let isConnected = false;

// In-memory fallback repository for zero-dependency test runs or resilient mode if MySQL is offline
class MemoryStorage {
  constructor() {
    this.users = [];
    this.photographers = [];
    this.orders = [];
    this.availability = [];
    this.quotations = [];
    this.payments = [];
    this.notifications = [];
    this.activityLogs = [];
    this.initSeedData();
  }

  initSeedData() {
    // Zero dummy data — completely clean initial state
    this.users = [
      {
        id: 1,
        name: 'VibeNoww Admin',
        email: 'admin@vibenoww.com',
        phone: '+91 98401 55667',
        password: '123',
        password_hash: '$2b$10$F.TjPD4ri9ieEDAZwED4quUMm47Dev9VLeqVFDa77NbPQkHwO2eFK',
        role: 'ADMIN',
        status: 'ACTIVE'
      }
    ];
    this.photographers = [];
    this.orders = [];
    this.availability = [];
    this.quotations = [];
    this.payments = [];
    this.notifications = [];
    this.activityLogs = [];
  }
}

export const memoryStore = new MemoryStorage();

export function getDbPool() {
  if (pool) return pool;

  const dbUrl = process.env.DATABASE_URL;
  let poolConfig = {
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    decimalNumbers: true
  };

  if (dbUrl) {
    try {
      const parsed = new URL(dbUrl);
      poolConfig.host = parsed.hostname;
      poolConfig.port = parsed.port ? parseInt(parsed.port, 10) : 3306;
      poolConfig.user = parsed.username;
      poolConfig.password = parsed.password;
      poolConfig.database = parsed.pathname.replace(/^\//, '');
    } catch (err) {
      console.warn('⚠️ Could not parse DATABASE_URL, falling back to granular env variables');
    }
  }

  if (!poolConfig.host) {
    poolConfig.host = process.env.DB_HOST || 'localhost';
    poolConfig.port = parseInt(process.env.DB_PORT || '3306', 10);
    poolConfig.user = process.env.DB_USER || 'root';
    poolConfig.password = process.env.DB_PASSWORD || '';
    poolConfig.database = process.env.DB_NAME || 'vibenoww_db';
    poolConfig.connectionLimit = parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10);
    poolConfig.charset = 'utf8mb4';
  }

  console.log('[DB Config Attempt]:', {
    host: poolConfig.host,
    port: poolConfig.port,
    database: poolConfig.database,
    user: poolConfig.user,
    passSet: !!poolConfig.password,
    passLength: poolConfig.password ? poolConfig.password.length : 0
  });

  pool = mysql.createPool(poolConfig);
  return pool;
}

export async function initDatabase() {
  const currentPool = getDbPool();
  try {
    const connection = await currentPool.getConnection();
    isConnected = true;
    console.log('✅ Connected to MySQL Database successfully.');

    // Execute schema migrations
    const schemaPath = path.resolve(__dirname, '../migrations/schema.sql');
    if (fs.existsSync(schemaPath)) {
      const rawSql = fs.readFileSync(schemaPath, 'utf8');
      const cleanSql = rawSql.replace(/--.*$/gm, '');
      const statements = cleanSql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      for (const statement of statements) {
        await connection.query(statement);
      }
      console.log('✅ Database schema migrations verified and applied.');
    }

    connection.release();
    return true;
  } catch (error) {
    isConnected = false;
    console.warn(`⚠️ MySQL Connection notice: ${error.message}. Running in resilient mode.`);
    return false;
  }
}

export function isDbConnected() {
  return isConnected;
}
