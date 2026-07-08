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

const AIInterviewer = dynamic(() => import('../../components/AIInterviewer'), { ssr: false })

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
