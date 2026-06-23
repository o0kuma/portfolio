export type Achievement = {
  id: string
  name: string
  description: string
  game: string
  icon: string
}

export type EarnedEntry = {
  id: string
  earnedAt: string
}

export const ACHIEVEMENTS: Achievement[] = [
  // Tetris
  { id: 'tetris_first', name: '첫 테트리스', description: '테트리스에서 점수를 획득', game: 'tetris', icon: '🧱' },
  { id: 'tetris_master', name: '테트리스 마스터', description: '테트리스 5000점 이상', game: 'tetris', icon: '👑' },
  { id: 'tetris_lines', name: '라인 클리어', description: '100줄 이상 클리어', game: 'tetris', icon: '✂️' },
  // Survive
  { id: 'survive_60', name: '생존자', description: '60초 이상 생존', game: 'survive', icon: '⚔️' },
  { id: 'survive_300', name: '장기 생존', description: '300초 이상 생존', game: 'survive', icon: '🛡️' },
  { id: 'survive_kills', name: '킬 머신', description: '100명 이상 처치', game: 'survive', icon: '💀' },
  // Tower Defense
  { id: 'tower_wave5', name: '수비수', description: '웨이브 5 달성', game: 'tower-defense', icon: '🏰' },
  { id: 'tower_wave15', name: '철벽 수비', description: '웨이브 15 달성', game: 'tower-defense', icon: '🔱' },
  // Typing
  { id: 'typing_40wpm', name: '타이피스트', description: 'WPM 40 이상', game: 'typing', icon: '⌨️' },
  { id: 'typing_80wpm', name: '속타자', description: 'WPM 80 이상', game: 'typing', icon: '⚡' },
  // Global
  { id: 'all_games', name: '게임 마니아', description: '모든 게임 플레이', game: 'all', icon: '🎮' },
  { id: 'first_game', name: '첫 도전', description: '첫 번째 게임 플레이', game: 'all', icon: '🌟' },
]

const STORAGE_KEY = 'portfolio_achievements'

export function getEarned(): EarnedEntry[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function getEarnedIds(): string[] {
  return getEarned().map((e) => e.id)
}

export function markEarned(id: string): void {
  if (typeof window === 'undefined') return
  const earned = getEarned()
  if (earned.find((e) => e.id === id)) return
  earned.push({ id, earnedAt: new Date().toISOString() })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(earned))
}

function getPlayedGames(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem('portfolio_played_games') || '[]')
  } catch {
    return []
  }
}

function markGamePlayed(game: string): void {
  if (typeof window === 'undefined') return
  const played = getPlayedGames()
  if (!played.includes(game)) {
    played.push(game)
    localStorage.setItem('portfolio_played_games', JSON.stringify(played))
  }
}

export function checkAchievements(game: string, stats: Record<string, number>): Achievement[] {
  markGamePlayed(game)
  const played = getPlayedGames()
  const earnedIds = getEarnedIds()
  const newlyEarned: Achievement[] = []

  function check(id: string, condition: boolean) {
    if (condition && !earnedIds.includes(id)) {
      const ach = ACHIEVEMENTS.find((a) => a.id === id)
      if (ach) {
        markEarned(id)
        newlyEarned.push(ach)
        earnedIds.push(id)
      }
    }
  }

  // First game
  check('first_game', played.length >= 1)

  // All games
  const allGames = ['tetris', 'survive', 'tower-defense', 'typing']
  check('all_games', allGames.every((g) => played.includes(g)))

  if (game === 'tetris') {
    check('tetris_first', (stats.score ?? 0) > 0)
    check('tetris_master', (stats.score ?? 0) >= 5000)
    check('tetris_lines', (stats.lines ?? 0) >= 100)
  }

  if (game === 'survive') {
    check('survive_60', (stats.timeSec ?? 0) >= 60)
    check('survive_300', (stats.timeSec ?? 0) >= 300)
    check('survive_kills', (stats.kills ?? 0) >= 100)
  }

  if (game === 'tower-defense') {
    check('tower_wave5', (stats.wave ?? 0) >= 5)
    check('tower_wave15', (stats.wave ?? 0) >= 15)
  }

  if (game === 'typing') {
    check('typing_40wpm', (stats.wpm ?? 0) >= 40)
    check('typing_80wpm', (stats.wpm ?? 0) >= 80)
  }

  return newlyEarned
}
