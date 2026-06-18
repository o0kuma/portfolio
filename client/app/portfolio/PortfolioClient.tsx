'use client'

import Header from '../../components/Header'
import Hero from '../../components/Hero'
import About from '../../components/About'
import Projects from '../../components/Projects'
import Skills from '../../components/Skills'
import Contact from '../../components/Contact'
import RecentPostsSection from '../../components/RecentPostsSection'
import Footer from '../../components/Footer'
import PortfolioScrollProgress from '../../components/portfolio/PortfolioScrollProgress'
import StatsCounter from '../../components/portfolio/StatsCounter'
import CareerTimeline from '../../components/portfolio/CareerTimeline'
import SectionWrapper from '../../components/SectionWrapper'

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

      <SectionWrapper className="relative border-b border-neutral-800 bg-neutral-950">
        <RecentPostsSection />
      </SectionWrapper>

      <SectionWrapper id="contact" className="relative border-b border-neutral-800 bg-neutral-900">
        <Contact />
      </SectionWrapper>

      <Footer />
    </main>
  )
}
