'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { TowerDefenseEngine } from '@/lib/tower-defense/engine'
import { readBest, maybePersistBest } from '@/lib/tower-defense/storage'
import { submitTowerDefenseScore } from '@/lib/tower-defense/leaderboardClient'
import { rollUpgrades, type Upgrade } from '@/lib/tower-defense/upgrades'
import { START_GOLD, START_LIVES } from '@/lib/tower-defense/constants'
import { TOWER_ORDER } from '@/lib/tower-defense/towers'
import type { TowerDefenseHudSnapshot, TowerKind } from '@/lib/tower-defense/types'

const HUD_THROTTLE_MS = 80 // ~12fps HUD updates

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
  }
}

export function useTowerDefenseGame() {
  const engineRef = useRef<TowerDefenseEngine | null>(null)
  const [hud, setHud] = useState<TowerDefenseHudSnapshot>(() => emptyHud(0))
  const [choices, setChoices] = useState<Upgrade[]>([])

  const rafRef = useRef<number | null>(null)
  const lastTsRef = useRef<number>(0)
  const hudAccRef = useRef<number>(0)
  const persistedRef = useRef(false)
  const choicesEmptyRef = useRef(true)

  // Load best score once mounted.
  useEffect(() => {
    const best = readBest()
    setHud(emptyHud(best.wave))
  }, [])

  const syncHud = useCallback(() => {
    const e = engineRef.current
    if (e) setHud(e.getHud())
  }, [])

  const loop = useCallback(
    (ts: number) => {
      const e = engineRef.current
      if (!e) return
      const dt = lastTsRef.current ? ts - lastTsRef.current : 16
      lastTsRef.current = ts

      e.update(dt)

      if (e.status === 'upgrade' && choicesEmptyRef.current) {
        const rolled = rollUpgrades(e, e.takenUpgrades, 3)
        choicesEmptyRef.current = false
        setChoices(rolled)
        syncHud()
      }

      if (e.status === 'gameover' && !persistedRef.current) {
        persistedRef.current = true
        maybePersistBest({ wave: e.bestWave, kills: e.kills })
        submitTowerDefenseScore({ wave: e.wave, kills: e.kills })
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

  const start = useCallback(() => {
    const best = readBest()
    const engine = new TowerDefenseEngine(best.wave)
    engine.status = 'playing'
    engineRef.current = engine
    persistedRef.current = false
    choicesEmptyRef.current = true
    setChoices([])
    syncHud()
    startLoop()
  }, [startLoop, syncHud])

  const restart = useCallback(() => {
    stopLoop()
    start()
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
    e.startNextWave()
    syncHud()
  }, [syncHud])

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
    actions: {
      start,
      restart,
      togglePause,
      chooseUpgrade,
      selectBuild,
      tapWorld,
      upgradeTower,
      sellTower,
      deselect,
      nextWave,
    },
  }
}
