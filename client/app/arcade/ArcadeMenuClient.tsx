'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FiArrowLeft } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { ARCADE_GAMES } from '@/lib/arcade/registry'
import { getCoins, getBestScore } from '@/lib/arcade/coins'
import { useIsStandalone } from '@/lib/arcade/useStandalone'

export default function ArcadeMenuClient() {
  const [coins, setCoins] = useState(0)
  const [bests, setBests] = useState<Record<string, number>>({})
  const standalone = useIsStandalone()

  useEffect(() => {
    setCoins(getCoins())
    const b: Record<string, number> = {}
    ARCADE_GAMES.forEach((g) => { b[g.id] = getBestScore(g.id) })
    setBests(b)
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a12] pb-20 text-white">
      <header className="sticky top-0 z-30 border-b border-purple-900/40 bg-[#0a0a12]/90 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-3">
          {!standalone && (
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white">
              <FiArrowLeft className="h-4 w-4" /> 메인
            </Link>
          )}
          <span className={`text-sm font-bold text-white ${standalone ? '' : 'ml-1'}`}>🕹️ 포켓 아케이드</span>
          <div className="ml-auto flex items-center gap-1.5 rounded-full border border-amber-600/40 bg-amber-950/30 px-3 py-1 text-xs font-bold text-amber-300">
            🪙 {coins.toLocaleString()}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 pt-8">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-black">🕹️ 포켓 아케이드</h1>
          <p className="text-sm text-slate-400">한 손으로 즐기는 초단타 미니게임</p>
        </motion.div>

        <div className="flex flex-col gap-3">
          {ARCADE_GAMES.map((g, i) => (
            <motion.div key={g.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Link
                href={`/arcade/${g.id}`}
                className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 transition hover:border-slate-600 active:scale-[0.98]"
                style={{ boxShadow: `0 0 0 1px transparent, 0 8px 24px -8px ${g.accentColor}33` }}
              >
                <div
                  className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl text-3xl"
                  style={{ backgroundColor: `${g.accentColor}22` }}
                >
                  {g.emoji}
                </div>
                <div className="flex-1">
                  <h2 className="text-base font-bold text-white">{g.title}</h2>
                  <p className="text-xs text-slate-500">{g.instruction}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500">최고기록</p>
                  <p className="text-sm font-bold" style={{ color: g.accentColor }}>{bests[g.id] ?? 0}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <p className="mt-8 text-center text-[11px] text-slate-600">
          게임 점수는 코인으로 환산되어 누적됩니다 · 더 많은 게임이 추가될 예정
        </p>
      </main>
    </div>
  )
}
