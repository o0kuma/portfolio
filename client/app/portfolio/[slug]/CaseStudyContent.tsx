'use client'

import Link from 'next/link'
import { FiArrowLeft, FiExternalLink, FiGithub } from 'react-icons/fi'
import PageShell from '@/components/site/PageShell'
import { Container, buttonQuiet, buttonSecondary, cardClass } from '@/components/site/layout'
import { useLanguage } from '@/lib/LanguageContext'
import type { PortfolioProject } from '@/lib/portfolio-projects'

interface Props {
  project: PortfolioProject
}

/** /portfolio/[slug] — one project written up on a manuscript sheet. */
export default function CaseStudyContent({ project }: Props) {
  const { locale } = useLanguage()
  const ko = locale !== 'en'

  const title = ko ? project.titleKo : project.title
  const tagline = ko ? project.taglineKo : project.tagline
  const sections = [
    { label: ko ? '개요' : 'Overview', body: ko ? project.overviewKo : project.overview },
    { label: ko ? '문제' : 'The problem', body: ko ? project.problemKo : project.problem },
    { label: ko ? '해결' : 'The solution', body: ko ? project.solutionKo : project.solution },
  ]
  const features = ko ? project.featuresKo : project.features

  return (
    <PageShell>
      <Container width="reading" className="pt-10 md:pt-14">
        <Link href="/portfolio" className={buttonQuiet}>
          <FiArrowLeft size={12} aria-hidden />
          {ko ? '포트폴리오' : 'Portfolio'}
        </Link>

        <article className="relative mt-6 rounded-md border-2 border-ink bg-white px-6 py-8 pl-10 shadow-ink-lg md:px-12 md:py-12 md:pl-16">
          <span aria-hidden className="absolute bottom-0 left-[22px] top-0 border-l-2 border-cat-food/60 md:left-[30px]" />
          <ul className="flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <li key={tag} className="rounded-full border-2 border-ink bg-white px-2.5 py-0.5 text-xs font-extrabold">
                {tag}
              </li>
            ))}
          </ul>
          <h1 className="mt-4 break-keep text-[32px] font-black leading-[1.2] tracking-[-0.04em] md:text-[44px]">{title}</h1>
          <p className="mt-3 text-lg leading-[1.7] text-ink-soft">{tagline}</p>

          {(project.githubUrl || project.liveUrl) && (
            <div className="mt-6 flex flex-wrap gap-3">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target={project.liveUrl.startsWith('/') ? undefined : '_blank'}
                  rel={project.liveUrl.startsWith('/') ? undefined : 'noopener noreferrer'}
                  className={buttonSecondary}
                >
                  {ko ? '직접 해 보기' : 'Try it'} <FiExternalLink size={14} aria-hidden />
                </a>
              )}
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className={buttonSecondary}>
                  <FiGithub size={14} aria-hidden /> GitHub
                </a>
              )}
            </div>
          )}

          <div className="mt-10 space-y-8 text-[17px] leading-[1.9]">
            {sections.map((s) => (
              <section key={s.label}>
                <h2 className="text-2xl font-black tracking-[-0.02em]">{s.label}</h2>
                <p className="mt-2">{s.body}</p>
              </section>
            ))}
            <section>
              <h2 className="text-2xl font-black tracking-[-0.02em]">{ko ? '주요 기능' : 'Key features'}</h2>
              <ul className="mt-2 space-y-1.5">
                {features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span aria-hidden>–</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </article>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <section className={`${cardClass} p-6`}>
            <h2 className="text-sm font-extrabold">{ko ? '기술' : 'Tech stack'}</h2>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {project.techStack.map((tech) => (
                <li key={tech} className="rounded-full border-2 border-ink bg-white px-2.5 py-0.5 text-xs font-extrabold">
                  {tech}
                </li>
              ))}
            </ul>
          </section>
          {project.metrics && project.metrics.length > 0 && (
            <section className={`${cardClass} bg-cat-post p-6`}>
              <h2 className="text-sm font-extrabold">{ko ? '결과' : 'Results'}</h2>
              <dl className="mt-3 grid grid-cols-2 gap-4">
                {project.metrics.map((m) => (
                  <div key={m.label}>
                    <dt className="text-xs font-bold">{ko ? m.labelKo : m.label}</dt>
                    <dd className="text-2xl font-black tracking-[-0.03em]">{m.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>
      </Container>
    </PageShell>
  )
}
