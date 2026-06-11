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

export default function PortfolioClient() {
  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  return (
    <main className="portfolio-page min-h-screen bg-neutral-950 text-neutral-100 antialiased">
      <PortfolioScrollProgress />
      <Header />
      <Hero />
      <About />
      <Skills />
      <Projects />
      <RecentPostsSection />
      <Contact />
      <Footer />
    </main>
  )
}
