import { dbQuery } from '@/lib/neon-server'

// 하루 예산 상한(센트 단위). 초과 시 그날의 틱은 자동으로 건너뛴다.
const DEFAULT_DAILY_BUDGET_CENTS = 200 // 기본 $2/일 — 관리자가 aetheria_config로 조정 가능

// 모델별 대략적인 호출당 비용 추정치(센트). 정밀 계산이 아니라 안전마진 확보용.
const ESTIMATED_COST_PER_CALL: Record<string, number> = {
  gpt: 0.3,
  gemini: 0.05,
}

export async function ensureBudgetTable() {
  await dbQuery(`
    CREATE TABLE IF NOT EXISTS aetheria_budget (
      date DATE PRIMARY KEY,
      spent_cents NUMERIC DEFAULT 0
    )
  `)
  await dbQuery(`
    CREATE TABLE IF NOT EXISTS aetheria_config (
      key VARCHAR(32) PRIMARY KEY,
      value TEXT
    )
  `)
}

async function getConfigNumber(key: string, fallback: number): Promise<number> {
  const res = await dbQuery<{ value: string }>(`SELECT value FROM aetheria_config WHERE key = $1`, [key])
  const v = res.rows[0]?.value
  const n = v ? Number(v) : NaN
  return Number.isFinite(n) ? n : fallback
}

export async function getDailyBudgetCents(): Promise<number> {
  return getConfigNumber('daily_budget_cents', DEFAULT_DAILY_BUDGET_CENTS)
}

export async function isSimulationRunning(): Promise<boolean> {
  const res = await dbQuery<{ value: string }>(`SELECT value FROM aetheria_config WHERE key = 'running'`)
  return res.rows[0]?.value === 'true'
}

export async function setSimulationRunning(running: boolean): Promise<void> {
  await dbQuery(
    `INSERT INTO aetheria_config (key, value) VALUES ('running', $1)
     ON CONFLICT (key) DO UPDATE SET value = $1`,
    [running ? 'true' : 'false'],
  )
}

export async function getTodaySpendCents(): Promise<number> {
  const res = await dbQuery<{ spent_cents: string }>(
    `SELECT spent_cents::text AS spent_cents FROM aetheria_budget WHERE date = CURRENT_DATE`,
  )
  return Number(res.rows[0]?.spent_cents ?? 0)
}

export async function hasBudgetRemaining(): Promise<boolean> {
  const [spent, cap] = await Promise.all([getTodaySpendCents(), getDailyBudgetCents()])
  return spent < cap
}

export async function recordSpend(
  model: string,
  calls: number,
  query: typeof dbQuery = dbQuery,
): Promise<void> {
  const cost = (ESTIMATED_COST_PER_CALL[model] ?? 0.3) * calls
  await query(
    `INSERT INTO aetheria_budget (date, spent_cents) VALUES (CURRENT_DATE, $1)
     ON CONFLICT (date) DO UPDATE SET spent_cents = aetheria_budget.spent_cents + $1`,
    [cost],
  )
}
