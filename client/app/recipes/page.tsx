import type { Metadata } from 'next'
import RecipesPageClient from './RecipesPageClient'

export const metadata: Metadata = {
  title: 'Recipes',
  description: 'A collection of recipes I actually cook at home.',
  openGraph: {
    title: 'Recipes | Portfolio',
    description: 'A collection of recipes I actually cook at home.',
  },
}

export default function RecipesPage() {
  return <RecipesPageClient />
}
