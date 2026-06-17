'use client'

import { useLanguage } from '@/lib/LanguageContext'
import type { Upgrade } from '@/lib/tower-defense/upgrades'

type Props = {
  choices: Upgrade[]
  onChoose: (u: Upgrade) => void
}

export default function TowerDefenseUpgrade({ choices, onChoose }: Props) {
  const { t } = useLanguage()
  const g = t.towerDefenseGame
  if (choices.length === 0) return null
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md">
        <h3 className="mb-1 text-center font-display text-2xl font-bold text-white">
          {g.upgradeTitle}
        </h3>
        <p className="mb-5 text-center text-sm text-white/60">{g.chooseUpgrade}</p>
        <div className="flex flex-col gap-3">
          {choices.map((u) => {
            const info = g.upgrades[u.i18nKey as keyof typeof g.upgrades]
            return (
              <button
                key={u.id}
                type="button"
                onClick={() => onChoose(u)}
                className="group rounded-xl border border-white/15 bg-white/5 p-4 text-left transition hover:border-amber-400/60 hover:bg-amber-400/10"
              >
                <div className="font-semibold text-white group-hover:text-amber-200">
                  {info.name}
                </div>
                <div className="mt-1 text-sm text-white/55">{info.desc}</div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
