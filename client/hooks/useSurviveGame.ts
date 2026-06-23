'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { SurviveEngine } from '@/lib/survive/engine'
import { readBest, maybePersistBest } from '@/lib/survive/storage'
import { submitSurviveScore } from '@/lib/survive/leaderboardClient'
import { rollUpgrades, type Upgrade } from '@/lib/survive/upgrades'
import type { SurviveHudSnapshot, Vec } from '@/lib/survive/types'

const HUD_THROTTLE_MS = 80 // ~12fps HUD updates

function emptyHud(bestTimeSec: number): SurviveHudSnapshot {
  return {
    status: 'ready',
    hp: 100,
    maxHp: 100,
    level: 1,
    xp: 0,
    xpToNext: 9,
    timeSec: 0,
    kills: 0,
    bestTimeSec,
    bossHp: 0,
    bossMaxHp: 0,
    bossAnnounceMs: 0,
  }
}

export function useSurviveGame() {
  const engineRef = useRef<SurviveEngine | null>(null)
  const [hud, setHud] = useState<SurviveHudSnapshot>(() => emptyHud(0))
  const [choices, setChoices] = useState<Upgrade[]>([])
  const [bossChoices, setBossChoices] = useState<Upgrade[]>([])

  const keysRef = useRef<Set<string>>(new Set())
  const joystickRef = useRef<Vec>({ x: 0, y: 0 })
  const rafRef = useRef<number | null>(null)
  const lastTsRef = useRef<number>(0)
  const hudAccRef = useRef<number>(0)
  const persistedRef = useRef(false)
  // Tracks whether we still need to roll upgrade choices for the current level-up.
  const choicesEmptyRef = useRef(true)
  // Tracks whether we still need to roll boss upgrade choices.
  const bossChoicesEmptyRef = useRef(true)

  // Load best score once mounted.
  useEffect(() => {
    const best = readBest()
    setHud(emptyHud(best.timeSec))
  }, [])

  const syncHud = useCallback(() => {
    const e = engineRef.current
    if (e) setHud(e.getHud())
  }, [])

  const keyboardVector = useCallback((): Vec => {
    const k = keysRef.current
    let x = 0
    let y = 0
    if (k.has('ArrowLeft') || k.has('KeyA')) x -= 1
    if (k.has('ArrowRight') || k.has('KeyD')) x += 1
    if (k.has('ArrowUp') || k.has('KeyW')) y -= 1
    if (k.has('ArrowDown') || k.has('KeyS')) y += 1
    return { x, y }
  }, [])

  const loop = useCallback(
    (ts: number) => {
      const e = engineRef.current
      if (!e) return
      const dt = lastTsRef.current ? ts - lastTsRef.current : 16
      lastTsRef.current = ts

      // combine keyboard + joystick input
      const kv = keyboardVector()
      const jv = joystickRef.current
      e.setMoveInput({ x: kv.x + jv.x, y: kv.y + jv.y })

      e.update(dt)

      if (e.status === 'levelup' && choicesEmptyRef.current) {
        const rolled = rollUpgrades(e, e.takenUpgrades, 3)
        choicesEmptyRef.current = false
        setChoices(rolled)
        syncHud()
      }

      if (e.status === 'bossupgrade' && bossChoicesEmptyRef.current) {
        const rolled = rollUpgrades(e, e.takenUpgrades, 3)
        bossChoicesEmptyRef.current = false
        setBossChoices(rolled)
        syncHud()
      }

      if (e.status === 'gameover' && !persistedRef.current) {
        persistedRef.current = true
        maybePersistBest({ timeSec: e.timeSec, level: e.player.level, kills: e.kills })
        submitSurviveScore({ timeSec: e.timeSec, level: e.player.level, kills: e.kills })
        syncHud()
      }

      hudAccRef.current += dt
      if (hudAccRef.current >= HUD_THROTTLE_MS) {
        hudAccRef.current = 0
        syncHud()
      }

      rafRef.current = requestAnimationFrame(loop)
    },
    [keyboardVector, syncHud]
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
    const engine = new SurviveEngine(best.timeSec)
    engine.status = 'playing'
    engineRef.current = engine
    persistedRef.current = false
    choicesEmptyRef.current = true
    bossChoicesEmptyRef.current = true
    setChoices([])
    setBossChoices([])
    joystickRef.current = { x: 0, y: 0 }
    keysRef.current.clear()
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
      if (!e || e.status !== 'levelup') return
      e.applyUpgrade(u)
      choicesEmptyRef.current = true
      setChoices([])
      syncHud()
    },
    [syncHud]
  )

  const chooseBossUpgrade = useCallback(
    (u: Upgrade) => {
      const e = engineRef.current
      if (!e || e.status !== 'bossupgrade') return
      e.applyUpgrade(u)
      bossChoicesEmptyRef.current = true
      setBossChoices([])
      syncHud()
    },
    [syncHud]
  )

  const setJoystick = useCallback((v: Vec) => {
    joystickRef.current = v
  }, [])

  // Keyboard listeners
  useEffect(() => {
    const movementCodes = new Set([
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Space',
    ])
    const onDown = (ev: KeyboardEvent) => {
      const t = ev.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return
      if (movementCodes.has(ev.code)) ev.preventDefault()
      if (ev.code === 'KeyP' || ev.code === 'Escape') {
        togglePause()
        return
      }
      keysRef.current.add(ev.code)
    }
    const onUp = (ev: KeyboardEvent) => {
      keysRef.current.delete(ev.code)
    }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [togglePause])

  useEffect(() => () => stopLoop(), [stopLoop])

  return {
    engineRef,
    hud,
    choices,
    bossChoices,
    actions: { start, restart, togglePause, chooseUpgrade, chooseBossUpgrade, setJoystick },
  }
}
