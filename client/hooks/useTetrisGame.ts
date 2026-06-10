'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ARR, DAS_DELAY, HIGH_SCORE_KEY } from '@/lib/tetris/constants'
import {
  createInitialState,
  gravityStep,
  gravityMsForLevel,
  hardDrop,
  hold,
  moveLeft,
  moveRight,
  restart,
  rotateCCW,
  rotateCW,
  softDropOne,
  togglePause,
  toSnapshot,
  type GameEngineState,
} from '@/lib/tetris/game'
import { submitTetrisScore } from '@/lib/tetris/leaderboardClient'
import type { GameSnapshot } from '@/lib/tetris/types'

function readHighScore(): number {
  if (typeof window === 'undefined') return 0
  const raw = window.localStorage.getItem(HIGH_SCORE_KEY)
  const n = raw ? parseInt(raw, 10) : 0
  return Number.isFinite(n) ? n : 0
}

function maybePersistHighScore(score: number): number {
  if (typeof window === 'undefined') return readHighScore()
  const prev = readHighScore()
  if (score > prev) {
    window.localStorage.setItem(HIGH_SCORE_KEY, String(score))
    return score
  }
  return prev
}

export function useTetrisGame() {
  const stateRef = useRef<GameEngineState>(createInitialState())
  const [snapshot, setSnapshot] = useState<GameSnapshot>(() =>
    toSnapshot(stateRef.current)
  )
  const [highScore, setHighScore] = useState(0)
  const [leaderboardRefreshKey, setLeaderboardRefreshKey] = useState(0)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [leftHeld, setLeftHeld] = useState(false)
  const [rightHeld, setRightHeld] = useState(false)
  const [softDropHeld, setSoftDropHeld] = useState(false)

  useEffect(() => {
    setHighScore(readHighScore())
  }, [])

  const setState = useCallback((next: GameEngineState) => {
    if (next.gameOver && !stateRef.current.gameOver) {
      const hs = maybePersistHighScore(next.score)
      setHighScore(hs)
      if (next.score > 0) {
        setSubmitError(null)
        void submitTetrisScore({
          score: next.score,
          lines: next.lines,
          level: next.level,
        }).then((result) => {
          if (result.ok) {
            setLeaderboardRefreshKey((k) => k + 1)
          } else if (result.error) {
            setSubmitError(result.error)
          }
        })
      }
    }
    stateRef.current = next
    setSnapshot(toSnapshot(next))
  }, [])

  const apply = useCallback(
    (fn: (s: GameEngineState) => GameEngineState) => {
      setState(fn(stateRef.current))
    },
    [setState]
  )

  /** Gravity tick */
  useEffect(() => {
    if (snapshot.paused || snapshot.gameOver) return
    const ms = gravityMsForLevel(snapshot.level)
    const id = window.setInterval(() => {
      if (softDropHeld) return
      apply(gravityStep)
    }, ms)
    return () => window.clearInterval(id)
  }, [snapshot.level, snapshot.paused, snapshot.gameOver, apply, softDropHeld])

  /** Soft drop while Down held */
  useEffect(() => {
    if (!softDropHeld || snapshot.paused || snapshot.gameOver) return
    const id = window.setInterval(() => {
      apply(softDropOne)
    }, 50)
    return () => window.clearInterval(id)
  }, [softDropHeld, snapshot.paused, snapshot.gameOver, apply])

  /** DAS / ARR — left */
  useEffect(() => {
    if (!leftHeld || snapshot.paused || snapshot.gameOver) return
    let arrId: number | undefined
    const dasId = window.setTimeout(() => {
      arrId = window.setInterval(() => apply(moveLeft), ARR) as unknown as number
    }, DAS_DELAY)
    return () => {
      window.clearTimeout(dasId)
      if (arrId !== undefined) window.clearInterval(arrId)
    }
  }, [leftHeld, snapshot.paused, snapshot.gameOver, apply])

  /** DAS / ARR — right */
  useEffect(() => {
    if (!rightHeld || snapshot.paused || snapshot.gameOver) return
    let arrId: number | undefined
    const dasId = window.setTimeout(() => {
      arrId = window.setInterval(() => apply(moveRight), ARR) as unknown as number
    }, DAS_DELAY)
    return () => {
      window.clearTimeout(dasId)
      if (arrId !== undefined) window.clearInterval(arrId)
    }
  }, [rightHeld, snapshot.paused, snapshot.gameOver, apply])

  const clearMovementKeys = useCallback(() => {
    setLeftHeld(false)
    setRightHeld(false)
    setSoftDropHeld(false)
  }, [])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (snapshot.gameOver && e.code !== 'Enter' && e.code !== 'KeyR') return
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return

      if (
        e.repeat &&
        (e.code === 'ArrowLeft' ||
          e.code === 'ArrowRight' ||
          e.code === 'ArrowDown')
      ) {
        e.preventDefault()
        return
      }

      switch (e.code) {
        case 'ArrowLeft':
          e.preventDefault()
          apply(moveLeft)
          setLeftHeld(true)
          break
        case 'ArrowRight':
          e.preventDefault()
          apply(moveRight)
          setRightHeld(true)
          break
        case 'ArrowDown':
          e.preventDefault()
          apply(softDropOne)
          setSoftDropHeld(true)
          break
        case 'ArrowUp':
        case 'KeyX':
          e.preventDefault()
          apply(rotateCW)
          break
        case 'KeyZ':
        case 'ControlLeft':
        case 'ControlRight':
          e.preventDefault()
          apply(rotateCCW)
          break
        case 'Space':
          e.preventDefault()
          apply(hardDrop)
          break
        case 'ShiftLeft':
        case 'ShiftRight':
        case 'KeyC':
          e.preventDefault()
          apply(hold)
          break
        case 'KeyP':
        case 'Escape':
          e.preventDefault()
          if (!snapshot.gameOver) {
            clearMovementKeys()
            apply(togglePause)
          }
          break
        case 'Enter':
        case 'KeyR':
          if (snapshot.gameOver) {
            e.preventDefault()
            const next = restart()
            stateRef.current = next
            setSnapshot(toSnapshot(next))
            clearMovementKeys()
          }
          break
        default:
          break
      }
    },
    [apply, snapshot.gameOver, clearMovementKeys]
  )

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    switch (e.code) {
      case 'ArrowLeft':
        setLeftHeld(false)
        break
      case 'ArrowRight':
        setRightHeld(false)
        break
      case 'ArrowDown':
        setSoftDropHeld(false)
        break
      default:
        break
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleKeyDown, handleKeyUp])

  const resetGame = useCallback(() => {
    const next = restart()
    stateRef.current = next
    setSnapshot(toSnapshot(next))
    clearMovementKeys()
  }, [clearMovementKeys])

  const pauseToggle = useCallback(() => {
    clearMovementKeys()
    apply(togglePause)
  }, [apply, clearMovementKeys])

  const actions = {
    moveLeft: () => apply(moveLeft),
    moveRight: () => apply(moveRight),
    softDrop: () => apply(softDropOne),
    hardDrop: () => apply(hardDrop),
    rotateCW: () => apply(rotateCW),
    rotateCCW: () => apply(rotateCCW),
    hold: () => apply(hold),
    pauseToggle,
    resetGame,
  }

  return {
    snapshot,
    highScore,
    actions,
    leaderboardRefreshKey,
    submitError,
    clearSubmitError: () => setSubmitError(null),
  }
}
