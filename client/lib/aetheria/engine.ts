import { dbQuery, dbTransaction } from '@/lib/neon-server'
import { decideAgentAction } from './llm-router'
import { moderateText } from './moderation'
import { recordSpend } from './budget'
import { GRID_SIZE, INITIAL_AGENTS, MAX_AGENTS_PER_TICK_BATCH } from './agents'
import type { AgentState } from './types'

// 생존 메커니즘 상수 — 매 틱 체력이 줄고, 사냥으로만 회복된다. 0이 되면 사망.
const STAMINA_MAX = 100
const STAMINA_UPKEEP = 12 // 틱마다 소모
const HUNT_STAMINA_GAIN = 35
const HUNT_GOLD_MIN = 5
const HUNT_GOLD_MAX = 20
const HUNT_FAIL_CHANCE = 0.35 // 사냥 실패 확률 — 리스크 요소

// 역할별 특성 — 이름뿐 아니라 실제 능력 차이를 준다.
// hunter: 사냥 실패율 절반 + 사냥 골드 1.5배
// trader: 거래 시 10% 웃돈이 상대에게 추가 전달 (거래를 유리하게)
// diplomat: 협력(party) 회복량 1.5배
function huntFailChance(role: string): number {
  return role === 'hunter' ? HUNT_FAIL_CHANCE * 0.5 : HUNT_FAIL_CHANCE
}
function huntGoldMultiplier(role: string): number {
  return role === 'hunter' ? 1.5 : 1
}
function partyGain(role: string): number {
  return role === 'diplomat' ? Math.round(PARTY_STAMINA_GAIN * 1.5) : PARTY_STAMINA_GAIN
}
const PARTY_STAMINA_GAIN = 15 // 함께 쉬며 회복 (Social Interaction 축 — 협력의 실질적 보상)
const GREETING_STAMINA_GAIN = 5 // 사기 진작 정도의 작은 회복
// 동시 크론/관리자 run-tick이 같은 배치를 이중 처리하지 않도록 advisory lock 사용
const TICK_ADVISORY_LOCK_KEY = 867530901

