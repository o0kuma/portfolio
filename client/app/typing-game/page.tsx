'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { FiArrowLeft } from 'react-icons/fi'
import { checkAchievements } from '@/lib/achievements'
import AchievementToast from '@/components/AchievementToast'
import type { Achievement } from '@/lib/achievements'
import { useLanguage } from '@/lib/LanguageContext'
import SpaceAtmosphere from '@/components/SpaceAtmosphere'

const snippets = [
  { id: 1, code: `const greet = (name: string) => \`Hello, \${name}!\`` },
  { id: 2, code: `const sum = (a: number, b: number): number => a + b` },
  { id: 3, code: `const arr = [1,2,3].map(x => x * 2)` },
  { id: 4, code: `async function fetchData(url: string) {\n  const res = await fetch(url)\n  return res.json()\n}` },
  { id: 5, code: `const [count, setCount] = useState(0)` },
  { id: 6, code: `type User = { id: number; name: string; email: string }` },
  { id: 7, code: `const filtered = items.filter(item => item.active)` },
  { id: 8, code: `export default function App() {\n  return <div>Hello World</div>\n}` },
]

type GameState = 'idle' | 'countdown' | 'playing' | 'result'

type Score = {
  player_name: string
  wpm: number
  accuracy: number
  created_at: string
}

function pickRandom() {
  return snippets[Math.floor(Math.random() * snippets.length)]
}

