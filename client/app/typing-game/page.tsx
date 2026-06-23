'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { FiArrowLeft } from 'react-icons/fi'
import AchievementToast from '@/components/AchievementToast'
import { checkAchievements, type Achievement } from '@/lib/achievements'

const SNIPPETS = [
  { id: 1, text: `const add = (a, b) => a + b;` },
  { id: 2, text: `function greet(name) {\n  return \`Hello, \${name}!\`;\n}` },
  { id: 3, text: `const arr = [1, 2, 3];\nconst doubled = arr.map(x => x * 2);` },
  { id: 4, text: `async function fetchData(url) {\n  const res = await fetch(url);\n  return res.json();\n}` },
  { id: 5, text: `const obj = { a: 1, b: 2 };\nconst { a, b } = obj;` },
  { id: 6, text: `type Point = { x: number; y: number };` },
  { id: 7, text: `const sum = (arr: number[]) =>\n  arr.reduce((acc, n) => acc + n, 0);` },
  { id: 8, text: `interface User {\n  id: number;\n  name: string;\n}` },
  { id: 9, text: `const clamp = (n: number, min: number, max: number) =>\n  Math.max(min, Math.min(max, n));` },
  { id: 10, text: `const sleep = (ms: number) =>\n  new Promise(resolve => setTimeout(resolve, ms));` },
]

type Phase = 'idle' | 'countdown' | 'playing' | 'result'

type Score = { player_name: string; wpm: number; accuracy: number; created_at: string }

function pickSnippet() {
  return SNIPPETS[Math.floor(Math.random() * SNIPPETS.length)]
}

