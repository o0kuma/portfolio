'use client'

import { useLanguage } from '@/lib/LanguageContext'
import { interpolate } from '@/lib/i18n'
import type { TowerDefenseHudSnapshot, TowerKind } from '@/lib/tower-defense/types'
import { TOWER_DEFS, TOWER_ORDER } from '@/lib/tower-defense/towers'

type Props = {
  hud: TowerDefenseHudSnapshot
  onSelectBuild: (kind: TowerKind) => void
  onNextWave: () => void
  onUpgrade: () => void
  onSell: () => void
  onDeselect: () => void
}

export default function TowerDefenseHud({
  hud,
  onSelectBuild,
  onNextWave,
  onUpgrade,
  onSell,
  onDeselect,
}: Props) {
  const { t } = useLanguage()
  const g = t.towerDefenseGame

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col gap-2 p-3">
      {/* top stat row */}
      <div className="flex items-center justify-between gap-2 font-mono text-xs text-white/90">
        <span className="rounded bg-black/50 px-2 py-1 tabular-nums text-amber-300">
          🪙 {hud.gold}
        </span>
        <span className="rounded bg-black/50 px-2 py-1 tabular-nums text-rose-300">
          ❤ {hud.lives}
        </span>
        <span className="rounded bg-black/50 px-2 py-1 tabular-nums">
          {interpolate(g.waveLabel, { n: hud.wave })}
        </span>
        <span className="rounded bg-black/50 px-2 py-1 tabular-nums">☠ {hud.kills}</span>
      </div>

      {/* tower selection panel (bottom) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-2 p-3">
        {hud.inspectKind && (
          <div className="pointer-events-auto mx-auto flex items-center gap-2 rounded-lg bg-black/70 px-3 py-2 text-xs text-white">
            <span className="font-semibold">
              {TOWER_DEFS[hud.inspectKind].emoji} {g.towers[hud.inspectKind].name} Lv.{hud.inspectLevel}
            </span>
            <button
              type="button"
              onClick={onUpgrade}
              disabled={!hud.canUpgrade}
              className="rounded bg-cyan-500 px-2 py-1 font-semibold text-slate-950 transition enabled:hover:bg-cyan-400 disabled:opacity-40"
            >
              {hud.inspectLevel >= 3
                ? g.maxLevel
                : interpolate(g.upgradeFor, { cost: hud.upgradeCost })}
            </button>
            <button
              type="button"
              onClick={onSell}
              className="rounded bg-rose-600 px-2 py-1 font-semibold text-white transition hover:bg-rose-500"
            >
              {interpolate(g.sellFor, { value: hud.sellValue })}
            </button>
            <button
              type="button"
              onClick={onDeselect}
              className="rounded bg-slate-700 px-2 py-1 text-white transition hover:bg-slate-600"
            >
              ✕
            </button>
          </div>
        )}

        <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2">
          {TOWER_ORDER.map((kind) => {
            const def = TOWER_DEFS[kind]
            const active = hud.selected === kind
            const afford = hud.gold >= def.cost
            return (
              <button
                key={kind}
                type="button"
                onClick={() => onSelectBuild(kind)}
                className={`flex flex-col items-center rounded-lg border px-2.5 py-1.5 text-[11px] font-mono transition ${
                  active
                    ? 'border-cyan-400 bg-cyan-400/20 text-white'
                    : afford
                      ? 'border-white/15 bg-black/50 text-white/90 hover:border-white/40'
                      : 'border-white/10 bg-black/40 text-white/40'
                }`}
              >
                <span className="text-base leading-none">{def.emoji}</span>
                <span>{g.towers[kind].name}</span>
                <span className="text-amber-300">🪙{def.cost}</span>
              </button>
            )
          })}

          <button
            type="button"
            onClick={onNextWave}
            disabled={!hud.waveIdle}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 transition enabled:hover:bg-emerald-400 disabled:opacity-40"
          >
            {hud.waveIdle ? g.nextWave : interpolate(g.enemiesLeft, { n: hud.enemiesLeft })}
          </button>
        </div>
      </div>
    </div>
  )
}
