import { Pool, QueryResult } from 'pg'

// Lazily initialized so missing DATABASE_URL produces a clear error at query time
// rather than silently defaulting to 127.0.0.1:5432.
let _pool: Pool | null = null

function getPool(): Pool {
  if (!_pool) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error(
        'DATABASE_URL 환경변수가 설정되지 않았습니다. ' +
        'Vercel 대시보드(또는 server/.env)에 Neon PostgreSQL 연결 문자열(postgresql://...)을 추가해 주세요. ' +
        '현재 127.0.0.1:5432(로컬 PG)로 연결을 시도하고 있습니다.'
      )
    }
    _pool = new Pool({
      connectionString,
      ssl: connectionString.includes('sslmode=require')
        ? { rejectUnauthorized: false }
        : undefined,
    })
  }
  return _pool
}

export async function dbQuery<T = any>(text: string, params: any[] = []): Promise<QueryResult<T>> {
  return getPool().query<T>(text, params)
}