export default function TypingGamePage() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [countdown, setCountdown] = useState(3)
  const [snippet, setSnippet] = useState(SNIPPETS[0])
  const [typed, setTyped] = useState('')
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([])

  // Leaderboard
  const [scores, setScores] = useState<Score[]>([])
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const target = snippet.text

  function computeStats(typedStr: string, elapsedMs: number) {
    const words = typedStr.trim().split(/\s+/).filter(Boolean).length
    const mins = elapsedMs / 60000
    const w = mins > 0 ? Math.round(words / mins) : 0

    let correct = 0
    for (let i = 0; i < typedStr.length; i++) {
      if (typedStr[i] === target[i]) correct++
    }
    const acc = typedStr.length > 0 ? Math.round((correct / typedStr.length) * 100) : 100
    return { wpm: w, accuracy: acc }
  }

  const startCountdown = useCallback(() => {
    setPhase('countdown')
    setCountdown(3)
    setTyped('')
    setStartTime(null)
    setElapsed(0)
    setWpm(0)
    setAccuracy(100)
    setSubmitted(false)
    setShowLeaderboard(false)
    const s = pickSnippet()
    setSnippet(s)

    let c = 3
    const iv = setInterval(() => {
      c--
      if (c <= 0) {
        clearInterval(iv)
        setPhase('playing')
        setTimeout(() => textareaRef.current?.focus(), 50)
      } else {
        setCountdown(c)
      }
    }, 1000)
  }, [])

  // Timer tick during playing
  useEffect(() => {
    if (phase !== 'playing') {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(() => {
      if (startTime) {
        const e = Date.now() - startTime
        setElapsed(e)
        setWpm(() => {
          const { wpm: w } = computeStats(typed, e)
          return w
        })
      }
    }, 200)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, startTime, typed])

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    if (phase !== 'playing') return
    const val = e.target.value

    // Start timer on first keystroke
    if (!startTime && val.length > 0) {
      setStartTime(Date.now())
    }

    // Clamp to target length
    if (val.length > target.length) return
    setTyped(val)

    const now = startTime ? Date.now() - startTime : 0
    const stats = computeStats(val, now)
    setAccuracy(stats.accuracy)
    setWpm(stats.wpm)

    if (val.length === target.length) {
      // Done
      const finalElapsed = startTime ? Date.now() - startTime : 0
      const finalStats = computeStats(val, finalElapsed)
      setElapsed(finalElapsed)
      setWpm(finalStats.wpm)
      setAccuracy(finalStats.accuracy)
      setPhase('result')

      // Check achievements
      const earned = checkAchievements('typing', { wpm: finalStats.wpm, accuracy: finalStats.accuracy })
      if (earned.length > 0) setNewAchievements(earned)
    }
  }

  async function fetchScores() {
    try {
      const res = await fetch('/api/typing-game/scores')
      const data = await res.json()
      setScores(data)
    } catch {}
  }

  async function submitScore(name: string) {
    try {
      await fetch('/api/typing-game/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_name: name, wpm, accuracy, snippet_id: snippet.id }),
      })
    } catch {}
  }

  function handleNameSubmit(e: React.FormEvent) {
    e.preventDefault()
    const name = nameInput.trim() || 'Anonymous'
    submitScore(name)
    fetchScores()
    setShowLeaderboard(true)
    setSubmitted(true)
  }

  const chars = target.split('')

  return (
    <div className="min-h-screen bg-neutral-950 font-mono text-white">
      <AchievementToast achievements={newAchievements} onDone={() => setNewAchievements([])} />

      <header className="sticky top-0 z-30 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-3">
          <Link
            href="/games"
            className="inline-flex items-center gap-2 text-sm font-medium text-neutral-400 transition hover:text-white"
          >
            <FiArrowLeft className="h-4 w-4" aria-hidden />
            게임으로
          </Link>
          <span className="text-sm font-semibold">타이핑 게임</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pt-14">
        {/* Stats bar */}
        <div className="mb-8 flex gap-8">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{wpm}</p>
            <p className="text-xs text-neutral-500">WPM</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{accuracy}%</p>
            <p className="text-xs text-neutral-500">정확도</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{(elapsed / 1000).toFixed(1)}s</p>
            <p className="text-xs text-neutral-500">시간</p>
          </div>
        </div>

        {/* Idle */}
        {phase === 'idle' && (
          <div className="text-center">
            <p className="mb-8 text-neutral-400">코드를 얼마나 빠르게 타이핑할 수 있나요?</p>
            <button
              onClick={startCountdown}
              className="rounded-lg bg-neutral-800 px-8 py-3 text-sm font-semibold transition hover:bg-neutral-700"
            >
              시작하기
            </button>
          </div>
        )}

        {/* Countdown */}
        {phase === 'countdown' && (
          <div className="text-center">
            <p className="text-8xl font-bold text-amber-400">{countdown}</p>
          </div>
        )}

        {/* Playing */}
        {(phase === 'playing' || phase === 'result') && (
          <div>
            {/* Snippet display */}
            <div className="mb-6 rounded-xl border border-neutral-800 bg-neutral-900 p-6 text-lg leading-relaxed tracking-wide">
              {chars.map((ch, i) => {
                let color = 'text-neutral-600'
                if (i < typed.length) {
                  color = typed[i] === ch ? 'text-white' : 'text-red-400'
                }
                if (ch === '\n') {
                  return (
                    <span key={i}>
                      <span className={color}>↵</span>
                      <br />
                    </span>
                  )
                }
                return (
                  <span key={i} className={color}>
                    {ch}
                  </span>
                )
              })}
            </div>

            {phase === 'playing' && (
              <textarea
                ref={textareaRef}
                value={typed}
                onChange={handleInput}
                rows={4}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-900 p-4 text-sm leading-relaxed text-white outline-none focus:border-neutral-500"
                placeholder="여기에 타이핑하세요..."
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
              />
            )}

            {/* Result card */}
            {phase === 'result' && (
              <div className="rounded-xl border border-neutral-700 bg-neutral-900 p-8 text-center">
                <p className="mb-2 text-lg text-neutral-400">결과</p>
                <p className="mb-1 text-5xl font-bold text-white">{wpm} WPM</p>
                <p className="mb-6 text-2xl text-neutral-400">{accuracy}% 정확도</p>

                {!submitted ? (
                  <form onSubmit={handleNameSubmit} className="mb-6">
                    <p className="mb-3 text-sm text-neutral-400">리더보드에 이름을 등록하세요</p>
                    <div className="flex gap-2 justify-center">
                      <input
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        maxLength={20}
                        placeholder="닉네임"
                        className="rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm text-white outline-none focus:border-neutral-500"
                      />
                      <button
                        type="submit"
                        className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold transition hover:bg-amber-500"
                      >
                        등록
                      </button>
                    </div>
                  </form>
                ) : null}

                {showLeaderboard && (
                  <div className="mb-6 text-left">
                    <p className="mb-3 text-sm font-semibold text-neutral-300">🏆 TOP 10</p>
                    <div className="space-y-1">
                      {scores.map((s, i) => (
                        <div key={i} className="flex items-center gap-3 rounded-lg bg-neutral-800 px-3 py-2 text-sm">
                          <span className="w-5 text-center text-neutral-500">{i + 1}</span>
                          <span className="flex-1 text-white">{s.player_name}</span>
                          <span className="text-amber-400 font-semibold">{s.wpm} WPM</span>
                          <span className="text-neutral-500">{s.accuracy}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={startCountdown}
                  className="rounded-lg bg-neutral-700 px-8 py-3 text-sm font-semibold transition hover:bg-neutral-600"
                >
                  다시하기
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
