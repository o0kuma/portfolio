'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { FiGithub, FiExternalLink, FiArrowLeft } from 'react-icons/fi'
import { useLanguage } from '@/lib/LanguageContext'
import type { PortfolioProject } from '@/lib/portfolio-projects'

interface Props {
  project: PortfolioProject
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5 },
}

export default function CaseStudyContent({ project }: Props) {
  const { locale } = useLanguage()
  const isKo = locale === 'ko'

  const title = isKo ? project.titleKo : project.title
  const tagline = isKo ? project.taglineKo : project.tagline
  const overview = isKo ? project.overviewKo : project.overview
  const problem = isKo ? project.problemKo : project.problem
  const solution = isKo ? project.solutionKo : project.solution
  const features = isKo ? project.featuresKo : project.features

  const backLabel = isKo ? '← 포트폴리오로' : '← Back to Portfolio'
  const overviewLabel = isKo ? '개요' : 'Overview'
  const problemLabel = isKo ? '문제' : 'The Problem'
  const solutionLabel = isKo ? '해결책' : 'The Solution'
  const featuresLabel = isKo ? '주요 기능' : 'Key Features'
  const techStackLabel = isKo ? '기술 스택' : 'Tech Stack'
  const metricsLabel = isKo ? '결과 / 지표' : 'Results & Metrics'
  const githubLabel = 'GitHub'
  const liveLabel = isKo ? '라이브 데모' : 'Live Demo'

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50">
      {/* Back link */}
      <div className="container mx-auto max-w-4xl px-4 pt-8">
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-neutral-200 transition-colors text-sm"
        >
          <FiArrowLeft size={14} />
          {backLabel}
        </Link>
      </div>

      {/* Hero */}
      <motion.div
        {...fadeUp}
        className="container mx-auto max-w-4xl px-4 pt-12 pb-10"
      >
        <div className="flex flex-wrap gap-2 mb-5">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="bg-neutral-800 text-neutral-300 text-xs px-2 py-1 rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-neutral-50 mb-4 leading-tight">
          {title}
        </h1>
        <p className="text-xl text-neutral-400 leading-relaxed">{tagline}</p>

        {/* Links */}
        {(project.githubUrl || project.liveUrl) && (
          <div className="flex gap-3 mt-6">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-700 text-neutral-300 text-sm hover:border-neutral-500 hover:text-neutral-100 transition-colors"
              >
                <FiGithub size={15} />
                {githubLabel}
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target={project.liveUrl.startsWith('/') ? undefined : '_blank'}
                rel={project.liveUrl.startsWith('/') ? undefined : 'noopener noreferrer'}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-100 text-neutral-950 text-sm hover:bg-white transition-colors"
              >
                <FiExternalLink size={15} />
                {liveLabel}
              </a>
            )}
          </div>
        )}
      </motion.div>

      <div className="border-t border-neutral-800" />

      <div className="container mx-auto max-w-4xl px-4 py-12 space-y-14">
        {/* Overview */}
        <motion.section {...fadeUp}>
          <p className="text-cyan-400 text-xs font-mono uppercase tracking-widest mb-3">
            {overviewLabel}
          </p>
          <p className="text-neutral-300 leading-relaxed text-lg">{overview}</p>
        </motion.section>

        {/* Problem */}
        <motion.section {...fadeUp}>
          <p className="text-cyan-400 text-xs font-mono uppercase tracking-widest mb-3">
            {problemLabel}
          </p>
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
            <p className="text-neutral-300 leading-relaxed">{problem}</p>
          </div>
        </motion.section>

        {/* Solution */}
        <motion.section {...fadeUp}>
          <p className="text-cyan-400 text-xs font-mono uppercase tracking-widest mb-3">
            {solutionLabel}
          </p>
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
            <p className="text-neutral-300 leading-relaxed">{solution}</p>
          </div>
        </motion.section>

        {/* Features */}
        <motion.section {...fadeUp}>
          <p className="text-cyan-400 text-xs font-mono uppercase tracking-widest mb-4">
            {featuresLabel}
          </p>
          <ul className="space-y-3">
            {features.map((feature, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                <span className="text-neutral-300 leading-relaxed">{feature}</span>
              </li>
            ))}
          </ul>
        </motion.section>

        {/* Tech Stack */}
        <motion.section {...fadeUp}>
          <p className="text-cyan-400 text-xs font-mono uppercase tracking-widest mb-4">
            {techStackLabel}
          </p>
          <div className="flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="bg-neutral-800 text-neutral-300 text-xs px-3 py-1.5 rounded-md border border-neutral-700"
              >
                {tech}
              </span>
            ))}
          </div>
        </motion.section>

        {/* Metrics */}
        {project.metrics && project.metrics.length > 0 && (
          <motion.section {...fadeUp}>
            <p className="text-cyan-400 text-xs font-mono uppercase tracking-widest mb-6">
              {metricsLabel}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {project.metrics.map((metric) => (
                <div key={metric.label} className="text-center">
                  <div className="text-4xl font-black text-cyan-400 mb-1">
                    {metric.value}
                  </div>
                  <div className="text-neutral-500 text-sm">
                    {isKo ? metric.labelKo : metric.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </div>

      {/* Bottom nav */}
      <div className="border-t border-neutral-800">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 text-neutral-400 hover:text-neutral-200 transition-colors text-sm"
          >
            <FiArrowLeft size={14} />
            {backLabel}
          </Link>
        </div>
      </div>
    </div>
  )
}
