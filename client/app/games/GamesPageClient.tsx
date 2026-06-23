'use client'

import Link from 'next/link'
import { FiArrowLeft } from 'react-icons/fi'
import TetrisLeaderboard from '@/components/tetris/TetrisLeaderboard'
import SurviveLeaderboard from '@/components/survive/SurviveLeaderboard'
import TowerDefenseLeaderboard from '@/components/tower-defense/TowerDefenseLeaderboard'
import TypingLeaderboard from '@/components/typing/TypingLeaderboard'
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
        {playLabel}
      </Link>
    </div>
  )
}

export default function GamesPageClient() {
  const { t } = useLanguage()
  return (
    <div className="min-h-screen bg-slate-950 pb-16 text-white">
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
          >
            <FiArrowLeft className="h-4 w-4" aria-hidden />
            {t.common.backHome}
          </Link>
          <span className="text-sm font-semibold">{t.games.title}</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pt-10">
        <div className="mb-10">
          <div className="mb-2 flex items-center justify-between gap-4">
            <h1 className="font-display text-4xl font-bold">{t.games.heading}</h1>
            <Link
              href="/games/stats"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white"
            >
              전적 보기
            </Link>
            <Link
              href="/achievements"
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-700/50 bg-amber-950/30 px-3 py-1.5 text-xs font-semibold text-amber-400 transition hover:border-amber-600 hover:text-amber-300"
            >
              🏆 업적
            </Link>
          </div>
          <p className="text-slate-400">{t.games.subtitle}</p>
        </div>

        {/* Game cards */}
        <div className="mb-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <GameCard
            href="/tetris"
            title={t.games.tetrisTitle}
            emoji="🧱"
            color="bg-indigo-900/60"
            description={t.games.tetrisDesc}
            tags={t.games.tetrisTags}
            playLabel={t.games.play}
          />
          <GameCard
            href="/survive"
            title={t.games.surviveTitle}
            emoji="⚔️"
            color="bg-cyan-900/60"
            description={t.games.surviveDesc}
            tags={t.games.surviveTags}
            playLabel={t.games.play}
          />
          <GameCard
            href="/tower-defense"
            title={t.games.towerDefenseTitle}
            emoji="🏰"
            color="bg-amber-900/60"
            description={t.games.towerDefenseDesc}
            tags={t.games.towerDefenseTags}
            playLabel={t.games.play}
          />
          <GameCard
            href="/typing-game"
            title="타이핑 게임"
            emoji="⌨️"
            color="bg-green-900/60"
            description="코드 스니펫을 타이핑하여 WPM과 정확도를 측정하세요"
            tags={['타이핑', 'WPM', '코드']}
            playLabel={t.games.play}
          />
        </div>

        {/* Leaderboards */}
        <h2 className="mb-5 text-xl font-bold">{t.games.globalRanking}</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-300">{t.games.tetrisEmoji}</p>
            <TetrisLeaderboard />
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-300">{t.games.surviveEmoji}</p>
            <SurviveLeaderboard />
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-300">{t.games.towerDefenseEmoji}</p>
            <TowerDefenseLeaderboard />
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-300">⌨️ 타이핑 게임</p>
            <TypingLeaderboard />
          </div>
        </div>
      </main>
    </div>
  )
}
