'use client'

import Link from 'next/link'
import { useState, type ComponentType } from 'react'
import { FiArrowRight, FiCrosshair, FiGrid, FiHash, FiShield, FiSmartphone, FiType } from 'react-icons/fi'
import PageShell from '@/components/site/PageShell'
import { Container, PageHeader, TabBar, tabClass, buttonSecondary } from '@/components/site/layout'
import TetrisLeaderboard from '@/components/tetris/TetrisLeaderboard'
import SurviveLeaderboard from '@/components/survive/SurviveLeaderboard'
import TowerDefenseLeaderboard from '@/components/tower-defense/TowerDefenseLeaderboard'
import TypingLeaderboard from '@/components/typing/TypingLeaderboard'
import LottoLeaderboard from '@/components/lotto/LottoLeaderboard'
import { useLanguage } from '@/lib/LanguageContext'

type GameInfo = {
  href: string
  ko: string
  en: string
  genreKo: string
  genreEn: string
  descKo: string
  descEn: string
  Icon: ComponentType<{ size?: number; className?: string }>
}

const GAMES: GameInfo[] = [
  {
    href: '/tetris',
    ko: '테트리스',
    en: 'Tetris',
    genreKo: '퍼즐',
    genreEn: 'Puzzle',
    descKo: '블록을 쌓고 줄을 지워 최고 점수를 노립니다.',
    descEn: 'Stack blocks, clear lines, and chase a high score.',
    Icon: FiGrid,
  },
  {
    href: '/tower-defense',
    ko: '타워 디펜스',
    en: 'Tower Defense',
    genreKo: '전략',
    genreEn: 'Strategy',
    descKo: '타워를 배치해 몰려오는 적을 막습니다. 자원 관리와 업그레이드 순서가 승부를 가릅니다.',
    descEn: 'Place towers to hold off incoming waves. Resource management and upgrade order decide the run.',
    Icon: FiShield,
  },
  {
    href: '/survive',
    ko: '서바이브',
    en: 'Survive',
    genreKo: '액션',
    genreEn: 'Action',
    descKo: '위에서 내려다보는 슈팅 게임. 밀려오는 적을 피하며 최대한 오래 버팁니다. 온라인 대전도 됩니다.',
    descEn: 'A top-down shooter. Dodge the waves and last as long as you can. Online multiplayer included.',
    Icon: FiCrosshair,
  },
  {
    href: '/typing-game',
    ko: '타이핑 게임',
    en: 'Typing Game',
    genreKo: '타자',
    genreEn: 'Typing',
    descKo: '코드 조각을 따라 쳐서 타수와 정확도를 잽니다.',
    descEn: 'Type real code snippets and track your WPM and accuracy.',
    Icon: FiType,
  },
  {
    href: '/lotto',
    ko: '로또 6/45',
    en: 'Lotto 6/45',
    genreKo: '시뮬레이션',
    genreEn: 'Simulation',
    descKo: '번호를 골라 추첨해 보고 역대 실제 회차와 비교합니다. 1등이 나올 때까지 자동 구매도 됩니다.',
    descEn: 'Pick numbers and run the draw. Compare with real past draws, or auto-buy until you hit 1st prize.',
    Icon: FiHash,
  },
  {
    href: '/arcade',
    ko: '포켓 아케이드',
    en: 'Pocket Arcade',
    genreKo: '아케이드',
    genreEn: 'Arcade',
    descKo: '한 손으로 하는 짧은 미니 게임 모음. 코인을 모으고 최고 기록에 도전합니다.',
    descEn: 'Quick one-handed mini games. Collect coins and chase the high score.',
    Icon: FiSmartphone,
  },
]

const BOARDS = [
  { key: 'tetris', ko: '테트리스', en: 'Tetris', Board: TetrisLeaderboard },
  { key: 'tower', ko: '타워 디펜스', en: 'Tower Defense', Board: TowerDefenseLeaderboard },
  { key: 'survive', ko: '서바이브', en: 'Survive', Board: SurviveLeaderboard },
  { key: 'typing', ko: '타이핑 게임', en: 'Typing Game', Board: TypingLeaderboard },
  { key: 'lotto', ko: '로또 6/45', en: 'Lotto 6/45', Board: LottoLeaderboard },
] as const

export default function GamesPageClient() {
  const { locale } = useLanguage()
  const en = locale === 'en'
  const [board, setBoard] = useState<(typeof BOARDS)[number]['key']>('tetris')
  const Active = BOARDS.find((b) => b.key === board)?.Board ?? TetrisLeaderboard

  return (
    <PageShell>
      <PageHeader
        title={en ? 'Games' : '게임'}
        description={en ? 'Small games that run right in the browser.' : '브라우저에서 바로 하는 미니 게임입니다.'}
        meta={en ? `${GAMES.length} games` : `게임 ${GAMES.length}개`}
        actions={
          <>
            <Link href="/games/stats" className={buttonSecondary}>
              {en ? 'Stats' : '전적'}
            </Link>
            <Link href="/achievements" className={buttonSecondary}>
              {en ? 'Achievements' : '업적'}
            </Link>
          </>
        }
      />

      <Container>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {GAMES.map((g, i) => (
            <li key={g.href}>
              <Link
                href={g.href}
                className={`group flex h-full min-h-[220px] flex-col rounded-xl border-2 border-ink p-6 shadow-ink transition-transform duration-150 hover:-translate-y-[3px] hover:-rotate-1 motion-reduce:transform-none ${
                  i % 3 === 1 ? 'bg-white' : 'bg-cat-game'
                }`}
              >
                <span className="self-start rounded-full border-2 border-ink bg-white px-2.5 py-0.5 text-xs font-black">
                  No.{i + 1} · {en ? g.genreEn : g.genreKo}
                </span>
                <h2 className="mt-4 text-[28px] font-black leading-tight tracking-[-0.04em]">{en ? g.en : g.ko}</h2>
                <p className="mt-2 flex-1 text-sm leading-[1.65]">{en ? g.descEn : g.descKo}</p>
                <span className="mt-4 flex items-center justify-between border-t-2 border-dashed border-ink pt-3 font-black">
                  <span className="inline-flex items-center gap-1">
                    {en ? 'Play' : '플레이'} <FiArrowRight size={14} aria-hidden />
                  </span>
                  <g.Icon size={18} aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <section className="mt-16 grid items-start gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 className="text-[40px] font-black tracking-[-0.04em]">{en ? 'Rankings' : '순위표'}</h2>
            <p className="mt-2 text-ink-soft">{en ? 'Pick a game to see the top scores.' : '게임을 골라 상위 기록을 봅니다.'}</p>
            <div className="mt-4">
              <TabBar label={en ? 'Pick a game' : '게임 선택'}>
                {BOARDS.map((b) => (
                  <button
                    key={b.key}
                    type="button"
                    role="tab"
                    aria-selected={board === b.key}
                    onClick={() => setBoard(b.key)}
                    className={tabClass(board === b.key)}
                  >
                    {en ? b.en : b.ko}
                  </button>
                ))}
              </TabBar>
            </div>
          </div>
          <Active />
        </section>
      </Container>
    </PageShell>
  )
}
