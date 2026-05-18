require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌ DATABASE_URL이 설정되지 않았습니다. server/.env를 확인해주세요.');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : undefined,
});

async function createVisitorTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS visitor_sessions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        session_id TEXT NOT NULL UNIQUE,
        last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ visitor_sessions 테이블이 생성되었습니다 (또는 이미 존재합니다).');

    const result = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'visitor_sessions'
      ORDER BY ordinal_position;
    `);
    console.log('📋 테이블 컬럼:');
    result.rows.forEach((row) => {
      console.log(`   - ${row.column_name}: ${row.data_type}`);
    });
  } finally {
    client.release();
    await pool.end();
  }
}

createVisitorTable().catch((err) => {
  console.error('❌ 테이블 생성 실패:', err.message);
  process.exit(1);
});
