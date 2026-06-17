'use client'

import Link from 'next/link'
import { useState } from 'react'
import { FiArrowLeft, FiPause, FiPlay } from 'react-icons/fi'
import TowerDefenseCanvas from '@/components/tower-defense/TowerDefenseCanvas'
import TowerDefenseHud from '@/components/tower-defense/TowerDefenseHud'
import TowerDefenseUpgrade from '@/components/tower-defense/TowerDefenseUpgrade'
import TowerDefenseLeaderboard from '@/components/tower-defense/TowerDefenseLeaderboard'
import { useTowerDefenseGame } from '@/hooks/useTowerDefenseGame'
import { useLanguage } from '@/lib/LanguageContext'
import { interpolate } from '@/lib/i18n'

export default function TowerDefensePageClient() {
  const { engineRef, hud, choices, actions } = useTowerDefenseGame()
  const { t } = useLanguage()
  const p = t.towerDefensePage
  const status = hud.status
  const [lbRefreshKey, setLbRefreshKey] = useState(0)

  return (
    <div className="min-h-screen bg-canvas pb-8 text-textPrimary">
      <header className="sticky top-0 z-30 glass-panel border-b border-border">
        <div
          className="page-shell flex max-w-4xl items-center gap-4 py-3"
          style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
        >
          <Link
            href="/games"
            className="inline-flex items-center gap-2 text-sm font-medium text-textMuted transition hover:text-primary-600 dark:hover:text-accent"
          >
            <FiArrowLeft className="h-4 w-4" aria-hidden />
            {p.back}
          </Link>
          <span className="text-sm font-semibold text-textPrimary">{p.title}</span>
          {status === 'playing' || status === 'paused' ? (
            <button
              type="button"
              onClick={actions.togglePause}
              className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-textMuted transition hover:text-primary-600 dark:hover:text-accent"
            >
              {status === 'paused' ? <FiPlay className="h-3.5 w-3.5" /> : <FiPause className="h-3.5 w-3.5" />}
              {status === 'paused' ? p.resume : p.pause}
            </button>
          ) : null}
        </div>
      </header>

      <main className="page-shell max-w-4xl pt-6">
        <div
          className="relative w-full overflow-hidden rounded-xl ring-1 ring-slate-700"
          style={{ height: 'min(64vh, 560px)' }}
        >
          <TowerDefenseCanvas engineRef={engineRef} status={status} onTap={actions.tapWorld} />

          {(status === 'playing' || status === 'paused' || status === 'upgrade') && (
            <TowerDefenseHud
              hud={hud}
              onSelectBuild={actions.selectBuild}
              onNextWave={actions.nextWave}
              onUpgrade={actions.upgradeTower}
              onSell={actions.sellTower}
              onDeselect={actions.deselect}
            />
          )}

          {status === 'upgrade' && (
            <TowerDefenseUpgrade choices={choices} onChoose={actions.chooseUpgrade} />
          )}

          {status === 'paused' && (
            <div className="absolute inset-0 z-30 flex items-center justify-center">
              <div className="rounded-xl bg-white/90 px-6 py-4 text-center shadow-lg dark:bg-slate-800/90">
                <p className="text-base font-semibold text-slate-800 dark:text-slate-100">{p.pause}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{p.pauseResumeHint}</p>
              </div>
            </div>
          )}

          {status === 'ready' && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-5 bg-slate-950/85 px-6 text-center">
              <h2 className="font-display text-3xl font-bold text-white">{p.readyTitle}</h2>
              <p className="max-w-sm text-sm leading-relaxed text-white/65">{p.readyDesc}</p>
              <p className="text-xs text-white/45">{p.readyControls}</p>
              {hud.bestWave > 0 && (
                <p className="font-mono text-xs text-amber-300">
                  {interpolate(p.bestRecord, { n: hud.bestWave })}
                </p>
              )}
              <button
                type="button"
                onClick={actions.start}
                className="rounded-lg bg-amber-500 px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
              >
                {p.start}
              </button>
            </div>
          )}

          {status === 'gameover' && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-slate-950/85 px-6 text-center">
              <h2 className="font-display text-3xl font-bold text-white">{p.gameOver}</h2>
              <p className="text-sm text-white/75">
                {interpolate(p.gameOverStats, { wave: hud.wave, kills: hud.kills })}
              </p>
              <p className="font-mono text-xs text-amber-300">
                {interpolate(p.bestRecord, { n: hud.bestWave })}
              </p>
              <button
                type="button"
                onClick={() => {
                  setLbRefreshKey((k) => k + 1)
                  actions.restart()
                }}
                className="mt-2 rounded-lg bg-amber-500 px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
              >
                {p.restart}
              </button>
            </div>
          )}
        </div>

        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">{p.controlsHint}</p>

        <div className="mt-8">
          <TowerDefenseLeaderboard refreshKey={lbRefreshKey} />
        </div>
      </main>
    </div>
  )
}
