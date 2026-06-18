import { describe, it, expect } from 'vitest'
import { checkAchievements } from '../achievements'

describe('checkAchievements', () => {
  const base = {
    wave: 0,
    kills: 0,
    evolveCount: 0,
    livesLost: 0,
    builtKinds: new Set<string>(),
    goldEarned: 0,
  }

  it('unlocks wave10 at wave 10', () => {
    const result = checkAchievements({ ...base, wave: 10 }, new Set())
    expect(result).toContain('wave10')
  })

  it('does not re-unlock already unlocked achievements', () => {
    const result = checkAchievements({ ...base, wave: 10 }, new Set(['wave10']))
    expect(result).not.toContain('wave10')
  })

  it('unlocks kills100 at 100 kills', () => {
    const result = checkAchievements({ ...base, kills: 100 }, new Set())
    expect(result).toContain('kills100')
  })

  it('unlocks evolve1 after first evolution', () => {
    const result = checkAchievements({ ...base, evolveCount: 1 }, new Set())
    expect(result).toContain('evolve1')
  })

  it('unlocks noLoss when wave >= 10 and no lives lost', () => {
    const result = checkAchievements({ ...base, wave: 10, livesLost: 0 }, new Set())
    expect(result).toContain('noLoss')
  })

  it('does NOT unlock noLoss if lives were lost', () => {
    const result = checkAchievements({ ...base, wave: 10, livesLost: 1 }, new Set())
    expect(result).not.toContain('noLoss')
  })

  it('unlocks allTowers when all 4 base types built', () => {
    const kinds = new Set(['pulse', 'splash', 'frost', 'beam'])
    const result = checkAchievements({ ...base, builtKinds: kinds }, new Set())
    expect(result).toContain('allTowers')
  })

  it('unlocks gold500 at 500 gold earned', () => {
    const result = checkAchievements({ ...base, goldEarned: 500 }, new Set())
    expect(result).toContain('gold500')
  })
})
