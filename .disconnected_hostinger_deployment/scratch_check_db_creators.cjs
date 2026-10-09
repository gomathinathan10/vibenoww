require('dotenv').config();
const mysql = require('mysql2/promise');

async function check() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '195.35.44.183',
    user: process.env.DB_USER || 'u766698539_vibenoww_usr',
    password: process.env.DB_PASSWORD || '123Vibenoww!@',
    database: process.env.DB_NAME || 'u766698539_vibenoww_db'
  });
  
  console.log('Connected to MySQL successfully!');
  const [photogs] = await conn.execute('SELECT id, name, email, phone, status, approvalStatus FROM photographers');
  console.log('Photographers in DB:', photogs);

  const [users] = await conn.execute('SELECT id, name, email, role FROM users');
  console.log('Users in DB:', users);

  await conn.end();
}

check().catch(err => console.error('DB Error:', err.message));
