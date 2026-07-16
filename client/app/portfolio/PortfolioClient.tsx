'use client'

import dynamic from 'next/dynamic'
import Header from '../../components/Header'
import Hero from '../../components/Hero'
import About from '../../components/About'
import Projects from '../../components/Projects'
import Skills from '../../components/Skills'
import Contact from '../../components/Contact'
import Footer from '../../components/Footer'
import PortfolioScrollProgress from '../../components/portfolio/PortfolioScrollProgress'
import StatsCounter from '../../components/portfolio/StatsCounter'
import CareerTimeline from '../../components/portfolio/CareerTimeline'
import SectionWrapper from '../../components/SectionWrapper'
import SpaceAtmosphere from '../../components/SpaceAtmosphere'

// Without `loading`, this section renders nothing at all while the chunk
// is still in flight (same failure mode fixed for SkillSphere) — a
// same-sized placeholder keeps the section from going fully blank on a
// cold load.
const AIInterviewer = dynamic(() => import('../../components/AIInterviewer'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[420px] w-full max-w-3xl mx-auto items-center justify-center px-4 py-24">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-neutral-700 border-t-neutral-400" />
    </div>
  ),
})

export default function PortfolioClient() {
  return (
    <SpaceAtmosphere className="portfolio-page min-h-screen text-neutral-100 antialiased">
      <main>
        <PortfolioScrollProgress />
        <Header />
        <Hero />
        <StatsCounter />

        <SectionWrapper id="about" className="relative border-b border-neutral-800 dark:border-white/[0.08] bg-neutral-950 dark:bg-transparent">
          <About />
        </SectionWrapper>

        <SectionWrapper id="skills" className="relative border-b border-neutral-800 dark:border-white/[0.08] bg-neutral-900 dark:bg-white/[0.02]">
          <Skills />
        </SectionWrapper>

        <SectionWrapper className="relative border-b border-neutral-800 dark:border-white/[0.08] bg-neutral-900 dark:bg-white/[0.02]">
          <CareerTimeline />
        </SectionWrapper>

        <SectionWrapper id="projects" fadeOnly className="relative border-b border-neutral-800 dark:border-white/[0.08] bg-neutral-950 dark:bg-transparent">
          <Projects />
        </SectionWrapper>

        <SectionWrapper id="ai-interviewer" className="relative border-b border-neutral-800 dark:border-white/[0.08] bg-neutral-950 dark:bg-transparent">
          <AIInterviewer />
        </SectionWrapper>

        <SectionWrapper id="contact" className="relative border-b border-neutral-800 dark:border-white/[0.08] bg-neutral-900 dark:bg-white/[0.02]">
          <Contact />
        </SectionWrapper>

        <Footer />
      </main>
    </SpaceAtmosphere>
  )
}
