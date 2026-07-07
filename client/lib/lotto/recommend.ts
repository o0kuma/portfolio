// 로또 추천 조합 생성 로직.
// 핵심: 역대 1등 당첨조합들이 공통적으로 가지는 통계적 특성에 맞춰 후보를 거르는 휴리스틱.
// (로또는 독립 사건이라 예측 불가 — 어디까지나 "그럴듯한" 조합 생성용)

export interface BalanceCheck {
  odd: number // 홀수 개수
  low: number // 1~22 개수
  sum: number // 번호 합계
  maxConsecutive: number // 최대 연속 길이
  distinctLastDigits: number // 끝수 종류
  passed: boolean
}

const ALL = Array.from({ length: 45 }, (_, i) => i + 1)

export function analyze(combo: number[]): BalanceCheck {
  const sorted = [...combo].sort((a, b) => a - b)
  const odd = sorted.filter((n) => n % 2 === 1).length
  const low = sorted.filter((n) => n <= 22).length
  const sum = sorted.reduce((a, b) => a + b, 0)

  let maxRun = 1
  let run = 1
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === sorted[i - 1] + 1) {
      run++
      maxRun = Math.max(maxRun, run)
    } else {
      run = 1
    }
  }

  const distinctLastDigits = new Set(sorted.map((n) => n % 10)).size

  // 역대 1등 통계 기반 "건강한" 조합 기준
  const passed =
    odd >= 2 && odd <= 4 && // 홀짝 균형
    low >= 2 && low <= 4 && // 고저 균형
    sum >= 100 && sum <= 175 && // 합계가 몰리는 구간
    maxRun <= 2 && // 연속수 2개 이하
    distinctLastDigits >= 4 // 끝수 분산

  return { odd, low, sum, maxConsecutive: maxRun, distinctLastDigits, passed }
}

// 가중치 풀에서 중복 없이 6개 뽑기 (가중치 없으면 균등)
function weightedPick(weights?: Map<number, number>): number[] {
  const pool = [...ALL]
  const w = (n: number) => (weights?.get(n) ?? 1)
  const chosen: number[] = []
  const avail = new Set(pool)

  while (chosen.length < 6 && avail.size > 0) {
    const arr = Array.from(avail)
    const total = arr.reduce((s, n) => s + w(n), 0)
    let r = Math.random() * total
    let pickedNum = arr[arr.length - 1]
    for (const n of arr) {
      r -= w(n)
      if (r <= 0) {
        pickedNum = n
        break
      }
    }
    chosen.push(pickedNum)
    avail.delete(pickedNum)
  }
  return chosen.sort((a, b) => a - b)
}

// 밸런스 필터를 통과하는 조합을 rejection sampling으로 생성
function generateFiltered(weights?: Map<number, number>, maxTries = 2000): number[] {
  let best: number[] = weightedPick(weights)
  let bestScore = -1
  for (let i = 0; i < maxTries; i++) {
    const combo = weightedPick(weights)
    const a = analyze(combo)
    if (a.passed) return combo
    // 통과 못해도 가장 근접한 후보를 보관 (필터가 너무 빡세서 못 찾는 경우 대비)
    const score =
      (a.odd >= 2 && a.odd <= 4 ? 1 : 0) +
      (a.low >= 2 && a.low <= 4 ? 1 : 0) +
      (a.sum >= 100 && a.sum <= 175 ? 1 : 0) +
      (a.maxConsecutive <= 2 ? 1 : 0) +
      (a.distinctLastDigits >= 4 ? 1 : 0)
    if (score > bestScore) {
      bestScore = score
      best = combo
    }
  }
  return best
}

export type Strategy = 'balanced' | 'hot' | 'cold' | 'mix'

export interface RecommendStats {
  hot: number[] // 자주 나온 번호 (상위)
  cold: number[] // 오래 안 나온 번호
}

// 전략별 가중치 풀을 만들어 조합 생성
export function recommend(strategy: Strategy, stats?: RecommendStats | null): number[] {
  // 통계가 없으면 hot/cold/mix도 밸런스로 폴백
  if (!stats && strategy !== 'balanced') {
    return generateFiltered()
  }

  if (strategy === 'balanced' || !stats) {
    return generateFiltered()
  }

  const weights = new Map<number, number>()
  if (strategy === 'hot') {
    stats.hot.forEach((n, i) => weights.set(n, 6 - i * 0.4)) // 상위일수록 가중치 ↑
  } else if (strategy === 'cold') {
    stats.cold.forEach((n, i) => weights.set(n, 6 - i * 0.4))
  } else if (strategy === 'mix') {
    stats.hot.slice(0, 8).forEach((n) => weights.set(n, 4))
    stats.cold.slice(0, 8).forEach((n) => weights.set(n, 4))
  }
  return generateFiltered(weights)
}

export const STRATEGY_INFO: Record<Strategy, { label: string; labelEn: string; emoji: string; desc: string; descEn: string }> = {
  balanced: {
    label: '밸런스 추천', labelEn: 'Balanced Pick', emoji: '⚖️',
    desc: '홀짝·고저·합계·연속수 균형을 맞춘 통계적 조합',
    descEn: 'A statistically balanced pick across odd/even, high/low, sum, and consecutive numbers',
  },
  hot: {
    label: '핫넘버', labelEn: 'Hot Numbers', emoji: '🔥',
    desc: '자주 당첨된 번호 위주',
    descEn: 'Favors numbers that have won often',
  },
  cold: {
    label: '콜드넘버', labelEn: 'Cold Numbers', emoji: '❄️',
    desc: '오래 안 나온 번호 위주',
    descEn: "Favors numbers that haven't come up in a while",
  },
  mix: {
    label: '핫+콜드 믹스', labelEn: 'Hot + Cold Mix', emoji: '🌗',
    desc: '자주 나온 번호와 안 나온 번호를 절반씩',
    descEn: 'Half frequently-drawn, half rarely-drawn numbers',
  },
}
