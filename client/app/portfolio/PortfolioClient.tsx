'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
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

const AIInterviewer = dynamic(() => import('../../components/AIInterviewer'), { ssr: false })

export default function PortfolioClient() {
  return (
    <main className="portfolio-page min-h-screen bg-neutral-950 text-neutral-100 antialiased">
      <PortfolioScrollProgress />
      <Header />
      <Hero />
      <StatsCounter />

      <SectionWrapper id="about" className="relative border-b border-neutral-800 bg-neutral-950">
        <About />
      </SectionWrapper>

      <SectionWrapper id="skills" className="relative border-b border-neutral-800 bg-neutral-900">
        <Skills />
      </SectionWrapper>

      <SectionWrapper className="relative border-b border-neutral-800 bg-neutral-900">
        <CareerTimeline />
      </SectionWrapper>

      <SectionWrapper id="projects" fadeOnly className="relative border-b border-neutral-800 bg-neutral-950">
        <Projects />
      </SectionWrapper>

      <SectionWrapper id="ai-interviewer" className="relative border-b border-neutral-800 bg-neutral-950">
        <AIInterviewer />
      </SectionWrapper>

      <SectionWrapper id="contact" className="relative border-b border-neutral-800 bg-neutral-900">
        <Contact />
      </SectionWrapper>

      {/* 이력서 링크 */}
      <div className="flex justify-center py-8 border-b border-neutral-800 bg-neutral-950">
        <Link
          href="/resume"
          className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-200 border border-neutral-800 hover:border-neutral-600 px-5 py-2.5 rounded-full text-sm font-mono tracking-wide transition-all"
        >
          📄 이력서 보기
        </Link>
      </div>

      <Footer />
    </main>
  )
}
