'use client'

import Link from 'next/link'
import { FiArrowLeft, FiPlay } from 'react-icons/fi'
import { motion } from 'framer-motion'
import TetrisLeaderboard from '@/components/tetris/TetrisLeaderboard'
import SurviveLeaderboard from '@/components/survive/SurviveLeaderboard'
import TowerDefenseLeaderboard from '@/components/tower-defense/TowerDefenseLeaderboard'
import TypingLeaderboard from '@/components/typing/TypingLeaderboard'
import LottoLeaderboard from '@/components/lotto/LottoLeaderboard'
import { useLanguage } from '@/lib/LanguageContext'

type GameInfo = {
  href: string
  title: string
  description: string
  genre: string
  difficulty: number
  techStack: string[]
  emoji: string
  gradient: string
  glowColor: string
  accentColor: string
}

const GAMES: GameInfo[] = [
  {
    href: '/tower-defense',
    title: 'Tower Defense',
    description: '전략적으로 타워를 배치해 몰려오는 적을 막아라. 자원 관리와 업그레이드가 핵심!',
    genre: '전략',
    difficulty: 3,
    techStack: ['React', 'Canvas'],
    emoji: '🏰',
    gradient: 'from-teal-600/30 via-cyan-700/20 to-slate-900',
    glowColor: 'group-hover:shadow-teal-500/20',
    accentColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  },
  {
    href: '/survive',
    title: 'Survive',
    description: '탑다운 슈터로 밀려오는 적들을 피하며 최대한 오래 생존하라. 온라인 대전 지원!',
    genre: '액션',
    difficulty: 4,
    techStack: ['React', 'Canvas', 'WebSocket'],
    emoji: '⚔️',
    gradient: 'from-red-600/30 via-rose-700/20 to-slate-900',
    glowColor: 'group-hover:shadow-red-500/20',
    accentColor: 'bg-red-500/20 text-red-300 border-red-500/30',
  },
  {
    href: '/typing-game',
    title: 'Typing Game',
    description: '코드 스니펫을 타이핑해 WPM과 정확도를 측정하세요. 개발자를 위한 타이핑 훈련!',
    genre: '퍼즐',
    difficulty: 2,
    techStack: ['React', 'TypeScript'],
    emoji: '⌨️',
    gradient: 'from-purple-600/30 via-violet-700/20 to-slate-900',
    glowColor: 'group-hover:shadow-purple-500/20',
    accentColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  },
  {
    href: '/tetris',
    title: 'Tetris',
    description: '클래식 테트리스! 블록을 쌓고 라인을 지워 최고 점수에 도전하세요.',
    genre: '퍼즐',
    difficulty: 2,
    techStack: ['React', 'Canvas'],
    emoji: '🧱',
    gradient: 'from-blue-600/30 via-indigo-700/20 to-slate-900',
    glowColor: 'group-hover:shadow-blue-500/20',
    accentColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  },
  {
    href: '/lotto',
    title: '로또 6/45',
    description: '번호를 고르고 추첨에 도전! 역대 실제 회차와 비교하거나 1등 나올 때까지 무한 자동 구매.',
    genre: '운/시뮬',
    difficulty: 1,
    techStack: ['Next.js', 'API'],
    emoji: '🎰',
    gradient: 'from-amber-600/30 via-yellow-700/20 to-slate-900',
    glowColor: 'group-hover:shadow-amber-500/20',
    accentColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
  {
    href: '/arcade',
    title: '포켓 아케이드',
    description: '한 손으로 즐기는 초단타 미니게임 모음. 코인을 모으고 최고 기록에 도전하세요.',
    genre: '아케이드',
    difficulty: 2,
    techStack: ['Canvas', 'PWA'],
    emoji: '🕹️',
    gradient: 'from-fuchsia-600/30 via-purple-700/20 to-slate-900',
    glowColor: 'group-hover:shadow-fuchsia-500/20',
    accentColor: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30',
  },
]

const STATS = [
  { label: '9개 게임', icon: '🎮' },
  { label: '브라우저 기반', icon: '🌐' },
  { label: '무료 플레이', icon: '🆓' },
]

function DifficultyStars({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`난이도 ${count}점`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < count ? 'text-amber-400' : 'text-slate-700'} aria-hidden>
          ★
        </span>
      ))}
    </div>
  )
}

function GameCard({ game, index }: { game: GameInfo; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.1, ease: 'easeOut' as const }}
    >
      <div
        className={`group relative overflow-hidden rounded-2xl border border-slate-700/60 bg-gradient-to-br ${game.gradient} p-6 transition-all duration-300 hover:scale-[1.025] hover:border-slate-500 hover:shadow-2xl ${game.glowColor}`}
      >
        {/* top row */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-800/70 text-3xl shadow-inner">
            {game.emoji}
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${game.accentColor}`}
            >
              {game.genre}
            </span>
            <DifficultyStars count={game.difficulty} />
          </div>
        </div>

        {/* info */}
        <h2 className="mb-1.5 text-lg font-bold text-white">{game.title}</h2>
        <p className="mb-4 text-sm leading-relaxed text-slate-400">{game.description}</p>

        {/* tech badges */}
        <div className="mb-5 flex flex-wrap gap-1.5">
          {game.techStack.map((tech) => (
            <span
              key={tech}
              className="rounded-full bg-slate-800/80 px-2.5 py-0.5 text-[11px] font-medium text-slate-400"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* play button */}
        <Link
          href={game.href}
          className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-5 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 active:scale-95"
        >
          <FiPlay className="h-3.5 w-3.5" aria-hidden />
          플레이하기
        </Link>
      </div>
    </motion.div>
  )
}

export default function GamesPageClient() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-slate-950 pb-16 text-white">
      {/* sticky nav */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
          >
            <FiArrowLeft className="h-4 w-4" aria-hidden />
            {t.common.backHome}
          </Link>
          <span className="text-sm font-semibold text-slate-200">{t.games.title}</span>
          <div className="ml-auto flex gap-2">
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
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pt-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="font-display mb-3 text-5xl font-bold tracking-tight">
            🎮 Game Hub
          </h1>
          <p className="text-lg text-slate-400">브라우저에서 바로 즐기는 미니 게임</p>
        </motion.div>

        {/* Stat chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-10 flex flex-wrap justify-center gap-3"
        >
          {STATS.map((s) => (
            <span
              key={s.label}
              className="flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/60 px-4 py-1.5 text-sm font-medium text-slate-300"
            >
              <span>{s.icon}</span>
              {s.label}
            </span>
          ))}
        </motion.div>

        {/* Game cards grid */}
        <div className="mb-16 grid gap-5 sm:grid-cols-2">
          {GAMES.map((game, i) => (
            <GameCard key={game.href} game={game} index={i} />
          ))}
        </div>

        {/* Leaderboards */}
        <h2 className="mb-5 text-xl font-bold">{t.games.globalRanking}</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-300">🎰 로또 6/45</p>
            <LottoLeaderboard />
          </div>
        </div>
      </main>
    </div>
  )
}
