'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { FiArrowRight } from 'react-icons/fi'
import PageShell from '@/components/site/PageShell'
import { Container } from '@/components/site/layout'
import type { HomePost } from '@/components/home/post-types'
import { useLanguage } from '@/lib/LanguageContext'
import { normalizePostListItem } from '@/lib/postApi'
import { getApiBaseUrl } from '@/lib/api-base-url'
import { plainTextExcerpt } from '@/lib/textExcerpt'
import { POST_CATEGORIES, getCategoryLabel } from '@/lib/post-categories'
import { RECIPES, type Recipe } from '@/lib/recipes'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

const API_BASE = getApiBaseUrl()

// The starfield is the home page's one piece of decoration: first screen only.
const HomeScene = dynamic(() => import('./HomeScene'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-night" aria-hidden />,
})

function formatDate(value: string, en: boolean) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(en ? 'en-US' : 'ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

/** Static stand-in for the 3D sky on phones and with "reduce motion" on. */
function StillSky() {
  return (
    <div
      className="h-full w-full bg-night"
      aria-hidden
      style={{
        backgroundImage:
          'radial-gradient(1px 1px at 12% 22%, rgba(255,255,255,0.7), transparent),' +
          'radial-gradient(1px 1px at 28% 68%, rgba(255,255,255,0.5), transparent),' +
          'radial-gradient(1px 1px at 46% 34%, rgba(255,255,255,0.6), transparent),' +
          'radial-gradient(1px 1px at 63% 78%, rgba(255,255,255,0.45), transparent),' +
          'radial-gradient(1px 1px at 74% 18%, rgba(255,255,255,0.65), transparent),' +
          'radial-gradient(1px 1px at 88% 52%, rgba(255,255,255,0.5), transparent),' +
          'radial-gradient(1px 1px at 8% 84%, rgba(255,255,255,0.4), transparent),' +
          'radial-gradient(1px 1px at 92% 88%, rgba(255,255,255,0.4), transparent)',
      }}
    />
  )
}

function useIsPhone() {
  const [phone, setPhone] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    const sync = () => setPhone(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  return phone
}

/** Home (/) — quiet starfield hero, then one screen that sums up the site. */
export default function ImmersiveHome() {
  const { locale } = useLanguage()
  const en = locale === 'en'
  const reduced = usePrefersReducedMotion()
  const phone = useIsPhone()
  const [starCaught, setStarCaught] = useState(false)
  const [posts, setPosts] = useState<HomePost[] | null>(null)
  const [recipes, setRecipes] = useState<Recipe[]>(RECIPES)

  useEffect(() => {
    let cancelled = false
    fetch(`${API_BASE}/api/posts?page=1&limit=4`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: { posts?: Record<string, unknown>[] }) => {
        if (!cancelled) setPosts((data.posts ?? []).map((row) => normalizePostListItem(row)))
      })
      .catch(() => {
        if (!cancelled) setPosts([])
      })
    fetch('/api/recipes')
      .then((r) => r.json())
      .then((data: { recipes?: Recipe[] }) => {
        if (!cancelled && Array.isArray(data.recipes) && data.recipes.length > 0) setRecipes(data.recipes)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!starCaught) return
    const id = setTimeout(() => setStarCaught(false), 4000)
    return () => clearTimeout(id)
  }, [starCaught])

  const [lead, ...rest] = posts ?? []
  const latestRecipe = recipes[recipes.length - 1]

  return (
    <PageShell overlayHeader>
      {/* Hero — pulled up under the transparent header */}
      <section className="relative -mt-14 flex h-[80svh] min-h-[520px] items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          {reduced || phone ? <StillSky /> : <HomeScene onCatchStar={() => setStarCaught(true)} />}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-night" aria-hidden />
        <div className="relative z-10 px-5 text-center">
          <h1 className="font-logo text-[56px] font-bold leading-none tracking-tight text-fg md:text-[96px]">kuuuma</h1>
          <p className="mx-auto mt-6 max-w-md text-base leading-[1.7] text-fg-muted md:text-lg">
            {en
              ? 'Notes, recipes, places worth a visit and a few small games.'
              : '글, 직접 해 먹은 레시피, 가 본 맛집, 작은 게임을 모아 둡니다.'}
          </p>
          <a
            href="#recent"
            className="mt-10 inline-flex items-center gap-2 rounded-md border border-line-strong bg-night/40 px-5 py-2.5 text-sm text-fg backdrop-blur-sm transition-colors hover:bg-panel-2"
          >
            {en ? 'Recent posts' : '최근 글 보기'}
          </a>
        </div>
      </section>

      <AnimatePresence>
        {starCaught && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none fixed inset-x-0 top-20 z-50 flex justify-center px-4"
            aria-live="polite"
          >
            <p className="rounded-md border border-line-strong bg-panel px-4 py-2 text-sm text-fg">
              {en ? 'You caught a shooting star. Make a wish.' : '유성을 잡았습니다. 소원을 빌어 보세요.'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent — one screen that sums up the site */}
      <Container width="wide" className="scroll-mt-20 pt-8" >
        <div id="recent" className="scroll-mt-20" />
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold tracking-[-0.02em] text-fg md:text-[28px]">{en ? 'Recently' : '최근 소식'}</h2>
          <Link href="/posts" className="inline-flex items-center gap-1 text-sm text-fg-muted hover:text-fg">
            {en ? 'All posts' : '전체 글'} <FiArrowRight size={14} aria-hidden />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Latest post */}
          <article className="rounded-xl border border-line bg-panel p-6 md:col-span-2 md:p-8">
            {posts === null ? (
              <div className="space-y-3" aria-hidden>
                <div className="h-3 w-32 rounded bg-panel-2" />
                <div className="h-7 w-3/4 rounded bg-panel-2" />
                <div className="h-4 w-full rounded bg-panel-2" />
              </div>
            ) : lead ? (
              <Link href={`/posts/${lead._id}`} className="group block">
                <p className="text-xs text-fg-subtle">
                  {getCategoryLabel(lead.category, en ? 'en' : 'ko')} · {formatDate(lead.createdAt, en)}
                </p>
                <h3 className="mt-3 text-[22px] font-bold leading-[1.4] tracking-[-0.02em] text-fg group-hover:underline group-hover:decoration-star group-hover:underline-offset-4 md:text-[28px]">
                  {lead.title}
                </h3>
                <p className="mt-4 line-clamp-2 text-base leading-[1.75] text-fg-muted">{plainTextExcerpt(lead.content, 140)}</p>
                <span className="mt-6 inline-flex items-center gap-1 text-sm text-fg">
                  {en ? 'Read' : '읽기'} <FiArrowRight size={14} aria-hidden />
                </span>
              </Link>
            ) : (
              <p className="text-sm text-fg-muted">{en ? 'No posts to show yet.' : '아직 보여 드릴 글이 없습니다.'}</p>
            )}
          </article>

          {/* Next posts */}
          <div className="rounded-xl border border-line bg-panel p-6">
            <p className="text-xs text-fg-subtle">{en ? 'More posts' : '이어서 읽기'}</p>
            <ul className="mt-2 divide-y divide-line">
              {(rest.length ? rest : []).map((p) => (
                <li key={p._id}>
                  <Link href={`/posts/${p._id}`} className="group block py-3">
                    <p className="text-xs text-fg-subtle">{formatDate(p.createdAt, en)}</p>
                    <p className="mt-1 line-clamp-2 text-sm leading-[1.6] text-fg group-hover:underline group-hover:decoration-star group-hover:underline-offset-4">
                      {p.title}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
            {posts !== null && rest.length === 0 && (
              <p className="mt-3 text-sm text-fg-muted">{en ? 'Nothing else yet.' : '다른 글은 아직 없습니다.'}</p>
            )}
          </div>

          <HomeTile
            href="/recipes"
            label={en ? 'Latest recipe' : '최근 레시피'}
            title={latestRecipe?.title ?? (en ? 'Recipes' : '레시피')}
            note={latestRecipe ? latestRecipe.servings : undefined}
          />
          <HomeTile
            href="/food"
            label={en ? 'Food' : '맛집'}
            title={en ? 'Places I have been' : '다녀온 맛집 리스트'}
            note={en ? 'By region and type' : '지역별 · 종류별'}
          />
          <HomeTile
            href="/games"
            label={en ? 'Games' : '게임'}
            title={en ? 'Small browser games' : '브라우저 미니 게임'}
            note={en ? 'Tetris, tower defense and more' : '테트리스, 타워 디펜스 외'}
          />
        </div>

        {/* Categories */}
        <div className="mt-16">
          <h2 className="text-xs text-fg-subtle">{en ? 'Posts by topic' : '분류별 글'}</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {POST_CATEGORIES.filter((c) => c.id !== 'general').map((c) => (
              <li key={c.id}>
                <Link
                  href={`/posts?category=${c.id}`}
                  className="inline-block rounded-md border border-line px-4 py-2 text-sm text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
                >
                  {en ? c.en : c.ko}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </PageShell>
  )
}

function HomeTile({ href, label, title, note }: { href: string; label: string; title: string; note?: string }) {
  return (
    <Link href={href} className="group block rounded-xl border border-line bg-panel p-6 transition-colors hover:border-line-strong">
      <p className="text-xs text-fg-subtle">{label}</p>
      <p className="mt-2 text-lg font-semibold leading-[1.4] text-fg">{title}</p>
      {note && <p className="mt-1 text-sm text-fg-muted">{note}</p>}
      <FiArrowRight className="mt-4 text-fg-subtle transition-colors group-hover:text-star" size={16} aria-hidden />
    </Link>
  )
}
