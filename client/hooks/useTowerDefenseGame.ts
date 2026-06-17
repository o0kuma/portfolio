'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { TowerDefenseEngine } from '@/lib/tower-defense/engine'
import { readBest, maybePersistBest } from '@/lib/tower-defense/storage'
import {
  submitTowerDefenseScore,
  dailyChallengeDay,
  dailySeedFromDay,
} from '@/lib/tower-defense/leaderboardClient'
import { rollUpgrades, type Upgrade } from '@/lib/tower-defense/upgrades'
import {
  START_GOLD,
  START_LIVES,
  TD_AUTOSTART_KEY,
  TD_MAP_KEY,
  mapDefById,
  type MapId,
} from '@/lib/tower-defense/constants'
import { TOWER_ORDER } from '@/lib/tower-defense/towers'
import { tdAudio } from '@/lib/tower-defense/audio'
import type { TowerDefenseHudSnapshot, TowerKind, RunStats } from '@/lib/tower-defense/types'

const HUD_THROTTLE_MS = 80 // ~12fps HUD updates
const AUTO_START_DELAY_MS = 3000 // Feature 7: idle countdown before auto next wave

/** The daily-challenge map is fixed per day (rotates through the 3 maps). */
const DAILY_MAPS: MapId[] = ['classic', 'maze', 'highway']
function dailyMapFor(day: string): MapId {
  return DAILY_MAPS[dailySeedFromDay(day) % DAILY_MAPS.length]
}

function emptyStats(): RunStats {
  return {
    goldEarned: 0,
    goldSpent: 0,
    evolveCount: 0,
    killsByKind: {
      pulse: 0,
      splash: 0,
      frost: 0,
      beam: 0,
      blizzard: 0,
      railgun: 0,
      tempest: 0,
      prism: 0,
    },
  }
}

function emptyHud(bestWave: number): TowerDefenseHudSnapshot {
  return {
    status: 'ready',
    gold: START_GOLD,
    lives: START_LIVES,
    wave: 0,
    kills: 0,
    bestWave,
    waveIdle: true,
    enemiesLeft: 0,
    selected: null,
    selectedTowerId: null,
    inspectLevel: 0,
    inspectKind: null,
    upgradeCost: 0,
    sellValue: 0,
    canUpgrade: false,
    canEvolve: false,
    evolveKind: null,
    evolveCost: 0,
    nextWavePreview: null,
    activeEvent: null,
    stats: emptyStats(),
    synergyHint: null,
  }
}

function readStoredMap(): MapId {
  if (typeof window === 'undefined') return 'classic'
  return mapDefById(window.localStorage.getItem(TD_MAP_KEY)).id
}

function readStoredAuto(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(TD_AUTOSTART_KEY) === '1'
}