export async function ensureAgentTables() {
  await dbQuery(`
    CREATE TABLE IF NOT EXISTS aetheria_agents (
      id VARCHAR(32) PRIMARY KEY,
      model VARCHAR(16) NOT NULL,
      name VARCHAR(50) NOT NULL,
      role VARCHAR(20) NOT NULL,
      gold INT DEFAULT 100,
      stamina INT DEFAULT 100,
      x INT DEFAULT 5,
      y INT DEFAULT 5,
      status VARCHAR(16) DEFAULT 'alive',
      last_action TEXT,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  // 기존에 이미 만들어진 테이블에도 stamina 컬럼을 추가 (마이그레이션)
  await dbQuery(`ALTER TABLE aetheria_agents ADD COLUMN IF NOT EXISTS stamina INT DEFAULT 100`)
  // 태어난(부활한) 틱 — 생존일 계산용
  await dbQuery(`ALTER TABLE aetheria_agents ADD COLUMN IF NOT EXISTS born_tick INT DEFAULT 0`)

  // 명예의 전당 — 사망한 에이전트의 최종 기록 (역대 최장수/최고부자)
  await dbQuery(`
    CREATE TABLE IF NOT EXISTS aetheria_hall_of_fame (
      id SERIAL PRIMARY KEY,
      agent_id VARCHAR(32) NOT NULL,
      name VARCHAR(50) NOT NULL,
      model VARCHAR(16) NOT NULL,
      role VARCHAR(20) NOT NULL,
      season INT NOT NULL,
      final_gold INT NOT NULL,
      survived_days INT NOT NULL,
      died_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)

  await dbQuery(`
    CREATE TABLE IF NOT EXISTS aetheria_events (
      id SERIAL PRIMARY KEY,
      tick_id INT NOT NULL,
      agent_id VARCHAR(32) NOT NULL,
      event_type VARCHAR(20) NOT NULL,
      display_text TEXT,
      payload JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  await dbQuery(`
    CREATE TABLE IF NOT EXISTS aetheria_tick_state (
      id SMALLINT PRIMARY KEY DEFAULT 1,
      last_tick_id INT DEFAULT 0,
      last_agent_index INT DEFAULT 0
    )
  `)
  // 시즌 번호 (전멸 시 새 시즌으로 리셋)
  await dbQuery(`ALTER TABLE aetheria_tick_state ADD COLUMN IF NOT EXISTS season INT DEFAULT 1`)
  await dbQuery(
    `INSERT INTO aetheria_tick_state (id, last_tick_id, last_agent_index) VALUES (1, 0, 0)
     ON CONFLICT (id) DO NOTHING`,
  )

  // 초기 에이전트 시딩 (없을 때만)
  const countRes = await dbQuery<{ count: string }>(`SELECT COUNT(*)::text AS count FROM aetheria_agents`)
  if (Number(countRes.rows[0]?.count ?? 0) === 0) {
    for (const a of INITIAL_AGENTS) {
      const x = Math.floor(Math.random() * GRID_SIZE)
      const y = Math.floor(Math.random() * GRID_SIZE)
      await dbQuery(
        `INSERT INTO aetheria_agents (id, model, name, role, gold, stamina, x, y) VALUES ($1,$2,$3,$4,100,100,$5,$6)
         ON CONFLICT (id) DO NOTHING`,
        [a.id, a.model, a.name, a.role, x, y],
      )
    }
  }
}

// 전멸 시 새 시즌 시작 — 모든 에이전트를 초기 상태(체력·골드 100, 무작위 위치, 생존)로 되살리고 시즌 번호 +1.
// 과거 이벤트 로그는 보존한다(명예의 전당/기록용).
export async function startNewSeason(query: typeof dbQuery, currentTick: number): Promise<number> {
  for (const a of INITIAL_AGENTS) {
    const x = Math.floor(Math.random() * GRID_SIZE)
    const y = Math.floor(Math.random() * GRID_SIZE)
    await query(
      `UPDATE aetheria_agents SET gold=100, stamina=100, x=$2, y=$3, status='alive', last_action=NULL, born_tick=$4, updated_at=NOW() WHERE id=$1`,
      [a.id, x, y, currentTick],
    )
  }
  const seasonRes = await query<{ season: number }>(
    `UPDATE aetheria_tick_state SET season = season + 1, last_agent_index = 0 WHERE id = 1 RETURNING season`,
  )
  return seasonRes.rows[0]?.season ?? 1
}

function toAgentState(row: {
  id: string; model: string; name: string; role: string; gold: number; stamina: number | null
  x: number; y: number; status: string; last_action: string | null; updated_at: string
  born_tick?: number | null
}): AgentState {
  return {
    id: row.id,
    model: row.model as AgentState['model'],
    name: row.name,
    role: row.role,
    gold: row.gold,
    stamina: row.stamina ?? STAMINA_MAX,
    x: row.x,
    y: row.y,
    status: row.status as AgentState['status'],
    lastAction: row.last_action,
    updatedAt: row.updated_at,
    bornTick: row.born_tick ?? 0,
  }
}

async function loadAliveAgents(): Promise<AgentState[]> {
  const res = await dbQuery<Parameters<typeof toAgentState>[0]>(
    `SELECT * FROM aetheria_agents WHERE status = 'alive' ORDER BY id`,
  )
  return res.rows.map(toAgentState)
}

function nearbyOf(agent: AgentState, all: AgentState[], radius = 3): AgentState[] {
  return all.filter(
    (a) => a.id !== agent.id && Math.abs(a.x - agent.x) <= radius && Math.abs(a.y - agent.y) <= radius,
  )
}

export interface TickRunResult {
  tickId: number
  processed: number
  failed: number
  died: number
  skipped: string | null
}

/** Resolve batch cursor; clamp when deaths/timeouts left last_agent_index past the alive list. */
export function resolveTickCursor(
  lastIndex: number,
  aliveCount: number,
): { effectiveIndex: number; staleCursor: boolean; tickIdDelta: number } {
  if (aliveCount <= 0) {
    return { effectiveIndex: 0, staleCursor: false, tickIdDelta: 0 }
  }
  const staleCursor = lastIndex >= aliveCount
  const effectiveIndex = staleCursor ? 0 : lastIndex
  // New tick only on a genuine wrap (index 0), not when recovering a stale cursor.
  const tickIdDelta = effectiveIndex === 0 && !staleCursor ? 1 : 0
  return { effectiveIndex, staleCursor, tickIdDelta }
}

async function recoverFromWipeout(lastTickId: number): Promise<TickRunResult> {
  const newSeason = await startNewSeason(dbQuery, lastTickId)
  await dbQuery(
    `INSERT INTO aetheria_events (tick_id, agent_id, event_type, display_text, payload)
     VALUES ($1,'system','season',$2,$3)`,
    [
      lastTickId,
      `🌅 모든 에이전트가 전멸했습니다. 시즌 ${newSeason} 시작 — 새로운 세계가 열립니다.`,
      JSON.stringify({ season: newSeason }),
    ],
  )
  return {
    tickId: lastTickId,
    processed: 0,
    failed: 0,
    died: 0,
    skipped: 'season restarted after wipeout',
  }
}

// 한 번의 크론 호출 = 한 배치(최대 MAX_AGENTS_PER_TICK_BATCH명) 처리.
// 전체 에이전트를 순환하며 인덱스를 이어가므로, 크론이 여러 번 돌면 전원이 골고루 처리된다.
export async function runTickBatch(): Promise<TickRunResult> {
  await ensureAgentTables()

  const lockRes = await dbQuery<{ acquired: boolean }>(
    `SELECT pg_try_advisory_lock($1) AS acquired`,
    [TICK_ADVISORY_LOCK_KEY],
  )
  if (!lockRes.rows[0]?.acquired) {
    const stateRes = await dbQuery<{ last_tick_id: number }>(
      `SELECT last_tick_id FROM aetheria_tick_state WHERE id = 1`,
    )
    const lastTickId = stateRes.rows[0]?.last_tick_id ?? 0
    return { tickId: lastTickId, processed: 0, failed: 0, died: 0, skipped: 'tick already in progress' }
  }

  try {
    const stateRes = await dbQuery<{ last_tick_id: number; last_agent_index: number }>(
      `SELECT last_tick_id, last_agent_index FROM aetheria_tick_state WHERE id = 1`,
    )
    const lastTickId = stateRes.rows[0]?.last_tick_id ?? 0
    const lastIndex = stateRes.rows[0]?.last_agent_index ?? 0

    const agents = await loadAliveAgents()
    if (agents.length === 0) {
      return recoverFromWipeout(lastTickId)
    }

    const { effectiveIndex, staleCursor, tickIdDelta } = resolveTickCursor(lastIndex, agents.length)
    if (staleCursor) {
      await dbQuery(`UPDATE aetheria_tick_state SET last_agent_index = 0 WHERE id = 1`)
    }

    const tickId = lastTickId + tickIdDelta
    const batch = agents.slice(effectiveIndex, effectiveIndex + MAX_AGENTS_PER_TICK_BATCH)

    let processed = 0
    let failed = 0
    let died = 0
    for (const agent of batch) {
      try {
        const decision = await decideAgentAction(agent, nearbyOf(agent, agents))

        // 이동 반영 (그리드 범위로 클램프)
        let x = agent.x
        let y = agent.y
        if (decision.moveTo) {
          x = Math.max(0, Math.min(GRID_SIZE - 1, Math.round(decision.moveTo.x)))
          y = Math.max(0, Math.min(GRID_SIZE - 1, Math.round(decision.moveTo.y)))
        }

        // 거래는 구조화 필드로만 처리 — 상대 텍스트를 프롬프트에 재주입하지 않는다.
        // 실제로 상대에게 골드가 전달되려면 targetAgentId가 근처(nearbyOf)에 있는 살아있는 에이전트여야 한다.
        let gold = agent.gold
        let tradeRecipient: AgentState | null = null
        let tradeAmount = 0
        if (decision.action === 'trade_offer' && typeof decision.tradeAmount === 'number') {
          const nearby = nearbyOf(agent, agents)
          const target = decision.targetAgentId
            ? nearby.find((a) => a.id === decision.targetAgentId)
            : null
          if (target) {
            tradeAmount = Math.max(0, Math.min(Math.round(decision.tradeAmount), gold))
            if (tradeAmount > 0) {
              // trader는 거래 효율이 좋아, 상대는 tradeAmount를 받되 본인은 10% 적게 소모
              const cost = agent.role === 'trader' ? Math.round(tradeAmount * 0.9) : tradeAmount
              gold -= cost
              tradeRecipient = target
            }
          }
        }

        // 생존 시스템: 매 틱 체력 소모, 행동에 따라 회복 (LLM 신고가 아니라 서버가 직접 지급)
        let stamina = agent.stamina - STAMINA_UPKEEP
        let huntGold = 0
        let huntFailed = false
        let partyPartner: AgentState | null = null

        if (decision.action === 'hunt') {
          // 사냥 실패 확률 — 리스크 요소(Risk Management). hunter는 실패율 절반.
          if (Math.random() < huntFailChance(agent.role)) {
            huntFailed = true
            stamina = Math.min(STAMINA_MAX, stamina + Math.floor(HUNT_STAMINA_GAIN / 3))
          } else {
            stamina = Math.min(STAMINA_MAX, stamina + HUNT_STAMINA_GAIN)
            const base = HUNT_GOLD_MIN + Math.floor(Math.random() * (HUNT_GOLD_MAX - HUNT_GOLD_MIN + 1))
            huntGold = Math.round(base * huntGoldMultiplier(agent.role)) // hunter 골드 1.5배
            gold += huntGold
          }
        } else if (decision.action === 'party_invite') {
          const nearby = nearbyOf(agent, agents)
          const partner = decision.targetAgentId ? nearby.find((a) => a.id === decision.targetAgentId) : null
          if (partner) {
            partyPartner = partner
            stamina = Math.min(STAMINA_MAX, stamina + partyGain(agent.role)) // diplomat 회복 1.5배
          }
        } else if (decision.action === 'greeting') {
          stamina = Math.min(STAMINA_MAX, stamina + GREETING_STAMINA_GAIN)
        }

        stamina = Math.max(0, Math.min(STAMINA_MAX, stamina))
        const isDead = stamina <= 0

        const mod = moderateText(decision.reasoning || '...')

        let displayText = mod.text
        if (tradeRecipient) displayText += ` (→ ${tradeRecipient.name}에게 ${tradeAmount}골드 전달)`
        if (huntGold > 0) displayText += ` [+${huntGold}골드, 체력 +${HUNT_STAMINA_GAIN}]`
        else if (huntFailed) displayText += ' [사냥 실패… 빈손]'
        if (partyPartner) displayText += ` (${partyPartner.name}과 함께 휴식, 둘 다 체력 +${PARTY_STAMINA_GAIN})`
        else if (decision.action === 'party_invite') displayText += ' (근처에 함께할 상대가 없어 무산됨)'
        if (decision.action === 'greeting') displayText += ` [체력 +${GREETING_STAMINA_GAIN}]`

        // LLM 호출은 트랜잭션 밖에서 수행하고, DB 변경은 단일 트랜잭션으로 묶어 부분 실패 시 골드 중복 생성을 막는다.
        await dbTransaction(async (query) => {
          await recordSpend(agent.model, 1, query)

          if (tradeRecipient && tradeAmount > 0) {
            await query(
              `UPDATE aetheria_agents SET gold = gold + $1, updated_at = NOW() WHERE id = $2 AND status = 'alive'`,
              [tradeAmount, tradeRecipient.id],
            )
          }

          if (partyPartner) {
            await query(
              `UPDATE aetheria_agents SET stamina = LEAST(100, stamina + $1), updated_at = NOW() WHERE id = $2 AND status = 'alive'`,
              [PARTY_STAMINA_GAIN, partyPartner.id],
            )
          }

          await query(
            `UPDATE aetheria_agents SET x=$1, y=$2, gold=$3, stamina=$4, status=$5, last_action=$6, updated_at=NOW() WHERE id=$7`,
            [x, y, gold, stamina, isDead ? 'dead' : 'alive', decision.action, agent.id],
          )

          await query(
            `INSERT INTO aetheria_events (tick_id, agent_id, event_type, display_text, payload)
             VALUES ($1,$2,$3,$4,$5)`,
            [
              tickId,
              agent.id,
              decision.action,
              displayText,
              JSON.stringify({
                moveTo: decision.moveTo ?? null,
                tradeAmount: decision.tradeAmount ?? null,
                tradeRecipientId: tradeRecipient?.id ?? null,
                partyPartnerId: partyPartner?.id ?? null,
                stamina,
                huntGold,
              }),
            ],
          )

          if (isDead) {
            const survivedDays = Math.max(0, tickId - (agent.bornTick ?? 0))
            await query(
              `INSERT INTO aetheria_events (tick_id, agent_id, event_type, display_text, payload)
               VALUES ($1,$2,'death',$3,$4)`,
              [tickId, agent.id, `💀 ${agent.name}이(가) ${survivedDays}일 만에 사망했습니다. (최종 🪙${gold})`, JSON.stringify({ survivedDays, finalGold: gold })],
            )
            // 명예의 전당 기록
            await query(
              `INSERT INTO aetheria_hall_of_fame (agent_id, name, model, role, season, final_gold, survived_days)
               VALUES ($1,$2,$3,$4,(SELECT season FROM aetheria_tick_state WHERE id=1),$5,$6)`,
              [agent.id, agent.name, agent.model, agent.role, gold, survivedDays],
            )
          }
        })

        if (isDead) died++

        processed++
        // 타임아웃/크래시 후 재시도 시 이미 처리된 에이전트를 건너뛰도록 매 성공마다 체크포인트
        const checkpointIndex = effectiveIndex + processed >= agents.length ? 0 : effectiveIndex + processed
        await dbQuery(
          `UPDATE aetheria_tick_state SET last_tick_id = $1, last_agent_index = $2 WHERE id = 1`,
          [tickId, checkpointIndex],
        )
      } catch (err) {
        failed++
        const errMsg = err instanceof Error ? err.message : String(err)
        console.error(`[aetheria] agent ${agent.id} failed:`, err)
        try {
          await dbQuery(
            `INSERT INTO aetheria_events (tick_id, agent_id, event_type, display_text, payload)
             VALUES ($1,$2,'error',$3,$4)`,
            [tickId, agent.id, `[호출 실패] ${errMsg.slice(0, 100)}`, JSON.stringify({ error: errMsg })],
          )
        } catch {
          // 로그 기록 실패는 무시
        }
      }
    }

    // 전멸 감지 — 이번 배치 이후 살아있는 에이전트가 하나도 없으면 새 시즌 시작
    const aliveRes = await dbQuery<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM aetheria_agents WHERE status = 'alive'`,
    )
    if (Number(aliveRes.rows[0]?.count ?? 0) === 0) {
      await recoverFromWipeout(tickId)
    }

    return { tickId, processed, failed, died, skipped: null }
  } finally {
    await dbQuery(`SELECT pg_advisory_unlock($1)`, [TICK_ADVISORY_LOCK_KEY])
  }
}
