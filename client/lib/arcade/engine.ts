// 공통 미니게임 인터페이스.
// 새 게임 추가 = games/에 파일 하나 + registry.ts에 등록.

export interface ArcadeInput {
  // 탭/클릭 시 true로 1프레임 유지 (edge-triggered는 게임 쪽에서 처리)
  tapped: boolean
  // 좌우 스와이프 방향 (닷지류 게임용), 없으면 0
  dx: number
}

export interface MiniGame<TState = unknown> {
  id: string
  title: string
  emoji: string
  instruction: string
  accentColor: string // HUD/배경 강조색
  init(): TState
  update(state: TState, input: ArcadeInput, dtMs: number): TState
  render(ctx: CanvasRenderingContext2D, state: TState, width: number, height: number): void
  isOver(state: TState): boolean
  score(state: TState): number
  // 점수 → 코인 환산 (기본 10점당 1코인)
  toCoins?(score: number): number
}

export function defaultToCoins(score: number): number {
  return Math.max(0, Math.floor(score / 10))
}