export function useTowerDefenseGame() {
  const engineRef = useRef<TowerDefenseEngine | null>(null)
  const [hud, setHud] = useState<TowerDefenseHudSnapshot>(() => emptyHud(0))
  const [choices, setChoices] = useState<Upgrade[]>([])
  const [speed, setSpeed] = useState(1)
  const [muted, setMuted] = useState(false)
  const [mapId, setMapId] = useState<MapId>('classic')
  const [autoStart, setAutoStart] = useState(false)
  const [autoCountdown, setAutoCountdown] = useState<number | null>(null)
  /** non-null while this run is a daily challenge (the YYYYMMDD tag) */
  const [challengeDay, setChallengeDay] = useState<string | null>(null)
  const speedRef = useRef(1)
  const autoStartRef = useRef(false)
  const autoTimerRef = useRef<number | null>(null)
  const challengeDayRef = useRef<string | null>(null)

  const rafRef = useRef<number | null>(null)
  const lastTsRef = useRef<number>(0)
  const hudAccRef = useRef<number>(0)
  const persistedRef = useRef(false)
  const choicesEmptyRef = useRef(true)

  // Load best score + persisted prefs once mounted.
  useEffect(() => {
    const best = readBest()
    setHud(emptyHud(best.wave))
    setMuted(tdAudio.isMuted())
    const m = readStoredMap()
    setMapId(m)
    const a = readStoredAuto()
    setAutoStart(a)
    autoStartRef.current = a
  }, [])

  const syncHud = useCallback(() => {
    const e = engineRef.current
    if (e) setHud(e.getHud())
  }, [])

  const loop = useCallback(
    (ts: number) => {
      const e = engineRef.current
      if (!e) return
      const rawDt = lastTsRef.current ? ts - lastTsRef.current : 16
      lastTsRef.current = ts
      const dt = rawDt * speedRef.current

      // step the sim in <=50ms chunks so 2x speed never tunnels
      let remaining = dt
      while (remaining > 0) {
        const chunk = Math.min(remaining, 50)
        e.update(chunk)
        remaining -= chunk
      }

      if (e.status === 'upgrade' && choicesEmptyRef.current) {
        const rolled = rollUpgrades(e, e.takenUpgrades, 3)
        choicesEmptyRef.current = false
        setChoices(rolled)
        syncHud()
      }

      if (e.status === 'gameover' && !persistedRef.current) {
        persistedRef.current = true
        const day = challengeDayRef.current
        // Only the endless mode contributes to the local best record.
        if (!day) maybePersistBest({ wave: e.bestWave, kills: e.kills })
        submitTowerDefenseScore({ wave: e.wave, kills: e.kills, challengeDay: day })
        syncHud()
      }

      hudAccRef.current += dt
      if (hudAccRef.current >= HUD_THROTTLE_MS) {
        hudAccRef.current = 0
        syncHud()
      }

      rafRef.current = requestAnimationFrame(loop)
    },
    [syncHud],
  )

  const startLoop = useCallback(() => {
    if (rafRef.current != null) return
    lastTsRef.current = 0
    rafRef.current = requestAnimationFrame(loop)
  }, [loop])

  const stopLoop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const clearAutoTimer = useCallback(() => {
    if (autoTimerRef.current != null) {
      clearTimeout(autoTimerRef.current)
      autoTimerRef.current = null
    }
    setAutoCountdown(null)
  }, [])

  /** Start a run. Pass a daily YYYYMMDD to begin a deterministic daily challenge. */
  const start = useCallback(
    (opts?: { daily?: boolean }) => {
      clearAutoTimer()
      const daily = opts?.daily ?? false
      const day = daily ? dailyChallengeDay() : null
      const useMap = daily ? dailyMapFor(day as string) : readStoredMap()
      const best = readBest()
      const engine = new TowerDefenseEngine({
        bestWave: daily ? 0 : best.wave,
        pathCells: mapDefById(useMap).pathCells,
        seed: daily ? dailySeedFromDay(day as string) : null,
      })
      engine.status = 'playing'
      engine.onSfx = (ev) => tdAudio.play(ev)
      engineRef.current = engine
      persistedRef.current = false
      choicesEmptyRef.current = true
      challengeDayRef.current = day
      setChallengeDay(day)
      setMapId(useMap)
      setChoices([])
      syncHud()
      startLoop()
    },
    [clearAutoTimer, startLoop, syncHud],
  )

  const restart = useCallback(() => {
    stopLoop()
    start(challengeDayRef.current ? { daily: true } : undefined)
  }, [start, stopLoop])

  const togglePause = useCallback(() => {
    const e = engineRef.current
    if (!e) return
    if (e.status === 'playing') e.status = 'paused'
    else if (e.status === 'paused') e.status = 'playing'
    syncHud()
  }, [syncHud])

  const chooseUpgrade = useCallback(
    (u: Upgrade) => {
      const e = engineRef.current
      if (!e || e.status !== 'upgrade') return
      e.applyUpgrade(u)
      choicesEmptyRef.current = true
      setChoices([])
      syncHud()
    },
    [syncHud],
  )

  const selectBuild = useCallback(
    (kind: TowerKind | null) => {
      const e = engineRef.current
      if (!e) return
      // toggle off if same kind tapped again
      e.selectBuild(e.selected === kind ? null : kind)
      syncHud()
    },
    [syncHud],
  )

  const tapWorld = useCallback(
    (wx: number, wy: number) => {
      const e = engineRef.current
      if (!e) return
      e.handleTap(wx, wy)
      syncHud()
    },
    [syncHud],
  )

  const upgradeTower = useCallback(() => {
    const e = engineRef.current
    if (!e) return
    e.upgradeSelected()
    syncHud()
  }, [syncHud])

  const sellTower = useCallback(() => {
    const e = engineRef.current
    if (!e) return
    e.sellSelected()
    syncHud()
  }, [syncHud])

  const evolveTower = useCallback(() => {
    const e = engineRef.current
    if (!e) return
    e.evolveSelected()
    syncHud()
  }, [syncHud])

  const toggleSpeed = useCallback(() => {
    setSpeed((s) => {
      const next = s === 1 ? 2 : 1
      speedRef.current = next
      return next
    })
  }, [])

  const toggleMute = useCallback(() => {
    setMuted(tdAudio.toggleMute())
  }, [])

  const deselect = useCallback(() => {
    const e = engineRef.current
    if (!e) return
    e.selectedTowerId = null
    e.selectBuild(null)
    syncHud()
  }, [syncHud])

  const nextWave = useCallback(() => {
    const e = engineRef.current
    if (!e) return
    clearAutoTimer()
    e.startNextWave()
    syncHud()
  }, [syncHud, clearAutoTimer])

  const selectMap = useCallback((id: MapId) => {
    setMapId(id)
    if (typeof window !== 'undefined') window.localStorage.setItem(TD_MAP_KEY, id)
  }, [])

  const toggleAuto = useCallback(() => {
    setAutoStart((a) => {
      const next = !a
      autoStartRef.current = next
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(TD_AUTOSTART_KEY, next ? '1' : '0')
      }
      return next
    })
  }, [])

  // Feature 7: auto-start the next wave after a delay while idle.
  useEffect(() => {
    const canAuto =
      autoStart &&
      hud.status === 'playing' &&
      hud.waveIdle &&
      hud.enemiesLeft === 0 &&
      hud.wave > 0
    if (!canAuto) {
      clearAutoTimer()
      return
    }
    if (autoTimerRef.current != null) return // already counting down
    let remaining = Math.ceil(AUTO_START_DELAY_MS / 1000)
    setAutoCountdown(remaining)
    const tick = window.setInterval(() => {
      remaining -= 1
      setAutoCountdown(remaining > 0 ? remaining : 0)
    }, 1000)
    autoTimerRef.current = window.setTimeout(() => {
      window.clearInterval(tick)
      autoTimerRef.current = null
      setAutoCountdown(null)
      nextWave()
    }, AUTO_START_DELAY_MS)
    return () => {
      window.clearInterval(tick)
    }
  }, [autoStart, hud.status, hud.waveIdle, hud.enemiesLeft, hud.wave, clearAutoTimer, nextWave])

  // Keyboard listeners: pause, build selection (1-4), next wave (space)
  useEffect(() => {
    const onDown = (ev: KeyboardEvent) => {
      const t = ev.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return
      if (ev.code === 'KeyP' || ev.code === 'Escape') {
        togglePause()
        return
      }
      if (ev.code === 'Space') {
        ev.preventDefault()
        nextWave()
        return
      }
      const idx = ['Digit1', 'Digit2', 'Digit3', 'Digit4'].indexOf(ev.code)
      if (idx >= 0) selectBuild(TOWER_ORDER[idx])
    }
    window.addEventListener('keydown', onDown)
    return () => window.removeEventListener('keydown', onDown)
  }, [togglePause, nextWave, selectBuild])

  useEffect(() => () => stopLoop(), [stopLoop])

  return {
    engineRef,
    hud,
    choices,
    speed,
    muted,
    mapId,
    autoStart,
    autoCountdown,
    challengeDay,
    actions: {
      start,
      restart,
      togglePause,
      chooseUpgrade,
      selectBuild,
      tapWorld,
      upgradeTower,
      sellTower,
      evolveTower,
      deselect,
      nextWave,
      toggleSpeed,
      toggleMute,
      selectMap,
      toggleAuto,
    },
  }
}
