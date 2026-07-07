'use client'

import Link from 'next/link'
import type { HomePost } from '@/components/home/post-types'
import BlogPostsCarousel3D from '@/components/home/BlogPostsCarousel3D'
import { FiArrowRight } from 'react-icons/fi'
import { useLanguage } from '@/lib/LanguageContext'

type Props = {
  posts: HomePost[]
  loading: boolean
  formatDate: (d: string) => string
  formatNumber: (n: number) => string
  categoryLabel: (c: string) => string
}

function GrainOverlay() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.09] mix-blend-overlay"
      aria-hidden
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }}
    />
  )
}

/** Cinematic blog list band — Active Theory–inspired: dark space, grain, mono rail, glass cards. */
export default function BlogPostsAtmosphere({
  posts,
  loading,
  formatDate,
  formatNumber,
  categoryLabel,
}: Props) {
  const { locale } = useLanguage()
  return (
    <section
      className="relative min-h-screen overflow-hidden bg-[#030014] text-white"
      aria-labelledby="posts-feed-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(30,27,75,0.35)_0%,transparent_55%),radial-gradient(ellipse_at_bottom,rgba(0,0,0,0.85)_0%,transparent_50%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 shadow-[inset_0_0_160px_60px_rgba(0,0,0,0.55)]"
        aria-hidden
      />
      <GrainOverlay />

      <div className="page-shell relative z-10 flex flex-col gap-16 pb-28 pt-16 md:gap-24 md:pt-24 lg:flex-row lg:items-start lg:gap-20">
        {/* Left rail — monospace navigation (AT-style) */}
        <aside className="shrink-0 lg:sticky lg:top-28 lg:max-w-[13rem]">
          <p
            id="posts-feed-heading"
            className="font-mono text-[10px] font-medium uppercase leading-relaxed tracking-[0.4em] text-white/35"
          >
            What are you
            <br />
            looking for?
          </p>
          <nav className="mt-10 space-y-4 font-mono text-[11px] tracking-[0.12em] text-white/55" aria-label={locale === 'en' ? 'Quick blog navigation' : '블로그 빠른 이동'}>
            <Link
              href="/posts"
              className="flex items-baseline gap-2 transition-colors hover:text-white"
            >
              <span className="text-fuchsia-400/80" aria-hidden>
                →
              </span>
              ALL POSTS
            </Link>
            <Link
              href="/posts?category=tech"
              className="flex items-baseline gap-2 transition-colors hover:text-white"
            >
              <span className="text-violet-400/70" aria-hidden>
                →
              </span>
              TECH
            </Link>
            <Link
              href="/posts?category=travel"
              className="flex items-baseline gap-2 transition-colors hover:text-white"
            >
              <span className="text-cyan-400/60" aria-hidden>
                →
              </span>
              TRAVEL
            </Link>
            <Link
              href="/posts?category=food"
              className="flex items-baseline gap-2 transition-colors hover:text-white"
            >
              <span className="text-rose-400/60" aria-hidden>
                →
              </span>
              FOOD
            </Link>
          </nav>
          <Link
            href="/posts"
            className="mt-12 inline-flex w-full max-w-[15rem] items-center justify-center rounded-full border border-white/15 bg-white/[0.03] px-4 py-3 font-mono text-[10px] tracking-[0.28em] text-white/50 backdrop-blur-sm transition hover:border-white/30 hover:text-white/90"
          >
            OPEN ARCHIVE…
          </Link>
        </aside>

        {/* 3D carousel or empty */}
        <div className="min-w-0 flex-1">
          {loading ? (
            <div className="flex min-h-[min(52vh,480px)] items-center justify-center py-8">
              <div className="h-56 w-full max-w-[440px] animate-pulse rounded-[2rem] border border-white/5 bg-white/[0.04] backdrop-blur-md" />
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-white/15 bg-white/[0.03] px-8 py-20 text-center backdrop-blur-sm">
              <p className="font-mono text-xs tracking-widest text-white/40">NO ENTRIES FOUND</p>
              <p className="mt-4 text-sm text-white/45">
                {locale === 'en' ? 'Check the API server or try writing a post on the board.' : 'API 서버를 확인하거나 게시판에서 글을 작성해 보세요.'}
              </p>
              <Link
                href="/posts"
                className="mt-8 inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-fuchsia-300/90 hover:text-white"
              >
                GO TO /posts <FiArrowRight size={14} aria-hidden />
              </Link>
            </div>
          ) : (
            <BlogPostsCarousel3D
              posts={posts}
              formatDate={formatDate}
              formatNumber={formatNumber}
              categoryLabel={categoryLabel}
            />
          )}
        </div>
      </div>
    </section>
  )
}
