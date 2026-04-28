const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || '';

if (!connectionString) {
  console.warn('⚠️ DATABASE_URL is not set. Database features may fail.');
}

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : undefined
});

async function query(text, params = []) {
  return pool.query(text, params);
}

async function testConnection() {
  if (!connectionString) return false;
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('❌ Neon connection failed:', error.message);
    return false;
  }
}

module.exports = {
  pool,
  query,
  testConnection
};
