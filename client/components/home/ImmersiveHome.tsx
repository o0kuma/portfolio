'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { FiArrowRight } from 'react-icons/fi'
import PageShell from '@/components/site/PageShell'
import { Container, Dot, HandNote, Tape, cardClass, cardLinkClass, tagClass } from '@/components/site/layout'
import type { HomePost } from '@/components/home/post-types'
import { useLanguage } from '@/lib/LanguageContext'
import { normalizePostListItem } from '@/lib/postApi'
import { getApiBaseUrl } from '@/lib/api-base-url'
import { plainTextExcerpt } from '@/lib/textExcerpt'
import { POST_CATEGORIES, getCategoryLabel } from '@/lib/post-categories'
import { RECIPES, type Recipe } from '@/lib/recipes'

const API_BASE = getApiBaseUrl()

function shortDate(value: string) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

function ingredientCount(r: Recipe) {
  return r.ingredientGroups.reduce((n, g) => n + g.items.length, 0)
}

/** Home (/) — the notebook's cover: one headline, then a board of recent things. */
export default function ImmersiveHome() {
  const { locale } = useLanguage()
  const en = locale === 'en'
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

  const [lead, ...rest] = posts ?? []
  const latestRecipe = recipes[recipes.length - 1]

  return (
    <PageShell>
      <Container className="pt-12 md:pt-16">
        {/* Cover */}
        <section className="grid items-end gap-6 md:grid-cols-[1fr_auto]">
          <div>
            <h1 className="break-keep text-[48px] font-black leading-[1.14] tracking-[-0.055em] text-ink md:text-[104px]">
              {en ? (
                <>
                  Eat, go, and <span className="bg-cat-post px-[0.1em] [box-decoration-break:clone]">write it</span>{' '}
                  <span className="inline-block -rotate-[2.5deg] rounded-xl border-[3px] border-ink bg-cat-food px-[0.14em] shadow-ink">down</span>
                </>
              ) : (
                <>
                  먹고, 가 보고,
                  <br />
                  <span className="bg-cat-post px-[0.1em] [box-decoration-break:clone]">써 두는</span>{' '}
                  <span className="inline-block -rotate-[2.5deg] rounded-xl border-[3px] border-ink bg-cat-food px-[0.14em] shadow-ink">기록장</span>
                </>
              )}
            </h1>
            <p className="mt-6 max-w-[44ch] text-lg leading-[1.7] text-ink">
              {en
                ? 'From dev notes to the noodles I cooked last night. A notebook kept by one person.'
                : '개발 이야기부터 직접 끓여 본 국수까지. 한 사람이 꾸리는 기록장입니다.'}
            </p>
          </div>
          <div className="hidden pb-3 md:block">
            <span className="grid h-[88px] w-[88px] -rotate-[8deg] place-items-center rounded-full border-[2.5px] border-dashed border-ink text-center text-sm font-black leading-tight">
              kuuuma
              <br />
              .com
            </span>
          </div>
        </section>

        {/* Board */}
        <section className="mt-12 grid gap-6 md:grid-cols-12" aria-label={en ? 'Recently' : '최근 소식'}>
          {posts === null ? (
            <div className={`${cardClass} bg-cat-post p-8 md:col-span-8`} aria-busy="true">
              <div className="h-4 w-28 rounded bg-ink/10" />
              <div className="mt-5 h-9 w-3/4 rounded bg-ink/10" />
              <div className="mt-4 h-4 w-full rounded bg-ink/10" />
            </div>
          ) : lead ? (
            <Link href={`/posts/${lead._id}`} className={`${cardLinkClass} bg-cat-post p-7 md:col-span-8 md:p-8`}>
              <Tape className="right-6 rotate-[5deg]" />
              <span className="absolute -top-3.5 left-6 rotate-[6deg] rounded-lg border-2 border-ink bg-cat-food px-2 py-0.5 text-xs font-black shadow-[2px_2px_0_#141414]">
                {en ? 'New' : '새 글'}
              </span>
              <span className={`${tagClass} mt-2`}>
                <Dot section="post" />
                {getCategoryLabel(lead.category, en ? 'en' : 'ko')} · {shortDate(lead.createdAt)}
              </span>
              <h2 className="mt-4 break-keep text-[26px] font-black leading-[1.25] tracking-[-0.04em] md:text-[40px]">{lead.title}</h2>
              <p className="mt-3 line-clamp-2 max-w-[52ch] text-base leading-[1.75]">{plainTextExcerpt(lead.content, 140)}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-extrabold">
                {en ? 'Read' : '읽기'} <FiArrowRight size={14} aria-hidden />
              </span>
            </Link>
          ) : (
            <div className={`${cardClass} bg-cat-post p-8 md:col-span-8`}>
              <p className="text-base">{en ? 'No posts to show yet.' : '아직 보여 드릴 글이 없습니다.'}</p>
            </div>
          )}

          <div className={`${cardClass} p-6 md:col-span-4`}>
            <span className={tagClass}>
              <Dot section="post" />
              {en ? 'Keep reading' : '이어서 읽기'}
            </span>
            <ol className="mt-3">
              {rest.map((p, i) => (
                <li key={p._id} className="border-t-2 border-ink">
                  <Link href={`/posts/${p._id}`} className="grid grid-cols-[28px_1fr] gap-1 py-3 hover:bg-paper">
                    <span className="text-xl font-black">{i + 1}</span>
                    <span>
                      <span className="block text-[15px] font-bold leading-[1.45]">{p.title}</span>
                      <span className="text-xs text-ink-soft">
                        {getCategoryLabel(p.category, en ? 'en' : 'ko')} · {shortDate(p.createdAt)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
            {posts !== null && rest.length === 0 && (
              <p className="mt-3 text-sm text-ink-soft">{en ? 'Nothing else yet.' : '다른 글은 아직 없습니다.'}</p>
            )}
          </div>

          <Link href="/recipes" className={`${cardLinkClass} bg-cat-recipe p-6 md:col-span-4`}>
            <Tape color="recipe" className="left-10 -rotate-3" />
            <span className={tagClass}>
              <Dot section="recipe" />
              {en ? 'Latest recipe' : '최근 레시피'}
            </span>
            <h3 className="mt-3 text-2xl font-black tracking-[-0.03em]">{latestRecipe?.title ?? (en ? 'Recipes' : '레시피')}</h3>
            {latestRecipe && (
              <p className="mt-1 text-sm">
                {latestRecipe.servings} · {en ? `${ingredientCount(latestRecipe)} ingredients` : `재료 ${ingredientCount(latestRecipe)}가지`}
              </p>
            )}
            <FiArrowRight className="absolute bottom-5 right-5" size={20} aria-hidden />
          </Link>
          <Link href="/food" className={`${cardLinkClass} bg-cat-food p-6 md:col-span-4`}>
            <span className={tagClass}>
              <Dot section="food" />
              {en ? 'Food' : '맛집'}
            </span>
            <h3 className="mt-3 text-2xl font-black tracking-[-0.03em]">{en ? 'Places I have been' : '다녀온 곳들'}</h3>
            <p className="mt-1 text-sm">{en ? 'By region and type' : '지역별 · 종류별로 모아 둔 리스트'}</p>
            <FiArrowRight className="absolute bottom-5 right-5" size={20} aria-hidden />
          </Link>
          <Link href="/games" className={`${cardLinkClass} bg-cat-game p-6 md:col-span-4`}>
            <span className={tagClass}>
              <Dot section="game" />
              {en ? 'Games' : '게임'}
            </span>
            <h3 className="mt-3 text-2xl font-black tracking-[-0.03em]">{en ? 'Six mini games' : '미니 게임 6개'}</h3>
            <p className="mt-1 text-sm">{en ? 'Tetris, tower defense and more' : '테트리스, 타워 디펜스 외'}</p>
            <FiArrowRight className="absolute bottom-5 right-5" size={20} aria-hidden />
          </Link>
        </section>

        {/* Topics */}
        <section className="mt-14 flex flex-wrap items-center gap-3" aria-label={en ? 'Posts by topic' : '분류별 글'}>
          <HandNote className="mr-2 text-[27px]">{en ? 'By topic →' : '분류별로 보기 →'}</HandNote>
          {POST_CATEGORIES.filter((c) => c.id !== 'general').map((c, i) => (
            <Link
              key={c.id}
              href={`/posts?category=${c.id}`}
              className={`rounded-[10px] border-2 border-ink bg-white px-4 py-2 font-extrabold shadow-ink-sm transition-transform hover:-translate-y-0.5 ${
                i % 2 ? 'rotate-[1.2deg]' : '-rotate-[1.5deg]'
              }`}
            >
              {en ? c.en : c.ko}
            </Link>
          ))}
        </section>
      </Container>
    </PageShell>
  )
}
