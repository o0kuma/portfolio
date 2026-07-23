'use client'

import Link from 'next/link'
import { useState } from 'react'
import { FiArrowLeft, FiExternalLink } from 'react-icons/fi'
import { useLanguage } from '@/lib/LanguageContext'
import { RECIPES, type Recipe } from '@/lib/recipes'

// Recipe content is Korean-only regardless of site locale — this is a
// personal recipe box, not translated content.
function RecipeCard({ recipe }: { recipe: Recipe }) {
  const [open, setOpen] = useState(true)

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 md:p-8">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-50">{recipe.title}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {recipe.servings} · {recipe.measurementNote}
          </p>
        </div>
        <span className="shrink-0 text-slate-500">{open ? '−' : '+'}</span>
      </button>

      {open && (
        <div className="mt-6 grid gap-8 md:grid-cols-2">
          <div className="space-y-6">
            {recipe.ingredientGroups.map((group) => (
              <div key={group.title}>
                <h3 className="mb-3 text-xs font-mono uppercase tracking-widest text-slate-500">
                  {group.title}
                </h3>
                <ul className="space-y-1.5 text-sm text-slate-300">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div>
            <h3 className="mb-3 text-xs font-mono uppercase tracking-widest text-slate-500">
              만드는 법
            </h3>
            <ol className="space-y-3 text-sm text-slate-300">
              {recipe.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-700 text-[11px] font-mono text-slate-400">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {recipe.sourceUrl && (
        <div className="mt-6 border-t border-slate-900 pt-4">
          <a
            href={recipe.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300"
          >
            재료 출처 <FiExternalLink size={11} />
          </a>
        </div>
      )}
    </article>
  )
}

export default function RecipesPageClient() {
  const { locale } = useLanguage()

  return (
    <div className="min-h-screen bg-slate-950 pb-20 text-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
          >
            <FiArrowLeft className="h-4 w-4" /> {locale === 'en' ? 'Home' : '메인으로'}
          </Link>
          <span className="text-sm font-semibold text-slate-200">
            🍲 {locale === 'en' ? 'Recipes' : '레시피 모음'}
          </span>
          <Link href="/food" className="ml-auto text-xs font-semibold text-slate-400 hover:text-white">
            {locale === 'en' ? 'Restaurants →' : '맛집 리스트 →'}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pt-10">
        <div className="mb-10 text-center">
          <h1 className="font-display mb-2 text-4xl font-bold">
            🍲 {locale === 'en' ? 'Recipes' : '레시피 모음집'}
          </h1>
          <p className="text-sm text-slate-500">
            {locale === 'en'
              ? "Recipes I've actually cooked, kept in one place."
              : '직접 해먹어본 레시피들을 한곳에 모아둡니다.'}
          </p>
        </div>

        <div className="space-y-8">
          {RECIPES.map((recipe) => (
            <RecipeCard key={recipe.slug} recipe={recipe} />
          ))}
        </div>
      </main>
    </div>
  )
}
