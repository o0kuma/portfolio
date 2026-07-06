'use client'

import { useEffect, useRef, useState } from 'react'
import { FiHeart, FiTarget, FiVolume2, FiVolumeX, FiZap } from 'react-icons/fi'
import { useLanguage } from '@/lib/LanguageContext'
import { interpolate } from '@/lib/i18n'
import type { TowerDefenseHudSnapshot, TowerKind } from '@/lib/tower-defense/types'
import { TOWER_DEFS, TOWER_ORDER } from '@/lib/tower-defense/towers'

type Props = {
  hud: TowerDefenseHudSnapshot
  speed: number
  muted: boolean
  autoStart: boolean
  autoCountdown: number | null
  onSelectBuild: (kind: TowerKind) => void
  onNextWave: () => void
  onUpgrade: () => void
  onSell: () => void
  onEvolve: () => void
  onDeselect: () => void
  onToggleSpeed: () => void
  onToggleMute: () => void
  onToggleAuto: () => void
}

const ENEMY_ICON: Record<'normal' | 'fast' | 'tank' | 'boss' | 'ghost' | 'regen', string> = {
  normal: '🟢',
  fast: '🟡',
  tank: '⬜',
  boss: '🔴',
  ghost: '👻',
  regen: '💚',
}

/** Pill whose value flashes briefly when it changes. */
function StatPill({
  icon,
  value,
  tone,
}: {
  icon: React.ReactNode
  value: number | string
  tone: string
}) {
  const prev = useRef(value)
  const [flash, setFlash] = useState(false)
  useEffect(() => {
    if (prev.current !== value) {
      prev.current = value
      setFlash(true)
      const id = setTimeout(() => setFlash(false), 220)
      return () => clearTimeout(id)
    }
  }, [value])
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border border-white/10 bg-black/55 px-2 py-1 tabular-nums backdrop-blur-sm transition-transform ${tone} ${
        flash ? 'scale-110' : 'scale-100'
      }`}
    >
      {icon}
      {value}
    </span>
  )
}

export default function TowerDefenseHud({
  hud,
  speed,
  muted,
  autoStart,
  autoCountdown,
  onSelectBuild,
  onNextWave,
  onUpgrade,
  onSell,
  onEvolve,
  onDeselect,
  onToggleSpeed,
  onToggleMute,
  onToggleAuto,
}: Props) {
  const { t } = useLanguage()
  const g = t.towerDefenseGame
  const preview = hud.nextWavePreview

  // wave progress: how much of the active wave is dealt with
  const totalWave = hud.enemiesLeft
  const showProgress = hud.wave > 0 && !hud.waveIdle

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col gap-2 p-3">
      {/* top stat row */}
      <div className="flex items-center justify-between gap-1.5 font-mono text-[11px] text-white/90 sm:text-xs">
        <div className="flex items-center gap-1.5">
          <StatPill icon={<span className="text-amber-300">◉</span>} value={hud.gold} tone="text-amber-300" />
          <StatPill icon={<FiHeart className="h-3 w-3" />} value={hud.lives} tone="text-rose-300" />
        </div>
        <div className="flex items-center gap-1.5">
          <StatPill
            icon={<span className="text-white/60">W</span>}
            value={hud.wave}
            tone="text-white"
          />
          <StatPill icon={<FiTarget className="h-3 w-3" />} value={hud.kills} tone="text-white/80" />
          <button
            type="button"
            onClick={onToggleSpeed}
            className="pointer-events-auto inline-flex items-center rounded-md border border-white/10 bg-black/55 px-2 py-1 font-semibold text-cyan-300 transition hover:border-cyan-400/60"
          >
            {speed}x
          </button>
          <button
            type="button"
            onClick={onToggleMute}
            aria-label="mute"
            className="pointer-events-auto inline-flex items-center rounded-md border border-white/10 bg-black/55 px-2 py-1 text-white/70 transition hover:border-white/40"
          >
            {muted ? <FiVolumeX className="h-3 w-3" /> : <FiVolume2 className="h-3 w-3" />}
          </button>
          <button
            type="button"
            onClick={onToggleAuto}
            aria-label="auto next wave"
            className={`pointer-events-auto inline-flex items-center rounded-md border px-2 py-1 font-semibold transition ${
              autoStart
                ? 'border-emerald-400/60 bg-emerald-400/20 text-emerald-300'
                : 'border-white/10 bg-black/55 text-white/60 hover:border-white/40'
            }`}
          >
            {g.autoLabel}
          </button>
        </div>
      </div>

      {/* wave progress bar */}
      {showProgress && (
        <div className="mx-auto h-1 w-40 overflow-hidden rounded-full bg-black/50">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-[width] duration-200"
            style={{ width: `${Math.max(4, 100 - Math.min(100, totalWave * 6))}%` }}
          />
        </div>
      )}

      {/* bottom panels */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-2 p-3">
        {hud.inspectKind && (
          <div className="pointer-events-auto mx-auto flex max-w-full flex-wrap items-center justify-center gap-2 rounded-xl border border-white/10 bg-gradient-to-b from-slate-900/90 to-slate-950/90 px-3 py-2 text-xs text-white shadow-lg">
            <span className="font-semibold">
              {TOWER_DEFS[hud.inspectKind].emoji} {g.towers[hud.inspectKind].name} Lv.{hud.inspectLevel}
            </span>
            <button
              type="button"
              onClick={onUpgrade}
              disabled={!hud.canUpgrade}
              className="rounded-md bg-cyan-500 px-2 py-1 font-semibold text-slate-950 transition enabled:hover:bg-cyan-400 disabled:opacity-40"
            >
              {hud.inspectLevel >= 3
                ? g.maxLevel
                : interpolate(g.upgradeFor, { cost: hud.upgradeCost })}
            </button>
            {hud.canEvolve && hud.evolveKind && (
              <button
                type="button"
                onClick={onEvolve}
                className="animate-pulse rounded-md bg-gradient-to-r from-amber-400 to-fuchsia-500 px-2.5 py-1 font-bold text-slate-950 shadow-[0_0_12px_rgba(217,70,239,0.6)] transition hover:brightness-110"
              >
                ✦ {interpolate(g.evolveFor, {
                  name: g.towers[hud.evolveKind].name,
                  cost: hud.evolveCost,
                })}
              </button>
            )}
            <button
              type="button"
              onClick={onSell}
              className="rounded-md bg-rose-600 px-2 py-1 font-semibold text-white transition hover:bg-rose-500"
            >
              {interpolate(g.sellFor, { value: hud.sellValue })}
            </button>
            <button
              type="button"
              onClick={onDeselect}
              className="rounded-md bg-slate-700 px-2 py-1 text-white transition hover:bg-slate-600"
            >
              ✕
            </button>
            {hud.synergyHint && (
              <p className="w-full text-center text-[10px] text-amber-300/80">
                ✦{' '}
                {interpolate(g.synergyHint, {
                  self: g.towers[hud.inspectKind].name,
                  partner: g.towers[hud.synergyHint.partnerKind].name,
                  result: g.towers[hud.synergyHint.evolveKind].name,
                })}
              </p>
            )}
          </div>
        )}

        {/* next-wave preview (Feature 1) + event badge (Feature 4) */}
        {hud.waveIdle && preview && (
          <div className="pointer-events-auto mx-auto flex max-w-full flex-wrap items-center justify-center gap-2 rounded-lg border border-white/10 bg-black/55 px-3 py-1.5 text-[11px] text-white/85 backdrop-blur-sm">
            <span className="text-white/55">{g.nextWavePreview}</span>
            {(['normal', 'fast', 'tank', 'boss', 'ghost', 'regen'] as const).map((k) =>
              preview[k] > 0 ? (
                <span key={k} className="inline-flex items-center gap-0.5 tabular-nums">
                  <span>{ENEMY_ICON[k]}</span>
                  {preview[k]}
                </span>
              ) : null,
            )}
            {preview.boss > 0 && (
              <span className="rounded bg-rose-500/30 px-1.5 py-0.5 font-bold text-rose-300">
                {g.boss}
              </span>
            )}
            {preview.event && (
              <span className="rounded bg-amber-500/30 px-1.5 py-0.5 font-bold text-amber-300">
                {g.events[preview.event]}
              </span>
            )}
          </div>
        )}

        <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-1.5">
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
                    ? 'border-cyan-400 bg-cyan-400/20 text-white shadow-[0_0_10px_rgba(34,211,238,0.5)] ring-1 ring-cyan-400'
                    : afford
                      ? 'border-white/15 bg-black/55 text-white/90 hover:border-white/40'
                      : 'border-white/10 bg-black/40 text-white/40'
                }`}
              >
                <span className="text-base leading-none">{def.emoji}</span>
                <span>{g.towers[kind].name}</span>
                <span className="text-amber-300">◉{def.cost}</span>
                {active && (
                  <span className="mt-0.5 flex items-center gap-1 text-[9px] text-white/60">
                    <FiZap className="h-2.5 w-2.5" />
                    {Math.round(def.damage)}·{(1000 / def.fireRateMs).toFixed(1)}/s·{def.range}
                  </span>
                )}
              </button>
            )
          })}

          <button
            type="button"
            onClick={onNextWave}
            disabled={!hud.waveIdle}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 transition enabled:hover:bg-emerald-400 disabled:opacity-40"
          >
            {hud.waveIdle
              ? autoStart && autoCountdown != null
                ? interpolate(g.autoCountdown, { n: autoCountdown })
                : g.nextWave
              : interpolate(g.enemiesLeft, { n: hud.enemiesLeft })}
          </button>
        </div>
      </div>
    </div>
  )
}
