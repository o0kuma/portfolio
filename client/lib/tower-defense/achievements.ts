export type AchievementId =
  | 'wave10' | 'wave25' | 'wave50'
  | 'kills100' | 'kills500' | 'kills1000'
  | 'evolve1' | 'evolve5'
  | 'noLoss'    // reach wave 10 without losing a life
  | 'allTowers' // build all 4 base tower types in one run
  | 'gold500'   // earn 500 gold in one run

export interface Achievement {
  id: AchievementId
  emoji: string
  nameKo: string
  nameEn: string
  descKo: string
  descEn: string
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'wave10',    emoji: '🌊', nameKo: '파도타기',     nameEn: 'Surfer',          descKo: '웨이브 10 달성',               descEn: 'Reach wave 10'            },
  { id: 'wave25',    emoji: '🌊', nameKo: '파도 마스터',  nameEn: 'Wave Master',     descKo: '웨이브 25 달성',               descEn: 'Reach wave 25'            },
  { id: 'wave50',    emoji: '🏆', nameKo: '전설의 방어선', nameEn: 'Legendary',      descKo: '웨이브 50 달성',               descEn: 'Reach wave 50'            },
  { id: 'kills100',  emoji: '⚔️', nameKo: '백전백승',     nameEn: 'Centurion',       descKo: '적 100마리 처치',              descEn: 'Kill 100 enemies'         },
  { id: 'kills500',  emoji: '⚔️', nameKo: '도살자',       nameEn: 'Slaughterer',     descKo: '적 500마리 처치',              descEn: 'Kill 500 enemies'         },
  { id: 'kills1000', emoji: '💀', nameKo: '절멸자',       nameEn: 'Exterminator',    descKo: '적 1000마리 처치',             descEn: 'Kill 1000 enemies'        },
  { id: 'evolve1',   emoji: '✨', nameKo: '첫 진화',      nameEn: 'First Evolution', descKo: '타워 진화 1회',                descEn: 'Evolve a tower once'      },
  { id: 'evolve5',   emoji: '🌟', nameKo: '진화의 달인',  nameEn: 'Evo Master',      descKo: '타워 진화 5회',                descEn: 'Evolve towers 5 times'    },
  { id: 'noLoss',    emoji: '🛡️', nameKo: '무결점 방어',  nameEn: 'Flawless',        descKo: '웨이브 10까지 생명 손실 없음', descEn: 'No lives lost by wave 10' },
  { id: 'allTowers', emoji: '🏗️', nameKo: '전략가',       nameEn: 'Strategist',      descKo: '한 게임에 4종 타워 모두 건설', descEn: 'Build all 4 tower types'  },
  { id: 'gold500',   emoji: '💰', nameKo: '황금 손',      nameEn: 'Midas Touch',     descKo: '한 게임에 골드 500 획득',      descEn: 'Earn 500 gold in one run' },
]

const STORAGE_KEY = 'td_achievements'

export function loadUnlockedAchievements(): Set<AchievementId> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as AchievementId[])
  } catch {
    return new Set()
  }
}

export function saveUnlockedAchievements(ids: Set<AchievementId>): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)))
}

export interface AchievementCheckInput {
  wave: number
  kills: number
  evolveCount: number
  livesLost: number   // START_LIVES - current lives
  builtKinds: Set<string>
  goldEarned: number
}

/** Returns newly unlocked achievement IDs */
export function checkAchievements(
  input: AchievementCheckInput,
  alreadyUnlocked: Set<AchievementId>,
): AchievementId[] {
  const newly: AchievementId[] = []
  const check = (id: AchievementId, cond: boolean) => {
    if (cond && !alreadyUnlocked.has(id)) newly.push(id)
  }
  check('wave10', input.wave >= 10)
  check('wave25', input.wave >= 25)
  check('wave50', input.wave >= 50)
  check('kills100', input.kills >= 100)
  check('kills500', input.kills >= 500)
  check('kills1000', input.kills >= 1000)
  check('evolve1', input.evolveCount >= 1)
  check('evolve5', input.evolveCount >= 5)
  check('noLoss', input.wave >= 10 && input.livesLost === 0)
  check('allTowers', ['pulse', 'splash', 'frost', 'beam'].every(k => input.builtKinds.has(k)))
  check('gold500', input.goldEarned >= 500)
  return newly
}
