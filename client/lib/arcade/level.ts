// 코인 누적 기반 간단 레벨 시스템. 코인은 소비 없이 누적만 되므로 "총 획득 코인"과 동일.
export function computeLevel(coins: number): { level: number; progress: number; nextAt: number; currentFloor: number } {
  // 레벨 N에 도달하려면 필요한 누적 코인 = 50 * N^2 (뒤로 갈수록 완만하게 증가)
  let level = 1
  while (50 * level * level <= coins) level++
  const currentFloor = level === 1 ? 0 : 50 * (level - 1) * (level - 1)
  const nextAt = 50 * level * level
  const progress = nextAt > currentFloor ? (coins - currentFloor) / (nextAt - currentFloor) : 1
  return { level, progress: Math.min(1, Math.max(0, progress)), nextAt, currentFloor }
}
