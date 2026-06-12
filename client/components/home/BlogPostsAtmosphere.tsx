'use client'

import Link from 'next/link'
import type { HomePost } from '@/components/home/post-types'
import BlogPostsCarousel3D from '@/components/home/BlogPostsCarousel3D'
import { FiArrowRight } from 'react-icons/fi'

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

/** Airy blog list band — light minimal: warm paper bg, grain, mono rail, soft cards. */
export default function BlogPostsAtmosphere({
  posts,
  loading,
  formatDate,
  formatNumber,
  categoryLabel,
}: Props) {
  return (
    <section
      className="relative min-h-screen overflow-hidden bg-[#faf9f7] text-stone-800"
      aria-labelledby="posts-feed-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(227,184,163,0.22)_0%,transparent_55%),radial-gradient(ellipse_at_bottom,rgba(238,212,199,0.35)_0%,transparent_50%)]"
        aria-hidden
      />
      <GrainOverlay />

      <div className="page-shell relative z-10 flex flex-col gap-16 pb-28 pt-16 md:gap-24 md:pt-24 lg:flex-row lg:items-start lg:gap-20">
        {/* Left rail — monospace navigation (AT-style) */}
        <aside className="shrink-0 lg:sticky lg:top-28 lg:max-w-[13rem]">
          <p
            id="posts-feed-heading"
            className="font-mono text-[10px] font-medium uppercase leading-relaxed tracking-[0.4em] text-stone-400"
          >
            What are you
            <br />
            looking for?
          </p>
          <nav className="mt-10 space-y-4 font-mono text-[11px] tracking-[0.12em] text-stone-500" aria-label="블로그 빠른 이동">
            <Link
              href="/posts"
              className="flex items-baseline gap-2 transition-colors hover:text-stone-900"
            >
              <span className="text-primary-500" aria-hidden>
                →
              </span>
              ALL POSTS
            </Link>
            <Link
              href="/posts?category=tech"
              className="flex items-baseline gap-2 transition-colors hover:text-stone-900"
            >
              <span className="text-primary-400" aria-hidden>
                →
              </span>
              TECH
            </Link>
            <Link
              href="/posts?category=travel"
              className="flex items-baseline gap-2 transition-colors hover:text-stone-900"
            >
              <span className="text-primary-300" aria-hidden>
                →
              </span>
              TRAVEL
            </Link>
            <Link
              href="/posts?category=food"
              className="flex items-baseline gap-2 transition-colors hover:text-stone-900"
            >
              <span className="text-primary-600" aria-hidden>
                →
              </span>
              FOOD
            </Link>
          </nav>
          <Link
            href="/posts"
            className="mt-12 inline-flex w-full max-w-[15rem] items-center justify-center rounded-full border border-stone-300 bg-white/60 px-4 py-3 font-mono text-[10px] tracking-[0.28em] text-stone-500 backdrop-blur-sm transition hover:border-primary-400 hover:text-primary-700"
          >
            OPEN ARCHIVE…
          </Link>
        </aside>

        {/* 3D carousel or empty */}
        <div className="min-w-0 flex-1">
          {loading ? (
            <div className="flex min-h-[min(52vh,480px)] items-center justify-center py-8">
              <div className="h-56 w-full max-w-[440px] animate-pulse rounded-[2rem] border border-stone-200 bg-white/60 backdrop-blur-md" />
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-stone-300 bg-white/50 px-8 py-20 text-center backdrop-blur-sm">
              <p className="font-mono text-xs tracking-widest text-stone-400">NO ENTRIES FOUND</p>
              <p className="mt-4 text-sm text-stone-500">
                API 서버를 확인하거나 게시판에서 글을 작성해 보세요.
              </p>
              <Link
                href="/posts"
                className="mt-8 inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-primary-600 hover:text-primary-800"
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
