import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

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

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbName = process.env.DB_NAME || 'vibenoww_db';

async function initDatabase() {
  console.log(`🚀 Starting MySQL Database Initialization for [${dbName}]...`);
  
  let connection;
  try {
    // 1. Connect without DB selected to ensure DB exists
    connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword
    });

    console.log(`📡 Connected to MySQL server at ${dbHost}:${dbPort}`);

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`✅ Database '${dbName}' verified/created.`);

    await connection.query(`USE \`${dbName}\`;`);

    // 2. Read schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const rawSql = fs.readFileSync(schemaPath, 'utf8');
    const cleanSql = rawSql.replace(/--.*$/gm, '');

    // Split and execute individual queries
    const statements = cleanSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.toUpperCase().startsWith('USE') && !s.toUpperCase().startsWith('CREATE DATABASE'));

    for (const stmt of statements) {
      if (stmt.trim()) {
        await connection.query(stmt);
      }
    }
    console.log(`✅ All ${statements.length} tables & constraints created successfully in '${dbName}'.`);

    console.log('🎉 MySQL Database Initialization Completed Successfully!');
  } catch (err) {
    console.error('❌ Database Initialization Error:', err.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDatabase();
