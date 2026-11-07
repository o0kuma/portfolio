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
  titleKo: string
  description: string
  descriptionKo: string
  genre: string
  genreKo: string
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
    titleKo: 'Tower Defense',
    description: 'Place towers to hold off incoming waves. Resource management and upgrade order decide the run.',
    descriptionKo: '타워를 배치해 몰려오는 적을 막는 게임. 자원 관리와 업그레이드 순서가 승부를 가릅니다.',
    genre: 'Strategy',
    genreKo: '전략',
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
    titleKo: 'Survive',
    description: 'A top-down shooter. Dodge the waves and last as long as you can. Online multiplayer included.',
    descriptionKo: '위에서 내려다보는 슈팅 게임. 밀려오는 적을 피하며 최대한 오래 버팁니다. 온라인 대전도 됩니다.',
    genre: 'Action',
    genreKo: '액션',
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
    titleKo: 'Typing Game',
    description: 'Type real code snippets and track your WPM and accuracy.',
    descriptionKo: '코드 조각을 따라 쳐서 타수와 정확도를 잽니다. 개발자용 타자 연습.',
    genre: 'Puzzle',
    genreKo: '퍼즐',
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
    titleKo: 'Tetris',
    description: 'Stack blocks, clear lines, and chase a high score.',
    descriptionKo: '블록을 쌓고 줄을 지워 최고 점수를 노리는 테트리스.',
    genre: 'Puzzle',
    genreKo: '퍼즐',
    difficulty: 2,
    techStack: ['React', 'Canvas'],
    emoji: '🧱',
    gradient: 'from-blue-600/30 via-indigo-700/20 to-slate-900',
    glowColor: 'group-hover:shadow-blue-500/20',
    accentColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  },
  {
    href: '/lotto',
    title: 'Lotto 6/45',
    titleKo: '로또 6/45',
    description: 'Pick numbers and run the draw. Compare with real past draws, or auto-buy until you hit 1st prize.',
    descriptionKo: '번호를 골라 추첨해 보고 역대 실제 회차와 비교합니다. 1등이 나올 때까지 자동 구매도 됩니다.',
    genre: 'Luck/Sim',
    genreKo: '운/시뮬',
    difficulty: 1,
    techStack: ['Next.js', 'API'],
    emoji: '🎰',
    gradient: 'from-amber-600/30 via-yellow-700/20 to-slate-900',
    glowColor: 'group-hover:shadow-amber-500/20',
    accentColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
  {
    href: '/arcade',
    title: 'Pocket Arcade',
    titleKo: '포켓 아케이드',
    description: 'A collection of quick one-handed mini games. Collect coins and chase the high score.',
    descriptionKo: '한 손으로 즐기는 초단타 미니게임 모음. 코인을 모으고 최고 기록에 도전하세요.',
    genre: 'Arcade',
    genreKo: '아케이드',
    difficulty: 2,
    techStack: ['Canvas', 'PWA'],
    emoji: '🕹️',
    gradient: 'from-fuchsia-600/30 via-purple-700/20 to-slate-900',
    glowColor: 'group-hover:shadow-fuchsia-500/20',
    accentColor: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30',
  },
]

function GameCard({ game, index, locale }: { game: GameInfo; index: number; locale: string }) {
  const en = locale === 'en'
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
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${game.accentColor}`}
          >
            {en ? game.genre : game.genreKo}
          </span>
        </div>

        {/* info */}
        <h2 className="mb-1.5 text-lg font-bold text-white">{en ? game.title : game.titleKo}</h2>
        <p className="mb-4 text-sm leading-relaxed text-slate-400">{en ? game.description : game.descriptionKo}</p>

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
          {en ? 'Play' : '플레이하기'}
        </Link>
      </div>
    </motion.div>
  )
}

export default function GamesPageClient() {
  const { t, locale } = useLanguage()
  const en = locale === 'en'

  return (
    <div className="min-h-screen bg-canvas pb-16 text-white">
      {/* sticky nav */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-canvas/90 backdrop-blur">
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
              {en ? 'View Stats' : '전적 보기'}
            </Link>
            <Link
              href="/achievements"
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-700/50 bg-amber-950/30 px-3 py-1.5 text-xs font-semibold text-amber-400 transition hover:border-amber-600 hover:text-amber-300"
            >
              {en ? 'Achievements' : '업적'}
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
          className="mb-10 text-center"
        >
          <h1 className="font-display mb-3 text-5xl font-bold tracking-tight">
            {en ? 'Games' : '게임'}
          </h1>
          <p className="text-lg text-slate-400">
            {en ? 'Mini games you can play right in your browser' : '브라우저에서 바로 즐기는 미니 게임'}
          </p>
        </motion.div>

        {/* Game cards grid */}
        <div className="mb-16 grid gap-5 sm:grid-cols-2">
          {GAMES.map((game, i) => (
            <GameCard key={game.href} game={game} index={i} locale={locale} />
          ))}
        </div>

        {/* Leaderboards */}
        <h2 className="mb-5 text-xl font-bold">{t.games.globalRanking}</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-300">{en ? 'Tetris' : '테트리스'}</p>
            <TetrisLeaderboard />
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-300">{en ? 'Survive' : '서바이브'}</p>
            <SurviveLeaderboard />
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-300">{en ? 'Tower Defense' : '타워 디펜스'}</p>
            <TowerDefenseLeaderboard />
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-300">{en ? 'Typing Game' : '타이핑 게임'}</p>
            <TypingLeaderboard />
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-300">{en ? 'Lotto 6/45' : '로또 6/45'}</p>
            <LottoLeaderboard />
          </div>
        </div>
      </main>
    </div>
  )
}
