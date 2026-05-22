'use client'

import { useState, useEffect } from 'react'
import Header from '../../components/Header'
import Hero from '../../components/Hero'
import About from '../../components/About'
import Projects from '../../components/Projects'
import Skills from '../../components/Skills'
import Contact from '../../components/Contact'
import RecentPostsSection from '../../components/RecentPostsSection'
import Footer from '../../components/Footer'

export default function PortfolioClient() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 페이지 로딩 시뮬레이션 (멋있는 로딩 효과를 위해 시간 연장)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2500)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg,#0f172a 0%,#0c4a6e 55%,#06b6d4 100%)' }}
      >
        {/* Floating bubbles */}
        {[
          { w: 60, l: '10%', t: '20%', d: '3s' },
          { w: 30, l: '80%', t: '15%', d: '2s' },
          { w: 80, l: '70%', t: '60%', d: '4s' },
          { w: 20, l: '30%', t: '70%', d: '2.5s' },
          { w: 50, l: '50%', t: '10%', d: '3.5s' },
        ].map((b, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-white/20 bg-white/5 animate-pulse"
            style={{ width: b.w, height: b.w, left: b.l, top: b.t, animationDuration: b.d }}
          />
        ))}

        {/* Wave at bottom */}
        <div className="absolute bottom-0 inset-x-0 pointer-events-none">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-12 opacity-20">
            <path d="M0,30 C360,60 720,0 1080,30 C1260,45 1380,15 1440,30 L1440,60 L0,60 Z" fill="white" />
          </svg>
        </div>

        {/* Loading content */}
        <div className="relative z-10 text-center">
          {/* Ocean spinner */}
          <div className="w-24 h-24 mx-auto mb-8 relative">
            <div className="absolute inset-0 rounded-full border-4 border-cyan-400/20" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400 border-r-cyan-300 animate-spin" />
            <div className="absolute inset-3 rounded-full border-2 border-cyan-400/20" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
          </div>

          <h1
            className="text-5xl md:text-6xl font-black mb-3"
            style={{
              background: 'linear-gradient(90deg,#67e8f9,#22d3ee,#34d399)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            kuuuma
          </h1>
          <p className="text-white/50 text-base mb-8">포트폴리오를 준비하는 중...</p>

          {/* Wave progress bar */}
          <div className="w-56 mx-auto h-1 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full animate-pulse"
              style={{
                background: 'linear-gradient(90deg,#06b6d4,#22d3ee,#67e8f9)',
                width: '100%',
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-canvas text-textPrimary">
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

