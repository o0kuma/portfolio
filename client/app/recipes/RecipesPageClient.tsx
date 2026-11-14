'use client'

import { useEffect, useState } from 'react'
import { FiChevronDown, FiExternalLink } from 'react-icons/fi'
import PageShell from '@/components/site/PageShell'
import { Container, PageHeader } from '@/components/site/layout'
import { useLanguage } from '@/lib/LanguageContext'
import { RECIPES, type Recipe } from '@/lib/recipes'

// Recipe content is Korean-only regardless of site locale — this is a
// personal recipe box, not translated content.
function RecipeRow({ recipe }: { recipe: Recipe }) {
  const [open, setOpen] = useState(false)
  const ingredientCount = recipe.ingredientGroups.reduce((n, g) => n + g.items.length, 0)
  const panelId = `recipe-${recipe.slug}`

  return (
    <li className="border-b border-line">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span>
          <span className="block text-lg font-semibold text-fg md:text-xl">{recipe.title}</span>
          <span className="mt-1 block text-xs text-fg-subtle">
            {recipe.servings} · 재료 {ingredientCount}가지
          </span>
        </span>
        <FiChevronDown
          size={18}
          className={`shrink-0 text-fg-subtle transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {open && (
        <div id={panelId} className="pb-8">
          <p className="mb-6 text-xs text-fg-subtle">{recipe.measurementNote}</p>
          <div className="grid gap-8 md:grid-cols-[2fr_3fr]">
            <div className="space-y-6">
              {recipe.ingredientGroups.map((group) => (
                <div key={group.title}>
                  <h3 className="mb-2 text-sm font-semibold text-fg">{group.title}</h3>
                  <ul className="space-y-1.5 text-sm leading-[1.6] text-fg-muted">
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-fg">만드는 법</h3>
              <ol className="space-y-3 text-sm leading-[1.7] text-fg-muted">
                {recipe.steps.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="w-5 shrink-0 text-right tabular-nums text-fg-subtle">{i + 1}.</span>
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
              className="mt-6 inline-flex items-center gap-1.5 text-xs text-fg-subtle hover:text-fg"
            >
              출처 <FiExternalLink size={11} aria-hidden />
            </a>
          )}
        </div>
      )}
    </li>
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

  return (
    <PageShell>
      <PageHeader
        title={en ? 'Recipes' : '레시피'}
        description={en ? "Recipes I've actually cooked, kept in one place." : '직접 해 먹어 본 레시피를 모아 둡니다.'}
        meta={en ? `${recipes.length} recipes` : `레시피 ${recipes.length}개`}
      />
      <Container>
        <ul className="border-t border-line">
          {recipes.map((recipe) => (
            <RecipeRow key={recipe.slug} recipe={recipe} />
          ))}
        </ul>
      </Container>
    </PageShell>
  )
}
