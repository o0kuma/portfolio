'use client'

import { useEffect, useState } from 'react'
import { FiExternalLink } from 'react-icons/fi'
import PageShell from '@/components/site/PageShell'
import { Container, PageHeader, SECTION_BG } from '@/components/site/layout'
import { useLanguage } from '@/lib/LanguageContext'
import { RECIPES, type Recipe } from '@/lib/recipes'

const ruled = { backgroundImage: 'linear-gradient(transparent 29px, #dfeee6 29px)', backgroundSize: '100% 30px' }

// Recipe content is Korean-only regardless of site locale — this is a
// personal recipe box, not translated content.
function RecipeCard({ recipe }: { recipe: Recipe }) {
  const [open, setOpen] = useState(false)
  // Ticked ingredients last for this visit only.
  const [done, setDone] = useState<Set<string>>(new Set())
  const ingredientCount = recipe.ingredientGroups.reduce((n, g) => n + g.items.length, 0)
  const panelId = `recipe-${recipe.slug}`

  const toggleItem = (key: string) =>
    setDone((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  return (
    <article
      className={`relative overflow-hidden rounded-lg border-2 border-ink bg-white shadow-ink ${open ? 'md:col-span-2' : ''}`}
    >
      {/* Colour = section: every recipe card carries the 레시피 mint band. */}
      <div className={`h-3 border-b-2 border-ink ${SECTION_BG.recipe}`} aria-hidden />
      <div className="px-5 py-5 md:px-6" style={ruled}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={panelId}
          className="block w-full text-left"
        >
          <h2 className="text-2xl font-black tracking-[-0.03em]">{recipe.title}</h2>
          <p className="mt-0.5 text-[13px] font-bold text-ink-soft">
            {recipe.servings} · 재료 {ingredientCount}가지
          </p>
          <span className="mt-3 inline-block text-sm font-extrabold">{open ? '카드 접기 ↑' : '카드 펼치기 →'}</span>
        </button>

        {open && (
          <div id={panelId} className="mt-4">
            <p className="mb-3 text-xs font-bold text-ink-soft">{recipe.measurementNote}</p>
            <div className="grid gap-6 md:grid-cols-[1fr_1.3fr]">
              <div className="space-y-4">
                {recipe.ingredientGroups.map((group) => (
                  <div key={group.title}>
                    <h3 className="text-sm font-extrabold">{group.title}</h3>
                    <ul className="mt-1">
                      {group.items.map((item) => {
                        const key = `${group.title}:${item}`
                        const checked = done.has(key)
                        return (
                          <li key={item}>
                            <button
                              type="button"
                              role="checkbox"
                              aria-checked={checked}
                              onClick={() => toggleItem(key)}
                              className="flex min-h-[30px] w-full items-center gap-2.5 text-left text-[15px]"
                            >
                              <span
                                aria-hidden
                                className={`grid h-[15px] w-[15px] shrink-0 place-items-center rounded-[3px] border-2 border-ink text-[10px] font-black ${
                                  checked ? 'bg-cat-recipe' : 'bg-white'
                                }`}
                              >
                                {checked ? '✓' : ''}
                              </span>
                              <span className={checked ? 'text-ink-soft line-through' : ''}>{item}</span>
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="text-sm font-extrabold">만드는 법</h3>
                <ol className="mt-1 space-y-2">
                  {recipe.steps.map((step, i) => (
                    <li key={i} className="flex gap-2.5 text-[15px] leading-[1.7]">
                      <span className="mt-[3px] grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full border-2 border-ink bg-cat-recipe text-xs font-black">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
            {recipe.sourceUrl && (
              <a
                href={recipe.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-pen hover:underline"
              >
                출처 <FiExternalLink size={11} aria-hidden />
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

export default function RecipesPageClient() {
  const { locale } = useLanguage()
  const [recipes, setRecipes] = useState<Recipe[]>(RECIPES)

  useEffect(() => {
    fetch('/api/recipes')
      .then((r) => r.json())
      .then((data: { recipes?: Recipe[] }) => {
        if (Array.isArray(data.recipes) && data.recipes.length > 0) setRecipes(data.recipes)
      })
      .catch(() => {})
  }, [])

  const en = locale === 'en'
  // Newest first: the last recipe added is shown at the top.
  const ordered = [...recipes].reverse()

  return (
    <PageShell>
      <PageHeader
        title={en ? 'Recipes' : '레시피'}
        description={en ? `Recipe cards I have actually cooked: ${recipes.length}.` : `직접 해 먹어 본 레시피 카드 ${recipes.length}장.`}
        note={en ? 'Tap an ingredient to tick it' : '재료는 눌러서 체크'}
      />
      <Container>
        <div className="grid items-start gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ordered.map((recipe) => (
            <RecipeCard key={recipe.slug} recipe={recipe} />
          ))}
        </div>
      </Container>
    </PageShell>
  )
}