export default function TypingGamePage() {
  const { locale } = useLanguage()
  const en = locale === 'en'
  const [gameState, setGameState] = useState<GameState>('idle')
  const [snippet, setSnippet] = useState(snippets[0])
  const [typed, setTyped] = useState('')
  const [countdown, setCountdown] = useState(3)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([])
  const [playerName, setPlayerName] = useState('')
  const [scores, setScores] = useState<Score[]>([])
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Computed stats
  const correctChars = typed.split('').filter((c, i) => c === snippet.code[i]).length
  const totalTyped = typed.length
  const wpm = startTime && elapsed > 0 ? Math.round((totalTyped / 5) / (elapsed / 60)) : 0
  const accuracy = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 100

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startTimer = useCallback((start: number) => {
    stopTimer()
    timerRef.current = setInterval(() => {
      setElapsed((Date.now() - start) / 1000)
    }, 100)
  }, [stopTimer])

  // Fetch leaderboard
  const fetchScores = useCallback(async () => {
    try {
      const res = await fetch('/api/typing-game/scores')
      const data = await res.json()
      setScores(Array.isArray(data) ? data : (data.scores ?? []))
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    fetchScores()
  }, [fetchScores])

  // Countdown logic
  useEffect(() => {
    if (gameState !== 'countdown') return
    setCountdown(3)
    const interval = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(interval)
          setGameState('playing')
          setTimeout(() => inputRef.current?.focus(), 50)
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [gameState])

  // Detect completion
  useEffect(() => {
    if (gameState !== 'playing') return
    if (typed.length >= snippet.code.length && typed === snippet.code) {
      stopTimer()
      const finalWpm = startTime ? Math.round((typed.length / 5) / ((Date.now() - startTime) / 1000 / 60)) : 0
      const finalAcc = typed.length > 0 ? Math.round(correctChars / typed.length * 100) : 100
      const earned = checkAchievements('typing', { wpm: finalWpm, accuracy: finalAcc })
      setNewAchievements(earned)
      setGameState('result')
    }
  }, [typed, snippet, gameState, stopTimer, startTime, correctChars])

  useEffect(() => {
    return () => stopTimer()
  }, [stopTimer])

  function handleStart() {
    setSnippet(pickRandom())
    setTyped('')
    setElapsed(0)
    setStartTime(null)
    setSaveStatus('idle')
    setNewAchievements([])
    setGameState('countdown')
    stopTimer()
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    if (gameState !== 'playing') return
    const val = e.target.value
    if (!startTime && val.length > 0) {
      const now = Date.now()
      setStartTime(now)
      startTimer(now)
    }
    // Prevent typing beyond snippet length
    if (val.length <= snippet.code.length) {
      setTyped(val)
    }
  }

  async function handleSave() {
    if (!playerName.trim() || saveStatus !== 'idle') return
    setSaveStatus('saving')
    const finalWpm = startTime && elapsed > 0 ? Math.round((typed.length / 5) / (elapsed / 60)) : wpm
    try {
      await fetch('/api/typing-game/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_name: playerName.trim(), wpm: finalWpm, accuracy }),
      })
      setSaveStatus('saved')
      fetchScores()
    } catch {
      setSaveStatus('idle')
    }
  }

  const finalWpm = startTime && elapsed > 0 ? Math.round((typed.length / 5) / (elapsed / 60)) : wpm
  const finalAcc = totalTyped > 0 ? Math.round(correctChars / totalTyped * 100) : 100

  return (
    <SpaceAtmosphere className="theme-locked-dark min-h-screen text-white">
      <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#030014]/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-3">
          <Link
            href="/games"
            className="inline-flex items-center gap-2 text-sm font-medium text-neutral-400 transition hover:text-white"
          >
            <FiArrowLeft className="h-4 w-4" aria-hidden />
            {en ? 'Game List' : '게임 목록'}
          </Link>
          <span className="text-sm font-semibold">{en ? 'Typing Game' : '타이핑 게임'}</span>
        </div>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col items-center px-4 pt-16">
        {/* IDLE */}
        {gameState === 'idle' && (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="text-6xl">⌨️</div>
            <h1 className="text-3xl font-bold">{en ? 'Typing Game' : '타이핑 게임'}</h1>
            <p className="text-neutral-400">
              {en ? 'How fast and accurately can you type code snippets?' : '코드 스니펫을 얼마나 빠르고 정확하게 타이핑할 수 있을까요?'}
            </p>
            <button
              onClick={handleStart}
              className="rounded-xl bg-neutral-100 px-8 py-3 text-sm font-bold text-neutral-950 transition hover:bg-white"
            >
              {en ? 'Start' : '시작하기'}
            </button>
          </div>
        )}

        {/* COUNTDOWN */}
        {gameState === 'countdown' && (
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-neutral-400 text-sm">{en ? 'Get ready...' : '준비하세요...'}</p>
            <div className="text-8xl font-bold text-white tabular-nums">{countdown}</div>
          </div>
        )}

        {/* PLAYING */}
        {gameState === 'playing' && (
          <div className="w-full">
            {/* Code display */}
            <div className="mb-6 rounded-xl border border-neutral-800 bg-neutral-900 p-5">
              <pre className="whitespace-pre-wrap break-all font-mono text-sm leading-relaxed">
                {snippet.code.split('').map((char, i) => {
                  let cls = 'text-neutral-600'
                  if (i < typed.length) {
                    cls = typed[i] === char ? 'text-white' : 'bg-red-600/70 text-white'
                  }
                  return (
                    <span key={i} className={cls}>
                      {char === '\n' ? (
                        <>
                          {typed[i] !== undefined && typed[i] !== '\n' ? '↵' : '↵'}
                          {'\n'}
                        </>
                      ) : char}
                    </span>
                  )
                })}
              </pre>
            </div>

            {/* Hidden textarea for input */}
            <textarea
              ref={inputRef}
              value={typed}
              onChange={handleInput}
              className="h-0 w-0 opacity-0 absolute"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />

            {/* Click to focus hint */}
            <button
              onClick={() => inputRef.current?.focus()}
              className="mb-6 w-full rounded-lg border border-dashed border-neutral-700 py-2 text-center text-xs text-neutral-500 hover:border-neutral-500"
            >
              {en ? 'Click to start typing' : '클릭하여 타이핑 시작'}
            </button>

            {/* Stats bar */}
            <div className="flex gap-3">
              <div className="flex-1 rounded-lg bg-neutral-800 p-3 text-center">
                <p className="text-xs text-neutral-400">WPM</p>
                <p className="text-xl font-bold tabular-nums">{wpm}</p>
              </div>
              <div className="flex-1 rounded-lg bg-neutral-800 p-3 text-center">
                <p className="text-xs text-neutral-400">{en ? 'Accuracy' : '정확도'}</p>
                <p className="text-xl font-bold tabular-nums">{accuracy}%</p>
              </div>
              <div className="flex-1 rounded-lg bg-neutral-800 p-3 text-center">
                <p className="text-xs text-neutral-400">{en ? 'Time' : '시간'}</p>
                <p className="text-xl font-bold tabular-nums">{elapsed.toFixed(1)}s</p>
              </div>
            </div>
          </div>
        )}

        {/* RESULT */}
        {gameState === 'result' && (
          <div className="w-full">
            <div className="mb-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-8 text-center">
              <div className="mb-4 text-5xl">🎉</div>
              <h2 className="mb-6 text-2xl font-bold">{en ? 'Done!' : '완료!'}</h2>
              <div className="mb-6 flex justify-center gap-4">
                <div className="rounded-lg bg-neutral-800 px-6 py-3">
                  <p className="text-xs text-neutral-400">WPM</p>
                  <p className="text-3xl font-bold tabular-nums">{finalWpm}</p>
                </div>
                <div className="rounded-lg bg-neutral-800 px-6 py-3">
                  <p className="text-xs text-neutral-400">{en ? 'Accuracy' : '정확도'}</p>
                  <p className="text-3xl font-bold tabular-nums">{finalAcc}%</p>
                </div>
                <div className="rounded-lg bg-neutral-800 px-6 py-3">
                  <p className="text-xs text-neutral-400">{en ? 'Time' : '시간'}</p>
                  <p className="text-3xl font-bold tabular-nums">{elapsed.toFixed(1)}s</p>
                </div>
              </div>

              {/* Save score */}
              <div className="mb-4 flex gap-2">
                <input
                  type="text"
                  value={playerName}
                  onChange={e => setPlayerName(e.target.value)}
                  placeholder={en ? 'Enter your name' : '이름 입력'}
                  maxLength={50}
                  className="flex-1 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                />
                <button
                  onClick={handleSave}
                  disabled={saveStatus !== 'idle' || !playerName.trim()}
                  className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-400 disabled:opacity-50"
                >
                  {saveStatus === 'saved'
                    ? (en ? 'Saved' : '저장됨')
                    : saveStatus === 'saving'
                      ? (en ? 'Saving...' : '저장 중...')
                      : (en ? 'Save' : '저장')}
                </button>
              </div>

              <button
                onClick={handleStart}
                className="rounded-xl bg-neutral-100 px-8 py-3 text-sm font-bold text-neutral-950 transition hover:bg-white"
              >
                {en ? 'Play Again' : '다시하기'}
              </button>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="mt-14 w-full">
          <h2 className="mb-4 text-lg font-bold">{en ? 'Leaderboard Top 10' : '리더보드 Top 10'}</h2>
          {scores.length === 0 ? (
            <p className="text-sm text-neutral-500">{en ? 'No records yet.' : '아직 기록이 없습니다.'}</p>
          ) : (
            <div className="rounded-xl border border-neutral-800 bg-neutral-900 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400 text-xs">
                    <th className="px-4 py-2 text-left">#</th>
                    <th className="px-4 py-2 text-left">{en ? 'Name' : '이름'}</th>
                    <th className="px-4 py-2 text-right">WPM</th>
                    <th className="px-4 py-2 text-right">{en ? 'Accuracy' : '정확도'}</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((s, i) => (
                    <tr key={i} className="border-b border-neutral-800/50 last:border-0">
                      <td className="px-4 py-2 text-neutral-500">{i + 1}</td>
                      <td className="px-4 py-2 font-medium">{s.player_name}</td>
                      <td className="px-4 py-2 text-right font-bold tabular-nums">{s.wpm}</td>
                      <td className="px-4 py-2 text-right text-neutral-400 tabular-nums">{s.accuracy}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Achievement toast */}
      {newAchievements.length > 0 && (
        <AchievementToast
          achievements={newAchievements}
          onDone={() => setNewAchievements([])}
        />
      )}
    </SpaceAtmosphere>
  )
}
