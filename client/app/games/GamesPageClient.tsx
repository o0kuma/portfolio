'use client'

import Link from 'next/link'
import { FiArrowLeft } from 'react-icons/fi'
import TetrisLeaderboard from '@/components/tetris/TetrisLeaderboard'
import TowerDefenseLeaderboard from '@/components/tower-defense/TowerDefenseLeaderboard'
import { useLanguage } from '@/lib/LanguageContext'

type GameCardProps = {
  href: string
  title: string
  description: string
  tags: readonly string[]
  color: string
  emoji: string
  playLabel: string
}

function GameCard({ href, title, description, tags, color, emoji, playLabel }: GameCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 p-6 transition hover:border-slate-500">
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
        {playLabel}
      </Link>
    </div>
  )
}

export default function GamesPageClient() {
  const { t } = useLanguage()
  const g = t.games
  return (
    <div className="min-h-screen bg-slate-950 pb-16 text-white">
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
          >
            <FiArrowLeft className="h-4 w-4" aria-hidden />
            {g.backHome}
          </Link>
          <span className="text-sm font-semibold">{g.title}</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pt-10">
        <div className="mb-10">
          <h1 className="mb-2 font-display text-4xl font-bold">{g.heading}</h1>
          <p className="text-slate-400">{g.subtitle}</p>
        </div>

        {/* Game cards */}
        <div className="mb-14 grid gap-5 sm:grid-cols-2">
          <GameCard
            href="/tetris"
            title={g.tetrisTitle}
            emoji="🧱"
            color="bg-indigo-900/60"
            description={g.tetrisDesc}
            tags={g.tetrisTags}
            playLabel={g.play}
          />
          <GameCard
            href="/tower-defense"
            title={g.towerDefenseTitle}
            emoji="🏰"
            color="bg-amber-900/60"
            description={g.towerDefenseDesc}
            tags={g.towerDefenseTags}
            playLabel={g.play}
          />
        </div>

        {/* Leaderboards */}
        <h2 className="mb-5 text-xl font-bold">{g.globalRanking}</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-300">{g.tetrisEmoji}</p>
            <TetrisLeaderboard />
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-300">{g.towerDefenseEmoji}</p>
            <TowerDefenseLeaderboard />
          </div>
        </div>
      </main>
    </div>
  )
}
