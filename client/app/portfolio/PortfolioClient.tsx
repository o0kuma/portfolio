'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Header from '../../components/Header'
import Hero from '../../components/Hero'
import About from '../../components/About'
import Projects from '../../components/Projects'
import Skills from '../../components/Skills'
import Contact from '../../components/Contact'
import RecentPostsSection from '../../components/RecentPostsSection'
import Footer from '../../components/Footer'

export default function PortfolioClient() {
  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="portfolio-page min-h-screen bg-neutral-950 text-neutral-100 antialiased"
    >
      <Header />
      <Hero />
      <About />
      <Skills />
      <Projects />
      <RecentPostsSection />
      <Contact />
      <Footer />
    </motion.main>
  )
}
