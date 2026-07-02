import { dbQuery } from '@/lib/neon-server'
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

function toAgentState(row: {
  id: string; model: string; name: string; role: string; gold: number; stamina: number | null
  x: number; y: number; status: string; last_action: string | null; updated_at: string
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

// 한 번의 크론 호출 = 한 배치(최대 MAX_AGENTS_PER_TICK_BATCH명) 처리.
// 전체 에이전트를 순환하며 인덱스를 이어가므로, 크론이 여러 번 돌면 전원이 골고루 처리된다.
export async function runTickBatch(): Promise<TickRunResult> {
  await ensureAgentTables()

  const stateRes = await dbQuery<{ last_tick_id: number; last_agent_index: number }>(
    `SELECT last_tick_id, last_agent_index FROM aetheria_tick_state WHERE id = 1`,
  )
  const lastTickId = stateRes.rows[0]?.last_tick_id ?? 0
  const lastIndex = stateRes.rows[0]?.last_agent_index ?? 0

  const agents = await loadAliveAgents()
  if (agents.length === 0) {
    return { tickId: lastTickId, processed: 0, failed: 0, died: 0, skipped: 'no alive agents' }
  }

  const tickId = lastIndex === 0 ? lastTickId + 1 : lastTickId
  const batch = agents.slice(lastIndex, lastIndex + MAX_AGENTS_PER_TICK_BATCH)
  const nextIndex = lastIndex + batch.length >= agents.length ? 0 : lastIndex + batch.length

  let processed = 0
  let failed = 0
  let died = 0
  for (const agent of batch) {
    try {
      const decision = await decideAgentAction(agent, nearbyOf(agent, agents))
      await recordSpend(agent.model, 1)

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
      if (decision.action === 'trade_offer' && typeof decision.tradeAmount === 'number') {
        const nearby = nearbyOf(agent, agents)
        const target = decision.targetAgentId
          ? nearby.find((a) => a.id === decision.targetAgentId)
          : null
        if (target) {
          const amount = Math.max(0, Math.min(Math.round(decision.tradeAmount), gold))
          if (amount > 0) {
            gold -= amount
            tradeRecipient = target
            await dbQuery(
              `UPDATE aetheria_agents SET gold = gold + $1, updated_at = NOW() WHERE id = $2 AND status = 'alive'`,
              [amount, target.id],
            )
          }
        }
      }

      // 생존 시스템: 매 틱 체력 소모, 사냥(hunt)일 때만 회복 + 골드 보상 (LLM 신고가 아니라 서버가 직접 지급)
      let stamina = agent.stamina - STAMINA_UPKEEP
      let huntGold = 0
      if (decision.action === 'hunt') {
        stamina = Math.min(STAMINA_MAX, stamina + HUNT_STAMINA_GAIN)
        huntGold = HUNT_GOLD_MIN + Math.floor(Math.random() * (HUNT_GOLD_MAX - HUNT_GOLD_MIN + 1))
        gold += huntGold
      }
      stamina = Math.max(0, Math.min(STAMINA_MAX, stamina))
      const isDead = stamina <= 0

      const mod = moderateText(decision.reasoning || '...')

      let displayText = mod.text
      if (tradeRecipient) displayText += ` (→ ${tradeRecipient.name}에게 ${agent.gold - gold + huntGold}골드 전달)`
      if (huntGold > 0) displayText += ` [+${huntGold}골드, 체력 +${HUNT_STAMINA_GAIN}]`

      await dbQuery(
        `UPDATE aetheria_agents SET x=$1, y=$2, gold=$3, stamina=$4, status=$5, last_action=$6, updated_at=NOW() WHERE id=$7`,
        [x, y, gold, stamina, isDead ? 'dead' : 'alive', decision.action, agent.id],
      )

      await dbQuery(
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
            stamina,
            huntGold,
          }),
        ],
      )

      if (isDead) {
        died++
        await dbQuery(
          `INSERT INTO aetheria_events (tick_id, agent_id, event_type, display_text, payload)
           VALUES ($1,$2,'death',$3,$4)`,
          [tickId, agent.id, `💀 ${agent.name}이(가) 체력을 모두 소진해 사망했습니다.`, JSON.stringify({})],
        )
      }

      processed++
    } catch (err) {
      failed++
      const errMsg = err instanceof Error ? err.message : String(err)
      console.error(`[aetheria] agent ${agent.id} failed:`, err)
      // 실패도 로그에 남겨서 관리자가 원인을 볼 수 있게 함 (LLM 호출 자체가 실패한 경우 — API 키/요금/네트워크 문제 등)
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

  await dbQuery(
    `UPDATE aetheria_tick_state SET last_tick_id = $1, last_agent_index = $2 WHERE id = 1`,
    [tickId, nextIndex],
  )

  return { tickId, processed, failed, died, skipped: null }
}
