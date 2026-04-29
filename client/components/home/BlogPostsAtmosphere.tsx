'use client'

import Link from 'next/link'
import type { HomePost } from '@/components/home/post-types'
import { useHomeMotion } from '@/components/home/useHomeScrollProgress'
import {
  FiArrowRight,
  FiCalendar,
  FiEye,
  FiHeart,
  FiMessageSquare,
  FiTag,
  FiUser,
} from 'react-icons/fi'

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
  const { tilt, reduced } = useHomeMotion()

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
          <nav className="mt-10 space-y-4 font-mono text-[11px] tracking-[0.12em] text-white/55" aria-label="블로그 빠른 이동">
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

        {/* Floating glass cards — vertical journey */}
        <div className="min-w-0 flex-1 [perspective:1600px]">
          {loading ? (
            <div className="space-y-12">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`h-56 animate-pulse rounded-[2rem] border border-white/5 bg-white/[0.04] backdrop-blur-md ${
                    i % 2 === 0 ? 'md:-rotate-1' : 'md:rotate-1 md:translate-x-6'
                  }`}
                />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-white/15 bg-white/[0.03] px-8 py-20 text-center backdrop-blur-sm">
              <p className="font-mono text-xs tracking-widest text-white/40">NO ENTRIES FOUND</p>
              <p className="mt-4 text-sm text-white/45">
                API 서버를 확인하거나 게시판에서 글을 작성해 보세요.
              </p>
              <Link
                href="/posts"
                className="mt-8 inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-fuchsia-300/90 hover:text-white"
              >
                GO TO /posts <FiArrowRight size={14} aria-hidden />
              </Link>
            </div>
          ) : (
            <div className="space-y-14 md:space-y-20">
              {posts.map((post, i) => {
                const staticTilt =
                  i % 2 === 0
                    ? 'md:-translate-x-2 md:rotate-[-0.6deg]'
                    : 'md:translate-x-4 md:rotate-[0.5deg]'
                const depth = 1 + i * 0.1
                return (
                  <article
                    key={post._id}
                    className={`group relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.07] via-white/[0.02] to-transparent shadow-[0_25px_80px_-20px_rgba(0,0,0,0.85)] backdrop-blur-2xl transition duration-500 hover:border-white/20 hover:from-white/[0.1] hover:shadow-[0_35px_100px_-25px_rgba(79,70,229,0.15)] ${staticTilt}`}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <div
                      className="relative p-8 transition-transform duration-150 ease-out will-change-transform md:p-12 md:[transform-style:preserve-3d]"
                      style={
                        reduced
                          ? undefined
                          : {
                              transform: `perspective(1400px) rotateX(${-tilt.y * 4.5 * depth}deg) rotateY(${tilt.x * 4.5 * depth}deg)`,
                            }
                      }
                    >
                    <div className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 rounded-full bg-gradient-to-br from-fuchsia-500/10 via-violet-500/5 to-transparent blur-3xl transition-opacity group-hover:opacity-100 md:opacity-70" />

                    <div className="relative flex flex-wrap items-center gap-3">
                      {post.featured && (
                        <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-0.5 font-mono text-[9px] uppercase tracking-[0.25em] text-amber-200/90">
                          Featured
                        </span>
                      )}
                      <span className="rounded-full border border-white/10 px-3 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
                        {categoryLabel(post.category)}
                      </span>
                    </div>

                    <h3 className="relative mt-6 font-display text-3xl font-semibold leading-[1.15] tracking-tight text-white md:text-4xl lg:text-[2.75rem]">
                      <Link
                        href={`/posts/${post._id}`}
                        className="transition-colors hover:text-indigo-200"
                      >
                        {post.title}
                      </Link>
                    </h3>

                    <p className="relative mt-5 max-w-3xl text-base leading-relaxed text-white/45 line-clamp-3 md:text-lg">
                      {post.content}
                    </p>

                    <div className="relative mt-6 flex flex-wrap gap-2">
                      {post.tags.slice(0, 5).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-black/20 px-2.5 py-1 font-mono text-[10px] tracking-wide text-white/40"
                        >
                          <FiTag size={11} aria-hidden />
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="relative mt-8 flex flex-wrap items-center gap-x-8 gap-y-2 border-t border-white/10 pt-8 font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">
                      <span className="inline-flex items-center gap-2">
                        <FiUser size={12} className="text-white/25" aria-hidden />
                        {post.author}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <FiCalendar size={12} className="text-white/25" aria-hidden />
                        {formatDate(post.createdAt)}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <FiEye size={12} className="text-white/25" aria-hidden />
                        {formatNumber(post.views)}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <FiHeart size={12} className="text-white/25" aria-hidden />
                        {formatNumber(post.likes)}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <FiMessageSquare size={12} className="text-white/25" aria-hidden />
                        {formatNumber(post.comments?.length ?? 0)}
                      </span>
                    </div>

                    <Link
                      href={`/posts/${post._id}`}
                      className="relative mt-10 inline-flex items-center gap-3 border-b border-white/25 pb-1 font-mono text-[11px] tracking-[0.35em] text-white/70 transition hover:border-white/60 hover:text-white"
                    >
                      READ ENTRY
                      <FiArrowRight size={16} aria-hidden />
                    </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
