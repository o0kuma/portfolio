'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { FiArrowLeft, FiPause, FiPlay } from 'react-icons/fi'
import TowerDefenseCanvas from '@/components/tower-defense/TowerDefenseCanvas'
import TowerDefenseHud from '@/components/tower-defense/TowerDefenseHud'
import TowerDefenseUpgrade from '@/components/tower-defense/TowerDefenseUpgrade'
import TowerDefenseLeaderboard from '@/components/tower-defense/TowerDefenseLeaderboard'
import TowerDefensePlayerName from '@/components/tower-defense/TowerDefensePlayerName'
import AchievementToast from '@/components/tower-defense/AchievementToast'
import AchievementPanel from '@/components/tower-defense/AchievementPanel'
import { useTowerDefenseGame } from '@/hooks/useTowerDefenseGame'
import { useAchievements } from '@/hooks/useAchievements'
import { useLanguage } from '@/lib/LanguageContext'
import { interpolate } from '@/lib/i18n'
import { MAP_DEFS, START_LIVES } from '@/lib/tower-defense/constants'
import { dailyChallengeDay } from '@/lib/tower-defense/leaderboardClient'
import { TOWER_DEFS } from '@/lib/tower-defense/towers'
import type { TowerKind } from '@/lib/tower-defense/types'

