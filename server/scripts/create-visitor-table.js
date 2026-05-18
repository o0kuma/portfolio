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
    // visitor_count: cumulative unique visitor tracking (one row per session)
    await client.query(`
      CREATE TABLE IF NOT EXISTS visitor_count (
        id SERIAL PRIMARY KEY,
        session_id TEXT NOT NULL UNIQUE,
        first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ visitor_count 테이블이 생성되었습니다 (또는 이미 존재합니다).');

    const result = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'visitor_count'
      ORDER BY ordinal_position;
    `);
    console.log('📋 visitor_count 테이블 컬럼:');
    result.rows.forEach((row) => {
      console.log(`   - ${row.column_name}: ${row.data_type}`);
    });

    const countResult = await client.query(`SELECT COUNT(*) AS total FROM visitor_count`);
    console.log(`📊 현재 누적 방문자 수: ${countResult.rows[0].total}명`);
  } finally {
    client.release();
    await pool.end();
  }
}

createVisitorTable().catch((err) => {
  console.error('❌ 테이블 생성 실패:', err.message);
  process.exit(1);
});
