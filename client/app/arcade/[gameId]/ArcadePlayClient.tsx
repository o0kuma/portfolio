'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { FiArrowLeft, FiRotateCcw, FiPause, FiPlay } from 'react-icons/fi'
import { AnimatePresence, motion } from 'framer-motion'
import GameCanvas from '@/components/arcade/GameCanvas'
import ArcadeLeaderboard from '@/components/arcade/ArcadeLeaderboard'
import { getArcadeGame } from '@/lib/arcade/registry'
import { defaultToCoins } from '@/lib/arcade/engine'
import { addCoins, setBestScore } from '@/lib/arcade/coins'

function getSessionId(): string {
  const KEY = 'arcade_session_id'
  try {
    let id = localStorage.getItem(KEY)
    if (!id) {
      id = crypto.randomUUID().replace(/-/g, '')
      localStorage.setItem(KEY, id)
    }
    return id
  } catch {
    return Math.random().toString(36).slice(2)
  }
}

export default function ArcadePlayClient({ gameId }: { gameId: string }) {
  const game = useMemo(() => getArcadeGame(gameId), [gameId])
  const [resetKey, setResetKey] = useState(0)
  const [result, setResult] = useState<{ score: number; coins: number; isNew: boolean } | null>(null)
  const [playerName, setPlayerName] = useState('')
  const [leaderboardKey, setLeaderboardKey] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('arcade_player_name')
      if (saved) setPlayerName(saved)
    } catch {}
  }, [])

  if (!game) return null

  const handleGameOver = (score: number) => {
    const coins = (game.toCoins ?? defaultToCoins)(score)
    addCoins(coins)
    const { isNew } = setBestScore(game.id, score)
    setResult({ score, coins, isNew })
    setSubmitted(false)
  }

  const submitScore = async () => {
    if (!result || submitted) return
    setSubmitted(true)
    try {
      const name = playerName.trim()
      if (name) {
        try { localStorage.setItem('arcade_player_name', name) } catch {}
      }
      await fetch('/api/arcade/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: game.id,
          score: result.score,
          playerName: name || undefined,
          sessionId: getSessionId(),
        }),
      })
      setLeaderboardKey((k) => k + 1)
    } catch {
      // 네트워크 오류는 무시 — 로컬 코인/최고기록은 이미 반영됨
    }
  }

  const retry = () => {
    setResult(null)
    setPaused(false)
    setResetKey((k) => k + 1)
  }

  return (
    <div className="flex h-[100dvh] flex-col bg-[#0a0a12] text-white">
      <header className="flex items-center gap-3 border-b border-slate-800 px-4 py-3">
        <Link href="/arcade" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white">
          <FiArrowLeft className="h-4 w-4" /> 목록
        </Link>
        <span className="text-sm font-bold">{game.emoji} {game.title}</span>
        <div className="ml-auto flex items-center gap-3">
          {!result && (
            <button onClick={() => setPaused((p) => !p)} className="text-slate-400 hover:text-white" aria-label="일시정지">
              {paused ? <FiPlay className="h-4 w-4" /> : <FiPause className="h-4 w-4" />}
            </button>
          )}
          <button onClick={retry} className="text-slate-400 hover:text-white" aria-label="재시작">
            <FiRotateCcw className="h-4 w-4" />
          </button>
        </div>
      </header>

      <p className="border-b border-slate-800/60 bg-slate-900/40 px-4 py-2 text-center text-xs text-slate-400">
        {game.instruction}
      </p>

      <div className="relative flex-1">
        <GameCanvas game={game} onGameOver={handleGameOver} resetKey={resetKey} paused={paused} />

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex items-center justify-center overflow-y-auto bg-black/70 p-6"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-xs rounded-2xl border border-slate-700 bg-slate-900 p-6 text-center"
              >
                <p className="mb-1 text-sm text-slate-400">게임 종료</p>
                <p className="mb-3 text-4xl font-black" style={{ color: game.accentColor }}>{result.score}</p>
                {result.isNew && <p className="mb-2 text-xs font-bold text-amber-400">🏆 신기록!</p>}
                <p className="mb-4 text-sm text-slate-300">🪙 +{result.coins} 코인 획득</p>

                {!submitted ? (
                  <div className="mb-4 flex flex-col gap-2">
                    <input
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value.slice(0, 20))}
                      placeholder="닉네임 (랭킹 등록, 선택)"
                      className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none"
                    />
                    <button
                      onClick={submitScore}
                      className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-black hover:bg-amber-400"
                    >
                      🏆 랭킹 등록
                    </button>
                  </div>
                ) : (
                  <div className="mb-4">
                    <ArcadeLeaderboard gameId={game.id} refreshKey={leaderboardKey} />
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={retry}
                    className="flex-1 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-700"
                  >
                    다시하기
                  </button>
                  <Link
                    href="/arcade"
                    className="flex-1 rounded-lg border border-slate-700 px-4 py-2.5 text-center text-sm font-semibold text-slate-300 hover:border-slate-500"
                  >
                    목록으로
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
