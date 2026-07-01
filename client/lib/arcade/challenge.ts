import { ARCADE_GAMES } from './registry'

// 게임별 "오늘의 도전" 목표 점수 (대략 중상급 실력이면 달성 가능한 수준)
const TARGETS: Record<string, number> = {
  'tap-timing': 350,
  dodge: 50, // 5초 생존 이상
  reaction: 120,
  'number-rush': 200,
  'color-spin': 350,
  'stack-tower': 60,
}

export const CHALLENGE_BONUS_COINS = 50

function daysSinceEpoch(): number {
  return Math.floor(Date.now() / 86_400_000)
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

export interface DailyChallenge {
  gameId: string
  gameTitle: string
  emoji: string
  target: number
  bonus: number
  dateKey: string
}

// 날짜 기준 결정적 선택 → 모든 방문자가 같은 날엔 같은 게임에 도전
export function getTodayChallenge(): DailyChallenge {
  const idx = daysSinceEpoch() % ARCADE_GAMES.length
  const game = ARCADE_GAMES[idx]
  return {
    gameId: game.id,
    gameTitle: game.title,
    emoji: game.emoji,
    target: TARGETS[game.id] ?? 100,
    bonus: CHALLENGE_BONUS_COINS,
    dateKey: todayKey(),
  }
}

const CLAIM_KEY = 'arcade_challenge_claimed'

export function isChallengeClaimedToday(): boolean {
  try {
    return localStorage.getItem(CLAIM_KEY) === todayKey()
  } catch {
    return false
  }
}

export function claimChallenge(): void {
  try {
    localStorage.setItem(CLAIM_KEY, todayKey())
  } catch {
    // ignore
  }
}
