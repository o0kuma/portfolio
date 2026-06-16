'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Suspense } from 'react'
import { FiArrowDown } from 'react-icons/fi'
import BlogFooter from '@/components/BlogFooter'
import HomePostsSection from '@/components/home/HomePostsSection'
import { useLanguage } from '@/lib/LanguageContext'
import { PORTFOLIO_PUBLIC } from '@/lib/site'
import {
  HomeMotionProvider,
  useHomeMotion,
  useHomeScrollProgress,
} from '@/components/home/useHomeScrollProgress'

const HomeScene = dynamic(() => import('./HomeScene'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full animate-pulse bg-[#030014]" aria-hidden />
  ),
})

/**
 * Home (/) — immersive WebGL hero + scrollable blog posts section.
 */
function ImmersiveHomeInner() {
  const scrollProgress = useHomeScrollProgress()
  const { tilt, reduced } = useHomeMotion()
  const { t } = useLanguage()

  return (
    <div className="relative w-full bg-[#030014]">
      {/* Fixed canvas: stays visible behind hero; posts section uses opaque bg */}
      <div className="fixed inset-0 z-0">
        <Suspense fallback={<div className="h-full w-full bg-[#030014]" aria-hidden />}>
          <HomeScene scrollProgress={scrollProgress} />
        </Suspense>
      </div>

      {/* Hero: full viewport; pointer-events only where needed */}
      <section className="relative z-10 flex min-h-[100dvh] flex-col pointer-events-none">
        <header className="flex items-center justify-between px-5 py-5 md:px-12 md:py-8 pointer-events-auto">
          <Link
            href="/"
            className="font-display text-lg tracking-tight text-white/95 md:text-xl"
          >
            {t.home.brand}
          </Link>
          <nav className="flex items-center gap-5 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55 md:gap-10 md:text-xs">
            <a href="#posts-feed" className="transition-colors hover:text-white">
              {t.home.navPosts}
            </a>
            {PORTFOLIO_PUBLIC && (
              <Link href="/portfolio" className="transition-colors hover:text-white">
                {t.home.navPortfolio}
              </Link>
            )}
            <Link href="/games" className="transition-colors hover:text-white">
              {t.home.navGames}
            </Link>
          </nav>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center px-6 pb-28 text-center md:pb-36">
          {/* Brand mark — pointer tilt (2) */}
          <h1
            className="pointer-events-auto mb-6 max-w-[90vw] font-display text-[clamp(3.5rem,18vw,10rem)] font-bold leading-[0.88] tracking-tight transition-transform duration-150 ease-out will-change-transform"
            style={
              reduced
                ? undefined
                : {
                    transform: `perspective(900px) rotateX(${-tilt.y * 7}deg) rotateY(${tilt.x * 7}deg)`,
                    transformStyle: 'preserve-3d',
                  }
            }
          >
            <span className="bg-gradient-to-br from-white via-indigo-100 to-violet-300 bg-clip-text text-transparent drop-shadow-[0_0_60px_rgba(99,102,241,0.35)]">
              {t.home.brand}
            </span>
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-white/50 md:text-[15px]">
            {t.home.tagline}
          </p>
          <a
            href="#posts-feed"
            className="pointer-events-auto mt-12 inline-flex items-center gap-2 border border-white/15 bg-white/5 px-8 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white/85 backdrop-blur-sm transition hover:border-white/30 hover:bg-white/10"
          >
            {t.home.scrollCta}
          </a>
        </main>

        <footer className="pointer-events-none flex justify-center pb-10 md:pb-12">
          <a
            href="#posts-feed"
            className="pointer-events-auto flex flex-col items-center gap-2 text-white/35 transition hover:text-white/55"
          >
            <FiArrowDown className="animate-bounce" size={18} aria-hidden />
            <span className="text-[10px] uppercase tracking-[0.35em]">{t.home.scrollHint}</span>
          </a>
        </footer>
      </section>

      {/* Blog posts — scrollable; covers canvas */}
      <div className="relative z-20">
        <HomePostsSection />
        <BlogFooter />
      </div>
    </div>
  )
}

export default function ImmersiveHome() {
  return (
    <HomeMotionProvider>
      <ImmersiveHomeInner />
    </HomeMotionProvider>
  )
}