export default function TowerDefensePageClient() {
  const { engineRef, hud, choices, speed, muted, mapId, autoStart, autoCountdown, challengeDay, actions } =
    useTowerDefenseGame()
  const { t } = useLanguage()
  const p = t.towerDefensePage
  const g = t.towerDefenseGame
  const status = hud.status
  const [lbRefreshKey, setLbRefreshKey] = useState(0)
  const [showDaily, setShowDaily] = useState(false)

  const { unlocked, newlyUnlocked, checkAndUpdate, clearNew } = useAchievements()

  // Check achievements whenever relevant HUD values change
  useEffect(() => {
    if (status !== 'playing' && status !== 'paused' && status !== 'upgrade' && status !== 'gameover') return
    const builtKinds = new Set<string>(
      (engineRef.current?.towers ?? []).map((t) => {
        // Only count base tower kinds
        const base = ['pulse', 'splash', 'frost', 'beam']
        return base.includes(t.kind) ? t.kind : null
      }).filter(Boolean) as string[]
    )
    checkAndUpdate({
      wave: hud.wave,
      kills: hud.kills,
      evolveCount: hud.stats.evolveCount,
      livesLost: START_LIVES - hud.lives,
      builtKinds,
      goldEarned: hud.stats.goldEarned,
    })
  }, [hud.wave, hud.kills, hud.stats.evolveCount, hud.lives, hud.stats.goldEarned, status, engineRef, checkAndUpdate])

  const eventLabels = {
    rush: g.events.rush,
    armored: g.events.armored,
    swarm: g.events.swarm,
    elite: g.events.elite,
  }

  const stats = hud.stats
  const topTower = (Object.entries(stats.killsByKind) as Array<[TowerKind, number]>)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])[0]

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
          <TowerDefenseCanvas
            engineRef={engineRef}
            status={status}
            mapId={mapId}
            onTap={actions.tapWorld}
            labels={{ boss: g.boss, wave: g.waveBanner, evolved: g.evolved, events: eventLabels }}
          />

          {(status === 'playing' || status === 'paused' || status === 'upgrade') && (
            <TowerDefenseHud
              hud={hud}
              speed={speed}
              muted={muted}
              autoStart={autoStart}
              autoCountdown={autoCountdown}
              onSelectBuild={actions.selectBuild}
              onNextWave={actions.nextWave}
              onUpgrade={actions.upgradeTower}
              onSell={actions.sellTower}
              onEvolve={actions.evolveTower}
              onDeselect={actions.deselect}
              onToggleSpeed={actions.toggleSpeed}
              onToggleMute={actions.toggleMute}
              onToggleAuto={actions.toggleAuto}
            />
          )}

          {status === 'upgrade' && (
            <TowerDefenseUpgrade choices={choices} onChoose={actions.chooseUpgrade} />
          )}

          {status === 'paused' && (
            <div className="absolute inset-0 z-30 flex items-center justify-center px-6">
              <div className="w-full max-w-xs rounded-xl bg-slate-900/95 p-5 text-center shadow-lg ring-1 ring-slate-700">
                <p className="text-base font-semibold text-slate-100">{p.pause}</p>
                <p className="mt-1 text-xs text-slate-400">{p.pauseResumeHint}</p>
                <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-left text-xs">
                  <dt className="text-slate-400">{g.stats.goldEarned}</dt>
                  <dd className="text-right font-mono tabular-nums text-amber-300">
                    {stats.goldEarned.toLocaleString()}
                  </dd>
                  <dt className="text-slate-400">{g.stats.goldSpent}</dt>
                  <dd className="text-right font-mono tabular-nums text-slate-200">
                    {stats.goldSpent.toLocaleString()}
                  </dd>
                  <dt className="text-slate-400">{g.stats.evolveCount}</dt>
                  <dd className="text-right font-mono tabular-nums text-fuchsia-300">
                    {stats.evolveCount}
                  </dd>
                  <dt className="text-slate-400">{g.stats.topTower}</dt>
                  <dd className="text-right font-mono text-slate-200">
                    {topTower
                      ? `${TOWER_DEFS[topTower[0]].emoji} ${g.towers[topTower[0]].name} (${topTower[1]})`
                      : '—'}
                  </dd>
                </dl>
              </div>
            </div>
          )}

          {status === 'ready' && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 overflow-y-auto bg-slate-950/85 px-6 py-8 text-center">
              <h2 className="font-display text-3xl font-bold text-white">{p.readyTitle}</h2>
              <p className="max-w-sm text-sm leading-relaxed text-white/65">{p.readyDesc}</p>

              {/* Map picker (Feature 3) */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                {MAP_DEFS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => actions.selectMap(m.id)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                      mapId === m.id
                        ? 'border-amber-400 bg-amber-400/20 text-amber-200'
                        : 'border-white/15 bg-black/40 text-white/70 hover:border-white/40'
                    }`}
                  >
                    {p.maps[m.nameKey]}
                  </button>
                ))}
              </div>

              <p className="text-xs text-white/45">{p.readyControls}</p>
              <p className="max-w-sm text-xs text-amber-300/80">✦ {g.recipeHint}</p>
              {hud.bestWave > 0 && (
                <p className="font-mono text-xs text-amber-300">
                  {interpolate(p.bestRecord, { n: hud.bestWave })}
                </p>
              )}
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => actions.start()}
                  className="rounded-lg bg-amber-500 px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
                >
                  {p.start}
                </button>
                <button
                  type="button"
                  onClick={() => actions.start({ daily: true })}
                  className="rounded-lg border border-cyan-400/60 bg-cyan-400/10 px-6 py-2.5 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/20"
                >
                  {p.dailyChallenge}
                </button>
              </div>
            </div>
          )}

          {status === 'gameover' && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-slate-950/85 px-6 text-center">
              <h2 className="font-display text-3xl font-bold text-white">{p.gameOver}</h2>
              {challengeDay && (
                <p className="text-xs font-semibold text-cyan-300">{p.dailyChallenge}</p>
              )}
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

        <div className="mt-8 flex flex-col items-center gap-6">
          <TowerDefensePlayerName />

          <div className="flex w-full flex-col gap-2">
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setShowDaily(false)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  !showDaily ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {g.leaderboard.title}
              </button>
              <button
                type="button"
                onClick={() => setShowDaily(true)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  showDaily ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {g.leaderboard.dailyTitle}
              </button>
            </div>
            <TowerDefenseLeaderboard
              key={showDaily ? 'daily' : 'normal'}
              refreshKey={lbRefreshKey}
              day={showDaily ? dailyChallengeDay() : undefined}
            />
          </div>

          <AchievementPanel unlocked={unlocked} />
        </div>
      </main>

      {newlyUnlocked.length > 0 && (
        <AchievementToast achievements={newlyUnlocked} onDone={clearNew} />
      )}
    </div>
  )
}
