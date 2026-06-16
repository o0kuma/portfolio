'use client'

import type { SurviveHudSnapshot } from '@/lib/survive/types'
import { formatTime } from '@/lib/survive/storage'

export default function SurviveHud({ hud }: { hud: SurviveHudSnapshot }) {
  const hpRatio = hud.maxHp > 0 ? Math.max(0, hud.hp / hud.maxHp) : 0
  const xpRatio = hud.xpToNext > 0 ? Math.min(1, hud.xp / hud.xpToNext) : 0

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col gap-2 p-3">
      {/* XP bar (full width, top) */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-cyan-400 transition-[width] duration-100"
          style={{ width: `${xpRatio * 100}%` }}
        />
      </div>

      <div className="flex items-center justify-between gap-3 font-mono text-xs text-white/90">
        <span className="rounded bg-black/40 px-2 py-1 tabular-nums">
          ⏱ {formatTime(hud.timeSec)}
        </span>
        <span className="rounded bg-black/40 px-2 py-1">Lv.{hud.level}</span>
        <span className="rounded bg-black/40 px-2 py-1 tabular-nums">☠ {hud.kills}</span>
      </div>

      {/* HP bar */}
      <div className="flex items-center gap-2">
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-rose-500 transition-[width] duration-100"
            style={{ width: `${hpRatio * 100}%` }}
          />
        </div>
        <span className="font-mono text-[11px] tabular-nums text-white/80">
          {hud.hp}/{hud.maxHp}
        </span>
      </div>
    </div>
  )
}
