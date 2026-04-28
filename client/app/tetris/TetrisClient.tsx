'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import TetrisBoard from '@/components/tetris/TetrisBoard'
import TetrisSidePanel from '@/components/tetris/TetrisSidePanel'
import {
  createInitialState,
  gameTick,
  getGhostPiece,
  hardDrop,
  holdSwap,
  moveOnce,
  restartGame,
  rotateCCW,
  rotateCW,
  setPaused,
  type GameSettings,
  type GameState,
} from '@/lib/tetris'
import { BOARD_HEIGHT, BOARD_WIDTH, VISIBLE_TOP_ROW } from '@/lib/tetris/types'
import { analyzeTouchEnd, swipeToGameActions } from '@/lib/tetris/controls'
import { presets, type DifficultyPresetId } from '@/lib/tetris/presets'

const HIGH_SCORE_KEY = 'tetris-portfolio-high-score'

function loadHighScore(): number {
  if (typeof window === 'undefined') return 0
  try {
    const v = localStorage.getItem(HIGH_SCORE_KEY)
    return v ? parseInt(v, 10) || 0 : 0
  } catch {
    return 0
  }
}

function saveHighScore(score: number): void {
  try {
    localStorage.setItem(HIGH_SCORE_KEY, String(score))
  } catch {
    /* ignore */
  }
}

