import type { AgentModel } from './types'

// Phase 1: 6개 고정 (모델당 3개) — 이후 관리자 설정으로 확장 가능
export const INITIAL_AGENTS: Array<{ id: string; model: AgentModel; name: string; role: string }> = [
  { id: 'gpt-1', model: 'gpt', name: 'Aiden', role: 'trader' },
  { id: 'gpt-2', model: 'gpt', name: 'Bram', role: 'hunter' },
  { id: 'gpt-3', model: 'gpt', name: 'Cass', role: 'diplomat' },
  { id: 'gemini-1', model: 'gemini', name: 'Delia', role: 'trader' },
  { id: 'gemini-2', model: 'gemini', name: 'Ewan', role: 'hunter' },
  { id: 'gemini-3', model: 'gemini', name: 'Fira', role: 'diplomat' },
]

export const GRID_SIZE = 10
export const MAX_AGENTS_PER_TICK_BATCH = 3 // Serverless 타임아웃 방지용 배치 크기
