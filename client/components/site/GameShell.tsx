'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { FiArrowLeft } from 'react-icons/fi'
import PageShell from './PageShell'
import { Container, buttonQuiet } from './layout'
import { useLanguage } from '@/lib/LanguageContext'

export type GameKey =
  | 'tetris'
  | 'tower-defense'
  | 'survive'
  | 'typing'
  | 'lotto'
  | 'arcade'
  | 'rpg'
  | 'terminal'
  | 'aetheria'
  | 'stats'

const NAMES: Record<GameKey, { ko: string; en: string }> = {
  tetris: { ko: '테트리스', en: 'Tetris' },
  'tower-defense': { ko: '타워 디펜스', en: 'Tower Defense' },
  survive: { ko: '서바이브', en: 'Survive' },
  typing: { ko: '타이핑 게임', en: 'Typing Game' },
  lotto: { ko: '로또 6/45', en: 'Lotto 6/45' },
  arcade: { ko: '포켓 아케이드', en: 'Pocket Arcade' },
  rpg: { ko: 'RPG 월드', en: 'RPG World' },
  terminal: { ko: '터미널', en: 'Terminal' },
  aetheria: { ko: '에테리아', en: 'Aetheria' },
  stats: { ko: '전적', en: 'Stats' },
}

/**
 * A game page = the site frame + the game as a "screen placed on paper".
 * The screen keeps the game's own dark colours (design doc §7): the frame is
 * `.dark theme-locked-dark`, so the dark tokens and dark utility colours
 * apply only inside it.
 */
export default function GameShell({ game, children }: { game: GameKey; children: ReactNode }) {
  const { locale } = useLanguage()
  const en = locale === 'en'
  const name = NAMES[game]
  const backHref = game === 'rpg' || game === 'terminal' ? '/' : '/games'

  return (
    <PageShell>
      <Container className="pb-6 pt-8 md:pt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href={backHref} className={buttonQuiet}>
            <FiArrowLeft size={12} aria-hidden />
            {backHref === '/games' ? (en ? 'Games' : '게임 목록') : en ? 'Home' : '메인'}
          </Link>
        </div>
        <h1 className="mt-4 text-[40px] font-black leading-none tracking-[-0.05em] md:text-[56px]">{en ? name.en : name.ko}</h1>
      </Container>
      <Container>
        <div className="dark theme-locked-dark overflow-hidden rounded-xl border-2 border-ink bg-[#06070d] text-white shadow-ink">
          <div className="flex h-8 items-center gap-1.5 border-b-2 border-ink bg-cat-game px-3" aria-hidden>
            <i className="h-2.5 w-2.5 rounded-full border-[1.5px] border-ink bg-white" />
            <i className="h-2.5 w-2.5 rounded-full border-[1.5px] border-ink bg-white" />
            <i className="h-2.5 w-2.5 rounded-full border-[1.5px] border-ink bg-white" />
          </div>
          {children}
        </div>
      </Container>
    </PageShell>
  )
}
