'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FiFileText,
  FiFolder,
  FiMail,
  FiAlertCircle,
  FiCpu,
  FiArrowRight,
  FiLogOut,
  FiUsers,
  FiCalendar,
  FiExternalLink,
} from 'react-icons/fi'
import { useLanguage } from '@/lib/LanguageContext'

interface GameStats {
  tetrisBestScore: number
  surviveBestWave: number
  towerBestWave: number
}

interface SiteStats {
  totalPosts: number
  totalProjects: number
  totalContacts: number
  pendingContacts: number
  postsThisWeek: number
  totalVisitors: number
  totalRestaurants: number
  gameStats: GameStats
}

interface StatCardProps {
  label: string
  value: number | string
  icon: React.ReactNode
  color: string
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <div className="card rounded-xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{label}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        </div>
        <div className={`${color}`}>{icon}</div>
      </div>
    </div>
  )
}

interface TopPost {
  id: number
  title: string
  views: number
  likes: number
}

export default function AdminDashboardPage() {
  const { t } = useLanguage()
  const [stats, setStats] = useState<SiteStats | null>(null)
  const [aiStats, setAiStats] = useState<{ totalRequests: number; requestsToday: number } | null>(null)
  const [topPosts, setTopPosts] = useState<TopPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  useEffect(() => {
    fetchStats()
    fetchAiStats()
  }, [])

  const fetchAiStats = async () => {
    try {
      const res = await fetch('/api/admin/ai-stats', { cache: 'no-store' })
      const data = await res.json()
      if (data.success) setAiStats(data.stats)
    } catch {}
  }

  const fetchTopPosts = async () => {
    try {
      const res = await fetch('/api/admin/top-posts', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        if (data.posts) setTopPosts(data.posts)
      }
    } catch {}
  }

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      setError('')
      const res = await fetch('/api/admin/stats', { cache: 'no-store' })
      if (res.status === 401) {
        setIsLoggedIn(false)
        return
      }
      const data = await res.json()
      if (!data.success) throw new Error(data.error || t.adminDashboard.errorLoad)
      setIsLoggedIn(true)
      setStats(data.stats as SiteStats)
      fetchTopPosts()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.adminDashboard.errorLoad)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) {
        setLoginError('Invalid password')
        return
      }
      setIsLoggedIn(true)
      setPassword('')
      fetchStats()
    } catch {
      setLoginError('Login failed')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    setIsLoggedIn(false)
    setStats(null)
  }

  if (!isLoggedIn && !isLoading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            {t.adminDashboard.pageTitle}
          </h1>
          <form onSubmit={handleLogin} className="card rounded-xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
                autoFocus
              />
            </div>
            {loginError && (
              <p className="text-red-600 dark:text-red-400 text-sm">{loginError}</p>
            )}
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition"
            >
              {loginLoading ? 'Logging in…' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-canvas px-4 py-8 text-textPrimary">
      <div className="page-shell max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t.adminDashboard.pageTitle}
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <FiLogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Analytics Overview */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            {t.adminDashboard.analyticsTitle}
          </h2>

          {isLoading ? (
            <div className="flex items-center gap-3 py-8 text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
              <span>{t.adminDashboard.loading}</span>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
              <StatCard
                label={t.adminDashboard.statPosts}
                value={stats?.totalPosts ?? 0}
                icon={<FiFileText className="w-8 h-8" />}
                color="text-blue-500"
              />
              <StatCard
                label={t.adminDashboard.statPostsThisWeek}
                value={stats?.postsThisWeek ?? 0}
                icon={<FiCalendar className="w-8 h-8" />}
                color="text-cyan-500"
              />
              <StatCard
                label={t.adminDashboard.statProjects}
                value={stats?.totalProjects ?? 0}
                icon={<FiFolder className="w-8 h-8" />}
                color="text-purple-500"
              />
              <StatCard
                label={t.adminDashboard.statContacts}
                value={stats?.totalContacts ?? 0}
                icon={<FiMail className="w-8 h-8" />}
                color="text-green-500"
              />
              <StatCard
                label={t.adminDashboard.statPendingContacts}
                value={stats?.pendingContacts ?? 0}
                icon={<FiAlertCircle className="w-8 h-8" />}
                color="text-orange-500"
              />
              <StatCard
                label={t.adminDashboard.statVisitors}
                value={stats?.totalVisitors ?? 0}
                icon={<FiUsers className="w-8 h-8" />}
                color="text-pink-500"
              />
              <StatCard
                label="맛집 등록수"
                value={stats?.totalRestaurants ?? 0}
                icon={<span className="text-3xl leading-none">🍽️</span>}
                color="text-orange-400"
              />
            </div>
          )}
        </section>

        {/* AI Usage Monitoring */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            {t.adminDashboard.aiUsageTitle}
          </h2>
          <div className="card rounded-xl p-6 flex items-center gap-4">
            <FiCpu className="w-10 h-10 text-indigo-400 flex-shrink-0" />
            <div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {aiStats?.totalRequests ?? '–'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t.adminDashboard.aiUsageNote} (오늘: {aiStats?.requestsToday ?? '–'})
              </p>
            </div>
          </div>
        </section>

        {/* Game Stats */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            게임 전적
          </h2>
          <div className="card rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🎮</span>
              <span className="font-semibold text-gray-900 dark:text-white text-lg">게임 전적</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">테트리스 최고점</p>
                <p className="text-2xl font-bold text-blue-500">{stats?.gameStats?.tetrisBestScore ?? 0}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">서바이브 최고 레벨</p>
                <p className="text-2xl font-bold text-green-500">{stats?.gameStats?.surviveBestWave ?? 0}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">타워 디펜스 최고 웨이브</p>
                <p className="text-2xl font-bold text-purple-500">{stats?.gameStats?.towerBestWave ?? 0}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Top Posts */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            인기 글 TOP 5
          </h2>
          <div className="card rounded-xl p-6">
            {topPosts.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">데이터 없음</p>
            ) : (
              <ol className="space-y-3">
                {topPosts.map((post, idx) => (
                  <li key={post.id} className="flex items-center gap-4">
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-neutral-800 text-sm font-bold text-neutral-300">
                      {idx + 1}
                    </span>
                    <span className="flex-1 truncate text-sm text-gray-800 dark:text-gray-100">
                      {post.title}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-blue-400">
                      <FiFileText className="h-3.5 w-3.5" />
                      {post.views.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>

        {/* Quick Links — Admin */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            {t.adminDashboard.quickLinksTitle}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/admin/posts"
              className="card rounded-xl p-5 flex items-center justify-between hover:ring-2 hover:ring-blue-400 transition group"
            >
              <div className="flex items-center gap-3">
                <FiFileText className="w-6 h-6 text-blue-500" />
                <span className="font-medium text-gray-900 dark:text-white">
                  {t.adminDashboard.linkPosts}
                </span>
              </div>
              <FiArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition" />
            </Link>
            <Link
              href="/admin/ads"
              className="card rounded-xl p-5 flex items-center justify-between hover:ring-2 hover:ring-blue-400 transition group"
            >
              <div className="flex items-center gap-3">
                <FiMail className="w-6 h-6 text-yellow-500" />
                <span className="font-medium text-gray-900 dark:text-white">
                  {t.adminDashboard.linkAds}
                </span>
              </div>
              <FiArrowRight className="w-5 h-5 text-gray-400 group-hover:text-yellow-500 transition" />
            </Link>
            <Link
              href="/admin/visitors"
              className="card rounded-xl p-5 flex items-center justify-between hover:ring-2 hover:ring-pink-400 transition group"
            >
              <div className="flex items-center gap-3">
                <FiUsers className="w-6 h-6 text-pink-500" />
                <span className="font-medium text-gray-900 dark:text-white">방문자 현황</span>
              </div>
              <FiArrowRight className="w-5 h-5 text-gray-400 group-hover:text-pink-500 transition" />
            </Link>
          </div>
        </section>

        {/* Site Quick Links */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            {t.adminDashboard.siteLinksTitle}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { href: '/posts', label: t.adminDashboard.linkSitePosts, color: 'text-blue-400' },
              { href: '/food', label: t.adminDashboard.linkSiteFood, color: 'text-orange-400' },
              { href: '/games', label: t.adminDashboard.linkSiteGames, color: 'text-green-400' },
              { href: '/portfolio', label: t.adminDashboard.linkSitePortfolio, color: 'text-purple-400' },
            ].map(({ href, label, color }) => (
              <Link
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="card rounded-xl p-4 flex items-center justify-between hover:ring-2 hover:ring-gray-400 transition group"
              >
                <span className={`font-medium text-sm ${color}`}>{label}</span>
                <FiExternalLink className="w-4 h-4 text-gray-500 group-hover:text-gray-300 transition" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
