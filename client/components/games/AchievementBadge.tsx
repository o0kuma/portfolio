'use client'

import { ACHIEVEMENTS } from '@/lib/tower-defense/achievements'
import type { AchievementId } from '@/lib/tower-defense/achievements'
import { useLanguage } from '@/lib/LanguageContext'

type Props = { unlocked: Set<AchievementId> }

export default function AchievementBadge({ unlocked }: Props) {
  const { locale } = useLanguage()

  return (
    <div className="w-full rounded-xl border border-white/10 bg-slate-900/60 p-4">
      <h3 className="mb-3 text-sm font-semibold text-white/80">
        {locale === 'ko' ? '업적' : 'Achievements'}{' '}
        <span className="text-amber-400">{unlocked.size}/{ACHIEVEMENTS.length}</span>
      </h3>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        {ACHIEVEMENTS.map((a) => {
          const done = unlocked.has(a.id)
          return (
            <div
              key={a.id}
              title={done ? (locale === 'ko' ? a.descKo : a.descEn) : undefined}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs transition ${
                done
                  ? 'border border-amber-400/30 bg-amber-400/10 text-white'
                  : 'border border-white/5 bg-black/30 text-white/30'
              }`}
            >
              <span className={`text-base leading-none ${done ? '' : 'grayscale opacity-40'}`}>
                {a.emoji}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold">
                  {done ? (locale === 'ko' ? a.nameKo : a.nameEn) : '???'}
                </p>
                {done && (
                  <p className="truncate text-[10px] text-white/50">
                    {locale === 'ko' ? a.descKo : a.descEn}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
