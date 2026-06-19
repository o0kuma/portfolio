import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { PORTFOLIO_PROJECTS, getProject } from '@/lib/portfolio-projects'
import CaseStudyContent from './CaseStudyContent'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return PORTFOLIO_PROJECTS.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const project = getProject(slug)
  if (!project) return { title: 'Not Found' }
  return {
    title: `${project.title} — Case Study`,
    description: project.tagline,
  }
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params
  const project = getProject(slug)
  if (!project) notFound()
  return <CaseStudyContent project={project} />
}
