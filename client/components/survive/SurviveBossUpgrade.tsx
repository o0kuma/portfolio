'use client'

import type { Upgrade } from '@/lib/survive/upgrades'

type Props = {
  choices: Upgrade[]
  onChoose: (u: Upgrade) => void
}

export default function SurviveBossUpgrade({ choices, onChoose }: Props) {
  if (choices.length === 0) return null
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/85 backdrop-blur-sm">
      <div
        className="mx-4 w-full max-w-md animate-[fadeInUp_0.3s_ease-out]"
        style={{ animation: 'fadeInUp 0.3s ease-out' }}
      >
        <div className="mb-1 text-center text-amber-400 text-3xl">👑</div>
        <h3 className="mb-1 text-center font-display text-2xl font-bold text-amber-300">Boss Defeated!</h3>
        <p className="mb-5 text-center text-sm text-amber-200/60">Choose a special upgrade</p>
        <div className="flex flex-col gap-3">
          {choices.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => onChoose(u)}
              className="group rounded-xl border border-amber-500/40 bg-amber-900/20 p-4 text-left transition hover:border-amber-400/80 hover:bg-amber-400/15 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            >
              <div className="font-semibold text-amber-200 group-hover:text-amber-100">{u.name}</div>
              <div className="mt-1 text-sm text-amber-300/55">{u.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
