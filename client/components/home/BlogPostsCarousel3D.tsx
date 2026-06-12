'use client'

import Link from 'next/link'
import type { HomePost } from '@/components/home/post-types'
import {
  FiArrowRight,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiHeart,
  FiMessageSquare,
  FiTag,
  FiUser,
} from 'react-icons/fi'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { usePrefersReducedMotion } from '@/components/home/useHomeScrollProgress'

type Props = {
  posts: HomePost[]
  formatDate: (d: string) => string
  formatNumber: (n: number) => string
  categoryLabel: (c: string) => string
}

type CardProps = {
  post: HomePost
  formatDate: Props['formatDate']
  formatNumber: Props['formatNumber']
  categoryLabel: Props['categoryLabel']
  active?: boolean
}

const DRAG_SENS = 0.45

/** DOM cylinder carousel — drag / wheel / arrows rotate cards around Y. */
export default function BlogPostsCarousel3D({
  posts,
  formatDate,
  formatNumber,
  categoryLabel,
}: Props) {
  const reduced = usePrefersReducedMotion()
  const wrapRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<HTMLDivElement>(null)
  const [radius, setRadius] = useState(320)
  const [rotation, setRotation] = useState(0)
  const [draggingUi, setDraggingUi] = useState(false)
  const dragging = useRef(false)
  const startX = useRef(0)
  const startRot = useRef(0)
  const pointerId = useRef<number | null>(null)

  const count = posts.length
  const step = useMemo(() => (count > 0 ? 360 / count : 360), [count])

  const activeIndex = useMemo(() => {
    if (count <= 0) return 0
    const raw = Math.round(-rotation / step)
    return ((raw % count) + count) % count
  }, [rotation, step, count])

  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return
    const ro = new ResizeObserver(() => {
      const w = scene.clientWidth
      setRadius(Math.min(460, Math.max(220, w * 0.34)))
    })
    ro.observe(scene)
    return () => ro.disconnect()
  }, [])

  const snap = useCallback(() => {
    if (count <= 1 || reduced) return
    setRotation((r) => Math.round(r / step) * step)
  }, [count, step, reduced])

  const goPrev = useCallback(() => {
    setRotation((r) => r + step)
  }, [step])

  const goNext = useCallback(() => {
    setRotation((r) => r - step)
  }, [step])

  useEffect(() => {
    const el = wrapRef.current
    if (!el || count <= 1) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const delta = Math.sign(e.deltaY) * step * 0.22
      setRotation((r) => r - delta)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [count, step])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goPrev, goNext])

  const onPointerDown = (e: React.PointerEvent) => {
    const t = e.target as HTMLElement
    if (t.closest('a, button')) return
    if (reduced || count <= 1) return
    dragging.current = true
    setDraggingUi(true)
    pointerId.current = e.pointerId
    startX.current = e.clientX
    startRot.current = rotation
    ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return
    if (pointerId.current !== e.pointerId) return
    const dx = e.clientX - startX.current
    setRotation(startRot.current + dx * DRAG_SENS)
  }

  const endDrag = (e: React.PointerEvent) => {
    if (pointerId.current !== null && e.pointerId !== pointerId.current) return
    if (!dragging.current) return
    dragging.current = false
    pointerId.current = null
    setDraggingUi(false)
    snap()
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId)
    } catch {
      /* noop */
    }
  }

  if (count === 1) {
    const post = posts[0]
    return (
      <div className="mx-auto max-w-[min(92vw,520px)] py-6">
        <GlassPostCard
          post={post}
          formatDate={formatDate}
          formatNumber={formatNumber}
          categoryLabel={categoryLabel}
        />
      </div>
    )
  }

  if (reduced) {
    return (
      <div className="space-y-12 md:space-y-16">
        {posts.map((post) => (
          <GlassPostCard
            key={post._id}
            post={post}
            formatDate={formatDate}
            formatNumber={formatNumber}
            categoryLabel={categoryLabel}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="relative py-4 md:py-8">
      <p className="mb-6 text-center font-mono text-[10px] uppercase tracking-[0.35em] text-stone-400">
        Drag · wheel · ← →
      </p>

      <div
        ref={wrapRef}
        className="relative mx-auto touch-none select-none outline-none"
        style={{ touchAction: 'none' }}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label="블로그 포스트 3D 캐러셀"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div
          ref={sceneRef}
          className="relative mx-auto min-h-[min(72vh,620px)] w-full max-w-[min(100%,920px)] [perspective:1500px] [perspective-origin:50%_42%]"
        >
          <div className="absolute inset-x-0 top-1/2 flex h-0 justify-center">
            <div
              className="relative [transform-style:preserve-3d]"
              style={{
                transform: reduced ? undefined : `rotateY(${rotation}deg)`,
                transition: draggingUi
                  ? 'none'
                  : reduced
                    ? 'none'
                    : 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            >
              {posts.map((post, i) => (
                <div
                  key={post._id}
                  className="absolute left-1/2 top-1/2 w-[min(92vw,440px)]"
                  style={{
                    transform: `translate(-50%, -50%) rotateY(${i * step}deg) translateZ(${radius}px)`,
                    transformStyle: 'preserve-3d',
                    backfaceVisibility: 'hidden',
                    opacity: i === activeIndex ? 1 : 0.25,
                    transition: 'opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
                    willChange: 'opacity, transform',
                  }}
                  aria-hidden={i !== activeIndex}
                >
                  <div
                    className={
                      i === activeIndex ? 'pointer-events-auto' : 'pointer-events-none'
                    }
                  >
                    <GlassPostCard
                      post={post}
                      formatDate={formatDate}
                      formatNumber={formatNumber}
                      categoryLabel={categoryLabel}
                      active={i === activeIndex}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-20 mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={goPrev}
            className="rounded-full border border-stone-300 bg-white/70 p-3 text-stone-500 backdrop-blur-sm transition hover:border-primary-400 hover:text-primary-700"
            aria-label="이전 글"
          >
            <FiChevronLeft size={22} />
          </button>
          <div className="flex gap-2">
            {posts.map((p, i) => (
              <button
                key={p._id}
                type="button"
                onClick={() => setRotation(-i * step)}
                className={`h-2 rounded-full transition-all ${
                  i === activeIndex
                    ? 'w-8 bg-primary-500'
                    : 'w-2 bg-stone-300 hover:bg-stone-400'
                }`}
                aria-label={`${i + 1}번째 글`}
                aria-current={i === activeIndex}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={goNext}
            className="rounded-full border border-stone-300 bg-white/70 p-3 text-stone-500 backdrop-blur-sm transition hover:border-primary-400 hover:text-primary-700"
            aria-label="다음 글"
          >
            <FiChevronRight size={22} />
          </button>
        </div>
      </div>
    </div>
  )
}

function GlassPostCard({
  post,
  formatDate,
  formatNumber,
  categoryLabel,
  active = false,
}: CardProps) {
  return (
    <article
      className={`group relative overflow-hidden rounded-[2rem] border shadow-[0_25px_80px_-30px_rgba(61,58,54,0.35)] backdrop-blur-2xl transition duration-300 md:[transform-style:preserve-3d] ${
        active
          ? 'border-stone-200 bg-gradient-to-br from-white via-white/90 to-primary-50/80 hover:border-primary-200'
          : 'border-stone-200/60 bg-gradient-to-br from-white/60 via-white/40 to-transparent hover:border-stone-300 hover:from-white/70'
      }`}
    >
      <div className="relative p-8 md:p-10">
        <div className="pointer-events-none absolute -right-6 -top-6 h-36 w-36 rounded-full bg-gradient-to-br from-primary-200/40 via-primary-100/30 to-transparent blur-3xl md:h-40 md:w-40" />

        <div className="relative flex flex-wrap items-center gap-3">
          {post.featured && (
            <span className="rounded-full border border-amber-300/60 bg-amber-100/70 px-3 py-0.5 font-mono text-[9px] uppercase tracking-[0.25em] text-amber-700">
              Featured
            </span>
          )}
          <span className="rounded-full border border-stone-200 px-3 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500">
            {categoryLabel(post.category)}
          </span>
        </div>

        <h3 className="relative mt-5 font-display text-2xl font-semibold leading-[1.15] tracking-tight text-stone-800 md:text-3xl lg:text-[2.25rem]">
          <Link
            href={`/posts/${post._id}`}
            className="transition-colors hover:text-primary-700"
          >
            {post.title}
          </Link>
        </h3>

        <p className="relative mt-4 max-w-3xl text-sm leading-relaxed text-stone-500 line-clamp-4 md:text-base">
          {post.content}
        </p>

        <div className="relative mt-5 flex flex-wrap gap-2">
          {post.tags.slice(0, 5).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 rounded-md border border-stone-200 bg-stone-100/70 px-2.5 py-1 font-mono text-[10px] tracking-wide text-stone-500"
            >
              <FiTag size={11} aria-hidden />
              {tag}
            </span>
          ))}
        </div>

        <div className="relative mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-stone-200 pt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-stone-400">
          <span className="inline-flex items-center gap-2">
            <FiUser size={12} className="text-stone-300" aria-hidden />
            {post.author}
          </span>
          <span className="inline-flex items-center gap-2">
            <FiCalendar size={12} className="text-stone-300" aria-hidden />
            {formatDate(post.createdAt)}
          </span>
          <span className="inline-flex items-center gap-2">
            <FiEye size={12} className="text-stone-300" aria-hidden />
            {formatNumber(post.views)}
          </span>
          <span className="inline-flex items-center gap-2">
            <FiHeart size={12} className="text-stone-300" aria-hidden />
            {formatNumber(post.likes)}
          </span>
          <span className="inline-flex items-center gap-2">
            <FiMessageSquare size={12} className="text-stone-300" aria-hidden />
            {formatNumber(post.comments?.length ?? 0)}
          </span>
        </div>

        <Link
          href={`/posts/${post._id}`}
          className="relative mt-8 inline-flex items-center gap-3 border-b border-stone-300 pb-1 font-mono text-[11px] tracking-[0.35em] text-stone-600 transition hover:border-primary-500 hover:text-primary-700"
        >
          READ ENTRY
          <FiArrowRight size={16} aria-hidden />
        </Link>
      </div>
    </article>
  )
}
