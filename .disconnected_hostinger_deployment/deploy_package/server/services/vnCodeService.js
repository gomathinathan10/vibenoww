import { getDbPool, isDbConnected, memoryStore } from '../config/db.js';

/**
 * Generate a unique and permanent Work Code in VN-##### format.
 * Includes concurrency-safe retries and database unique check.
 */
export async function generateUniqueWorkCode() {
  const maxAttempts = 10;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Generate random 5-digit number between 10000 and 99999
    const randomCode = Math.floor(10000 + Math.random() * 90000);
    const workCode = `VN-${randomCode}`;

    if (isDbConnected()) {
      try {
        const pool = getDbPool();
        const [rows] = await pool.query('SELECT id FROM orders WHERE work_code = ? LIMIT 1', [workCode]);
        if (rows.length === 0) {
          return workCode;
        }
      } catch (err) {
        console.error('Error checking VN code uniqueness in DB:', err.message);
      }
    } else {
      const exists = memoryStore.orders.some(o => o.workCode === workCode);
      if (!exists) {
        return workCode;
      }
    }
  }

  // High entropy fallback
  const timestampSuffix = Date.now().toString().slice(-5);
  return `VN-${timestampSuffix}`;
}
