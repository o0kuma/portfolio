export type Achievement = {
  id: string
  name: string
  desc: string
  game: string
  icon: string
}

export const ALL_ACHIEVEMENTS: Achievement[] = [
  { id: 'tetris_first', name: '첫 테트리스', desc: '테트리스 첫 게임 완료', game: 'tetris', icon: '🎮' },
  { id: 'tetris_master', name: '테트리스 마스터', desc: '5000점 달성', game: 'tetris', icon: '🏆' },
  { id: 'survive_60s', name: '생존자', desc: '60초 생존', game: 'survive', icon: '⚔️' },
  { id: 'survive_300s', name: '장기 생존', desc: '5분 생존', game: 'survive', icon: '🛡️' },
  { id: 'survive_kills', name: '킬 머신', desc: '100킬 달성', game: 'survive', icon: '💀' },
  { id: 'tower_wave5', name: '수비수', desc: '웨이브 5 달성', game: 'tower', icon: '🗼' },
  { id: 'tower_wave15', name: '철벽 수비', desc: '웨이브 15 달성', game: 'tower', icon: '🏰' },
  { id: 'typing_40wpm', name: '타이피스트', desc: 'WPM 40 달성', game: 'typing', icon: '⌨️' },
  { id: 'typing_80wpm', name: '속타자', desc: 'WPM 80 달성', game: 'typing', icon: '⚡' },
  { id: 'first_game', name: '첫 도전', desc: '첫 게임 플레이', game: 'all', icon: '🌟' },
  { id: 'all_games', name: '게임 마니아', desc: '4개 게임 모두 플레이', game: 'all', icon: '🎯' },
  { id: 'typing_perfect', name: '완벽한 타이핑', desc: '정확도 100%', game: 'typing', icon: '✨' },
]

export function getEarned(): Record<string, number> {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem('achievements') ?? '{}') } catch { return {} }
}

export function markEarned(id: string): void {
  if (typeof window === 'undefined') return
  const earned = getEarned()
  if (!earned[id]) {
    earned[id] = Date.now()
    localStorage.setItem('achievements', JSON.stringify(earned))
  }
}

export function checkTypingAchievements(wpm: number, accuracy: number): Achievement[] {
  const newlyEarned: Achievement[] = []
  const earned = getEarned()
  const check = (id: string) => {
    if (!earned[id]) {
      markEarned(id)
      newlyEarned.push(ALL_ACHIEVEMENTS.find(a => a.id === id)!)
    }
  }
  if (wpm > 0) check('first_game')
  if (wpm >= 40) check('typing_40wpm')
  if (wpm >= 80) check('typing_80wpm')
  if (accuracy === 100) check('typing_perfect')
  return newlyEarned.filter(Boolean)
}
