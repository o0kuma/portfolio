'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/LanguageContext'
import { portfolioViewport, staggerContainer, staggerItem } from '@/lib/portfolioMotion'

function useCountUp(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime: number | null = null
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
      else setCount(target)
    }
    requestAnimationFrame(step)
  }, [target, duration, start])
  return count
}

type StatItem = {
  value: number
  suffix: string
  label: string
  description: string
}

function StatCard({ value, suffix, label, description, animate }: StatItem & { animate: boolean }) {
  const count = useCountUp(value, 1600, animate)
  return (
    <div className="relative p-8 border border-neutral-800 bg-neutral-950/50 hover:border-neutral-700 transition-colors group">
      <div className="mb-4">
        <span className="text-5xl md:text-6xl font-black text-neutral-50 tabular-nums">
          {count}
        </span>
        <span className="text-2xl font-bold text-neutral-400 ml-1">{suffix}</span>
      </div>
      <p className="text-sm font-semibold text-neutral-300 mb-1">{label}</p>
      <p className="text-xs text-neutral-600 font-mono">{description}</p>
      <div className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-neutral-500 to-transparent transition-all duration-500" />
    </div>
  )
}

export default function StatsCounter() {
  const { t } = useLanguage()
  const [inView, setInView] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const years = new Date().getFullYear() - 2019

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true) },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const stats: StatItem[] = [
    { value: years, suffix: '+', label: t.about?.statYearsSuffix ?? '년 경력', description: '2019년부터 현재까지' },
    { value: 12, suffix: '+', label: t.about?.statProjectsSuffix ?? '프로젝트', description: '금융 · 트레이딩 · SaaS · 게임' },
    { value: 8, suffix: '+', label: '기술 스택', description: 'Frontend · Backend · DevOps' },
    { value: 100, suffix: '%', label: '납기 준수', description: '모든 프로젝트 일정 내 완료' },
  ]

  return (
    <motion.div
      ref={ref}
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={portfolioViewport}
      className="py-24 border-b border-neutral-800"
    >
      <div className="container-custom">
        <motion.p
          variants={staggerItem}
          className="text-xs font-mono text-neutral-600 tracking-[0.2em] uppercase mb-12"
        >
          — Numbers
        </motion.p>
        <div className="grid grid-cols-2 md:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div key={i} variants={staggerItem}>
              <StatCard {...s} animate={inView} />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
