'use client'

import Link from 'next/link'
import { FiArrowLeft } from 'react-icons/fi'
import TetrisLeaderboard from '@/components/tetris/TetrisLeaderboard'
import SurviveLeaderboard from '@/components/survive/SurviveLeaderboard'

type GameCardProps = {
  href: string
  title: string
  description: string
  tags: string[]
  color: string
  emoji: string
}

function GameCard({ href, title, description, tags, color, emoji }: GameCardProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 p-6 transition hover:border-slate-500`}
    >
      <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl text-3xl ${color}`}>
        {emoji}
      </div>
      <h2 className="mb-1 text-lg font-bold text-white">{title}</h2>
      <p className="mb-4 text-sm leading-relaxed text-slate-400">{description}</p>
      <div className="mb-5 flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[11px] font-medium text-slate-400"
          >
            {tag}
          </span>
        ))}
      </div>
      <Link
        href={href}
        className="inline-flex items-center gap-2 rounded-lg bg-slate-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-600"
      >
        플레이
      </Link>
    </div>
  )
}

export default function GamesPageClient() {
  return (
    <div className="min-h-screen bg-slate-950 pb-16 text-white">
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
          >
            <FiArrowLeft className="h-4 w-4" aria-hidden />
            홈으로
          </Link>
          <span className="text-sm font-semibold">Games</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pt-10">
        <div className="mb-10">
          <h1 className="mb-2 font-display text-4xl font-bold">게임</h1>
          <p className="text-slate-400">브라우저에서 바로 즐기는 미니 게임들입니다.</p>
        </div>

        {/* Game cards */}
        <div className="mb-14 grid gap-5 sm:grid-cols-2">
          <GameCard
            href="/tetris"
            title="테트리스"
            emoji="🧱"
            color="bg-indigo-900/60"
            description="SRS 회전, 7-bag, 홀드, 고스트 피스. 단계가 올라갈수록 점점 빨라집니다. 키보드 또는 터치로 조작하세요."
            tags={['퍼즐', '키보드', '모바일 지원', '랭킹']}
          />
          <GameCard
            href="/survive"
            title="서바이브"
            emoji="⚔️"
            color="bg-cyan-900/60"
            description="뱀서라이크 스타일 생존 게임. 자동 공격으로 적을 처치하고 레벨업 강화를 선택하며 최대한 오래 버티세요."
            tags={['액션', 'WASD', '모바일 지원', '랭킹']}
          />
        </div>

        {/* Leaderboards */}
        <h2 className="mb-5 text-xl font-bold">글로벌 랭킹</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-300">🧱 테트리스</p>
            <TetrisLeaderboard />
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-300">⚔️ 서바이브</p>
            <SurviveLeaderboard />
          </div>
        </div>
      </main>
    </div>
  )
}