export default function TetrisClient() {
  const [presetId, setPresetId] = useState<DifficultyPresetId>('standard')
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [pendingSettings, setPendingSettings] = useState<GameSettings>(() => ({
    ...presets.standard,
  }))

  const gameRef = useRef<GameState | null>(null)
  if (gameRef.current === null) {
    gameRef.current = createInitialState(presets.standard)
  }
  const [, force] = useState(0)
  const bump = useCallback(() => force((n) => n + 1), [])

  const inputRef = useRef({
    moveLeft: false,
    moveRight: false,
    softDrop: false,
  })

  const [highScore, setHighScore] = useState(0)
  useEffect(() => {
    setHighScore(loadHighScore())
  }, [])

  const [flashRows, setFlashRows] = useState<number[]>([])
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const applyFlash = useCallback((rowYs: number[]) => {
    const vis = rowYs
      .map((y) => y - VISIBLE_TOP_ROW)
      .filter((v) => v >= 0 && v < 20)
    if (vis.length === 0) return
    setFlashRows(vis)
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current)
    flashTimerRef.current = setTimeout(() => setFlashRows([]), 450)
  }, [])

  const syncHighScore = useCallback((score: number) => {
    setHighScore((h) => {
      if (score > h) {
        saveHighScore(score)
        return score
      }
      return h
    })
  }, [])

  const lastFrameTimeRef = useRef<number | null>(null)
  const rafIdRef = useRef(0)

  const isVisualEqual = (a: GameState, b: GameState) => {
    if (a.status !== b.status) return false
    if (a.score !== b.score) return false
    if (a.level !== b.level) return false
    if (a.lines !== b.lines) return false
    if (a.hold !== b.hold) return false
    if (a.canHold !== b.canHold) return false
    if (a.nextQueue.length !== b.nextQueue.length) return false
    for (let i = 0; i < a.nextQueue.length; i++) {
      if (a.nextQueue[i] !== b.nextQueue[i]) return false
    }
    const ap = a.current
    const bp = b.current
    if (ap === null && bp === null) {
      for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
          if (a.board[y][x] !== b.board[y][x]) return false
        }
      }
      return a.comboCount === b.comboCount && a.backToBack === b.backToBack
    }
    if (!ap || !bp) return false
    if (
      ap.x !== bp.x ||
      ap.y !== bp.y ||
      ap.rotation !== bp.rotation ||
      ap.type !== bp.type
    )
      return false
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        if (a.board[y][x] !== b.board[y][x]) return false
      }
    }
    return a.comboCount === b.comboCount && a.backToBack === b.backToBack
  }

  useEffect(() => {
    const loop = (t: number) => {
      const last = lastFrameTimeRef.current
      lastFrameTimeRef.current = t
      const dt = Math.min(50, last === null ? 16 : t - last)

      const inp = inputRef.current
      const prev = gameRef.current
      if (!prev) return
      if (prev.status === 'playing') {
        const next = gameTick(prev, dt, {
          softDrop: inp.softDrop,
          moveLeft: inp.moveLeft,
          moveRight: inp.moveRight,
        })
        if (next !== prev) {
          if (next.lastLinesCleared > 0) {
            applyFlash(next.lastClearedRowYs)
          }
          if (next.score > prev.score) syncHighScore(next.score)
          gameRef.current = next
          if (!isVisualEqual(prev, next)) bump()
        }
      }
      rafIdRef.current = requestAnimationFrame(loop)
    }

    lastFrameTimeRef.current = null
    rafIdRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafIdRef.current)
  }, [applyFlash, bump, syncHighScore])

  // keyboard
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      const g = gameRef.current
      if (!g) return
      const k = e.key.toLowerCase()

      if (k === 'p' || e.key === 'Escape') {
        e.preventDefault()
        gameRef.current = setPaused(g, g.status === 'playing')
        bump()
        return
      }

      if (g.status !== 'playing') return

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          inputRef.current.moveLeft = true
          break
        case 'ArrowRight':
          e.preventDefault()
          inputRef.current.moveRight = true
          break
        case 'ArrowDown':
          e.preventDefault()
          inputRef.current.softDrop = true
          break
        case 'ArrowUp':
          e.preventDefault()
          gameRef.current = rotateCW(g)
          bump()
          break
        case 'z': {
          e.preventDefault()
          gameRef.current = rotateCCW(g)
          bump()
          break
        }
        case 'x':
        case 'X': {
          e.preventDefault()
          gameRef.current = rotateCW(g)
          bump()
          break
        }
        case ' ':
          e.preventDefault()
          gameRef.current = hardDrop(g)
          bump()
          break
        case 'c':
        case 'C': {
          e.preventDefault()
          gameRef.current = holdSwap(g)
          bump()
          break
        }
        case 'Shift': {
          e.preventDefault()
          gameRef.current = holdSwap(g)
          bump()
          break
        }
        default:
          break
      }
    }

    const up = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          inputRef.current.moveLeft = false
          break
        case 'ArrowRight':
          inputRef.current.moveRight = false
          break
        case 'ArrowDown':
          inputRef.current.softDrop = false
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [bump])

  const state = gameRef.current

  const ghost = useMemo(
    () => (state.status === 'playing' ? getGhostPiece(state) : null),
    [state],
  )

  const startGame = useCallback(() => {
    setFlashRows([])
    gameRef.current = restartGame(pendingSettings)
    bump()
  }, [pendingSettings, bump])

  const applyPreset = (id: DifficultyPresetId) => {
    setPresetId(id)
    setPendingSettings({ ...presets[id] })
  }

  const advancedSlider = (
    label: string,
    key: keyof GameSettings,
    min: number,
    max: number,
    step: number,
  ) => (
    <label className="flex flex-col gap-1 text-xs">
      <span className="text-slate-400">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={pendingSettings[key] as number}
        onChange={(e) =>
          setPendingSettings((s) => ({
            ...s,
            [key]: parseFloat(e.target.value),
          }))
        }
        className="w-full accent-purple-500"
      />
      <span className="text-slate-300 tabular-nums">
        {pendingSettings[key] as number}
      </span>
    </label>
  )

  const touchStart = useRef<{ x: number; y: number; t: number } | null>(null)

  const onBoardTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    touchStart.current = { x: t.clientX, y: t.clientY, t: Date.now() }
  }

  const onBoardTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current
    touchStart.current = null
    if (!start || state.status !== 'playing') return
    const t = e.changedTouches[0]
    const dur = Date.now() - start.t
    const outcome = analyzeTouchEnd(start.x, start.y, t.clientX, t.clientY, dur)
    const actions = swipeToGameActions(outcome)
    let g = gameRef.current

    if (actions.hardDrop) {
      g = hardDrop(g)
    } else {
      if (actions.rotateCW) g = rotateCW(g)
      if (actions.moveX) {
        const steps = Math.abs(actions.moveX)
        const dx = actions.moveX > 0 ? 1 : -1
        for (let i = 0; i < steps; i++) g = moveOnce(g, dx, 0)
      }
      if (actions.softSteps) {
        for (let i = 0; i < actions.softSteps; i++) {
          g = moveOnce(g, 0, 1)
        }
      }
    }
    gameRef.current = g
    bump()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <Header />
      <main className="container-custom pt-24 pb-16 px-4">
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-between max-w-6xl mx-auto">
          <div className="flex-1 w-full space-y-4">
            <div className="flex flex-wrap items-center gap-4 justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                  Tetris
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  Swipe on the board: ←→ move, ↓ soft, flick ↓ hard, ↑ or tap
                  rotate. Keys: arrows, Z/X, Space, C.
                </p>
              </div>
              <Link
                href="/"
                className="text-sm text-purple-400 hover:text-purple-300"
              >
                ← Home
              </Link>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4 space-y-4">
              <div className="flex flex-wrap gap-2">
                {(['relaxed', 'standard', 'sprint'] as const).map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => applyPreset(id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${
                      presetId === id
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {id}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setAdvancedOpen(!advancedOpen)}
                className="text-sm text-slate-400 hover:text-white"
              >
                {advancedOpen ? '▼' : '▶'} Advanced settings (apply on New game)
              </button>

              {advancedOpen && (
                <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-slate-700">
                  {advancedSlider('Start level', 'startLevel', 1, 20, 1)}
                  {advancedSlider('Lines per level', 'linesPerLevel', 1, 30, 1)}
                  {advancedSlider(
                    'Base drop (ms)',
                    'baseDropIntervalMs',
                    200,
                    2000,
                    50,
                  )}
                  {advancedSlider(
                    'Level speed factor',
                    'levelSpeedFactor',
                    0.02,
                    0.35,
                    0.01,
                  )}
                  {advancedSlider(
                    'Soft drop factor',
                    'softDropFactor',
                    5,
                    40,
                    1,
                  )}
                  {advancedSlider('Lock delay (ms)', 'lockDelayMs', 200, 1200, 50)}
                  {advancedSlider(
                    'Max lock resets',
                    'maxLockResetCount',
                    5,
                    25,
                    1,
                  )}
                  {advancedSlider('DAS initial (ms)', 'initialDelayMs', 100, 400, 10)}
                  {advancedSlider('DAS repeat (ms)', 'repeatRateMs', 15, 80, 5)}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={startGame}
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 font-medium"
                >
                  New game
                </button>
                <button
                  type="button"
                  onClick={() => {
                    gameRef.current = setPaused(
                      gameRef.current,
                      gameRef.current.status === 'playing',
                    )
                    bump()
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600"
                >
                  {state.status === 'paused' ? 'Resume' : 'Pause'}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div
                className="touch-none"
                onTouchStart={onBoardTouchStart}
                onTouchEnd={onBoardTouchEnd}
              >
                <TetrisBoard
                  board={state.board}
                  current={state.current}
                  ghost={ghost}
                  flashVisibleRows={flashRows}
                />
              </div>

              <div className="flex flex-col gap-3 w-full sm:w-auto">
                <TetrisSidePanel
                  hold={state.hold}
                  canHold={state.canHold}
                  nextQueue={state.nextQueue}
                  score={state.score}
                  level={state.level}
                  lines={state.lines}
                  comboCount={state.comboCount}
                  backToBack={state.backToBack}
                  highScore={highScore}
                />

                <div className="grid grid-cols-3 gap-2 max-w-xs">
                  <button
                    type="button"
                    className="py-3 rounded-lg bg-slate-800 border border-slate-600 text-sm font-semibold min-h-[44px]"
                    onClick={() => {
                      gameRef.current = holdSwap(gameRef.current)
                      bump()
                    }}
                    disabled={state.status !== 'playing'}
                  >
                    Hold
                  </button>
                  <button
                    type="button"
                    className="py-3 rounded-lg bg-slate-800 border border-slate-600 text-sm font-semibold min-h-[44px]"
                    onClick={() => {
                      gameRef.current = hardDrop(gameRef.current)
                      bump()
                    }}
                    disabled={state.status !== 'playing'}
                  >
                    Drop
                  </button>
                  <button
                    type="button"
                    className="py-3 rounded-lg bg-slate-800 border border-slate-600 text-sm font-semibold min-h-[44px]"
                    onClick={() => {
                      gameRef.current = rotateCW(gameRef.current)
                      bump()
                    }}
                    disabled={state.status !== 'playing'}
                  >
                    Rotate
                  </button>
                </div>
              </div>
            </div>

            {(state.status === 'paused' || state.status === 'gameover') && (
              <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="rounded-2xl border border-slate-600 bg-slate-900 p-8 text-center max-w-sm mx-4">
                  {state.status === 'paused' ? (
                    <>
                      <p className="text-xl font-bold mb-4">Paused</p>
                      <button
                        type="button"
                        className="px-6 py-2 rounded-lg bg-purple-600"
                        onClick={() => {
                          gameRef.current = setPaused(gameRef.current, false)
                          bump()
                        }}
                      >
                        Resume
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-xl font-bold mb-2">Game over</p>
                      <p className="text-slate-400 mb-4">
                        Score {state.score.toLocaleString()}
                      </p>
                      <button
                        type="button"
                        className="px-6 py-2 rounded-lg bg-purple-600"
                        onClick={startGame}
                      >
                        Play again
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
