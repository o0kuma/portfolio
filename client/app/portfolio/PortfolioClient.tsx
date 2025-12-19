'use client'

import { useState, useEffect } from 'react'
import Header from '../../components/Header'
import Hero from '../../components/Hero'
import About from '../../components/About'
import Projects from '../../components/Projects'
import Skills from '../../components/Skills'
import Posts from '../../components/Posts'
import Contact from '../../components/Contact'
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 relative overflow-hidden">
        {/* 배경 애니메이션 */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400/20 dark:bg-blue-400/10 rounded-full animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-32 h-32 bg-purple-400/15 dark:bg-purple-400/8 rounded-full animate-bounce"></div>
          <div className="absolute bottom-1/4 left-1/3 w-48 h-48 bg-indigo-400/25 dark:bg-indigo-400/12 rounded-full animate-ping"></div>
        </div>
        
        {/* 메인 로딩 컨텐츠 */}
        <div className="text-center text-slate-800 dark:text-white relative z-10">
          {/* 로고/아이콘 */}
          <div className="mb-8">
            <div className="relative">
              <div className="w-24 h-24 mx-auto mb-4 relative">
                {/* 외부 원 */}
                <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-400/30 rounded-full"></div>
                {/* 회전하는 원 */}
                <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 border-r-blue-600 dark:border-r-blue-400 rounded-full animate-spin"></div>
                {/* 내부 원 */}
                <div className="absolute inset-2 border-2 border-blue-300 dark:border-blue-400/50 rounded-full"></div>
                {/* 중앙 점 */}
                <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
              </div>
            </div>
          </div>
          
          {/* 텍스트 애니메이션 */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-pulse">
              Okuma
            </h1>
            <h2 className="text-xl md:text-2xl font-semibold text-slate-700 dark:text-slate-300">
              포트폴리오
            </h2>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-4">
              로딩 중...
            </p>
          </div>
          
          {/* 프로그레스 바 */}
          <div className="mt-8 w-64 mx-auto">
            <div className="w-full bg-slate-300 dark:bg-slate-600 rounded-full h-1">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-1 rounded-full animate-pulse" style={{width: '100%'}}></div>
            </div>
          </div>
        </div>
        
        {/* 하단 파티클 효과 */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-200/20 dark:from-slate-800/20 to-transparent"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <About />
      <Skills />
      <Projects />
      <Posts />
      <Contact />
      <Footer />
    </main>
  )
}

