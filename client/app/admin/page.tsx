'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FiFileText,
  FiFolderOpen,
  FiMail,
  FiAlertCircle,
  FiCpu,
  FiArrowRight,
} from 'react-icons/fi'
import { useLanguage } from '@/lib/LanguageContext'

interface SiteStats {
  totalPosts: number
  totalProjects: number
  totalContacts: number
  pendingContacts: number
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

export default function AdminDashboardPage() {
  const { t } = useLanguage()
  const [stats, setStats] = useState<SiteStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [adminToken, setAdminToken] = useState('')
  const [showTokenInput, setShowTokenInput] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('admin_token') ?? ''
    setAdminToken(saved)
    fetchStats(saved)
  }, [])

  const fetchStats = async (token: string) => {
    try {
      setIsLoading(true)
      setError('')
      const res = await fetch('/api/admin/stats', {
        cache: 'no-store',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || t.adminDashboard.errorLoad)
      setStats(data.stats as SiteStats)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.adminDashboard.errorLoad)
    } finally {
      setIsLoading(false)
    }
  }

  const saveToken = (token: string) => {
    setAdminToken(token)
    localStorage.setItem('admin_token', token)
    setShowTokenInput(false)
    fetchStats(token)
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
            onClick={() => setShowTokenInput((v) => !v)}
            className="text-sm px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            {adminToken ? t.adminPosts.tokenChange : t.adminPosts.tokenSet}
          </button>
        </div>

        {/* Token Panel */}
        {showTokenInput && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
            <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-2 font-medium">
              {t.adminPosts.tokenPanelLabel}
            </p>
            <div className="flex gap-2">
              <input
                id="dashboard-token-input"
                type="password"
                defaultValue={adminToken}
                placeholder={t.adminPosts.tokenPlaceholder}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter')
                    saveToken((e.target as HTMLInputElement).value)
                }}
              />
              <button
                onClick={() => {
                  const el = document.getElementById(
                    'dashboard-token-input',
                  ) as HTMLInputElement | null
                  saveToken(el?.value ?? '')
                }}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium"
              >
                {t.adminPosts.save}
              </button>
            </div>
          </div>
        )}

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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                label={t.adminDashboard.statPosts}
                value={stats?.totalPosts ?? 0}
                icon={<FiFileText className="w-8 h-8" />}
                color="text-blue-500"
              />
              <StatCard
                label={t.adminDashboard.statProjects}
                value={stats?.totalProjects ?? 0}
                icon={<FiFolderOpen className="w-8 h-8" />}
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
                {t.adminDashboard.aiUsagePlaceholder}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t.adminDashboard.aiUsageNote}
              </p>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section>
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
          </div>
        </section>
      </div>
    </div>
  )
}
