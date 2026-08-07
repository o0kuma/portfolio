import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { getProject } from '@/lib/portfolio-projects'
import { isPortfolioPublic } from '@/lib/site'
import CaseStudyContent from './CaseStudyContent'

type Props = { params: Promise<{ slug: string }> }

/** Match /portfolio index — runtime gate must apply to case-study slugs too. */
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isPortfolioPublic()) {
    return {}
  }

  const { slug } = await params
  const project = getProject(slug)
  if (!project) return { title: 'Not Found' }
  return {
    title: `${project.title} — Case Study`,
    description: project.tagline,
  }
}

export default async function CaseStudyPage({ params }: Props) {
  if (!isPortfolioPublic()) {
    notFound()
  }

  const { slug } = await params
  const project = getProject(slug)
  if (!project) notFound()
  return <CaseStudyContent project={project} />
}
