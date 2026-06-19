import { describe, it, expect } from 'vitest'
import { checkAchievements } from '../achievements'

const base = {
  wave: 0, kills: 0, evolveCount: 0, livesLost: 0,
  builtKinds: new Set<string>(), goldEarned: 0,
}

describe('checkAchievements', () => {
  it('unlocks wave10 at wave 10', () => {
    expect(checkAchievements({ ...base, wave: 10 }, new Set())).toContain('wave10')
  })
  it('does not re-unlock already unlocked achievements', () => {
    expect(checkAchievements({ ...base, wave: 10 }, new Set(['wave10']))).not.toContain('wave10')
  })
  it('unlocks kills100 at 100 kills', () => {
    expect(checkAchievements({ ...base, kills: 100 }, new Set())).toContain('kills100')
  })
  it('unlocks evolve1 after first evolution', () => {
    expect(checkAchievements({ ...base, evolveCount: 1 }, new Set())).toContain('evolve1')
  })
  it('unlocks noLoss when wave >= 10 with no lives lost', () => {
    expect(checkAchievements({ ...base, wave: 10, livesLost: 0 }, new Set())).toContain('noLoss')
  })
  it('does NOT unlock noLoss if lives were lost', () => {
    expect(checkAchievements({ ...base, wave: 10, livesLost: 1 }, new Set())).not.toContain('noLoss')
  })
  it('unlocks allTowers when all 4 base types built', () => {
    const builtKinds = new Set(['pulse', 'splash', 'frost', 'beam'])
    expect(checkAchievements({ ...base, builtKinds }, new Set())).toContain('allTowers')
  })
  it('unlocks gold500 at 500 gold earned', () => {
    expect(checkAchievements({ ...base, goldEarned: 500 }, new Set())).toContain('gold500')
  })
})
