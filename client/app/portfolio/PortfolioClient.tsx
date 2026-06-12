'use client'

import { useEffect } from 'react'
import Header from '../../components/Header'
import Hero from '../../components/Hero'
import About from '../../components/About'
import Projects from '../../components/Projects'
import Skills from '../../components/Skills'
import Contact from '../../components/Contact'
import RecentPostsSection from '../../components/RecentPostsSection'
import Footer from '../../components/Footer'
import PortfolioScrollProgress from '../../components/portfolio/PortfolioScrollProgress'
import SectionWrapper from '../../components/SectionWrapper'

export default function PortfolioClient() {
  useEffect(() => {
    document.documentElement.classList.remove('dark')
    return () => {
      const saved = localStorage.getItem('theme')
      if (saved === 'dark' || !saved) document.documentElement.classList.add('dark')
    }
  }, [])

  return (
    <main className="portfolio-page min-h-screen bg-[#faf9f7] text-[#3d3a36] antialiased">
      <PortfolioScrollProgress />
      <Header />
      <Hero />

      <SectionWrapper id="about" className="relative border-b border-neutral-800 bg-neutral-950">
        <About />
      </SectionWrapper>

      <SectionWrapper id="skills" className="relative border-b border-neutral-800 bg-neutral-900">
        <Skills />
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
