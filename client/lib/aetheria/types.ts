export type AgentModel = 'gpt' | 'gemini'

export interface AgentState {
  id: string
  model: AgentModel
  name: string
  role: string // 'trader' | 'hunter' | 'diplomat' 등 — 목표 성향
  gold: number
  stamina: number
  x: number
  y: number
  status: 'alive' | 'dead'
  lastAction: string | null
  updatedAt: string
  bornTick?: number
}

// 에이전트 간 교환은 구조화 데이터만 — 자유 텍스트는 표시 전용(displayText)이며
// 절대 다른 에이전트의 다음 프롬프트에 재주입하지 않는다 (프롬프트 인젝션 전파 차단).
export interface AgentMessage {
  type: 'trade_offer' | 'party_invite' | 'greeting' | 'move' | 'hunt'
  fromAgentId: string
  toAgentId?: string
  payload: Record<string, number | string | null>
}

export interface TickEvent {
  tickId: number
  agentId: string
  eventType: AgentMessage['type']
  displayText: string
  payload: Record<string, unknown>
  createdAt: string
}

export interface AgentDecision {
  action: AgentMessage['type']
  targetAgentId?: string
  moveTo?: { x: number; y: number }
  tradeAmount?: number
  reasoning: string // 사람이 읽을 짧은 이유 — 모더레이션 후 displayText로 사용
}
