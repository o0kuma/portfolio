'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiFileText,
  FiFolder,
  FiMessageSquare,
  FiSettings,
  FiTrash2,
  FiX,
} from 'react-icons/fi'
import { adminAuthHeaders } from '@/lib/admin-token'
import { toast } from '@/lib/toast'

interface AdminPanelProps {
  isOpen: boolean
  onClose: () => void
}

interface Stats {
  totalProjects: number
  totalPosts: number
  totalContacts: number
  pendingContacts: number
}

interface AdminPost {
  id: string
  title: string
  category: string
  created_at: string
}

interface AdminContact {
  id: string
  name: string
  email: string
  subject: string
  status: string
  created_at: string
}

export default function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState<Stats>({
    totalProjects: 0,
    totalPosts: 0,
    totalContacts: 0,
    pendingContacts: 0,
  })
  const [posts, setPosts] = useState<AdminPost[]>([])
  const [contacts, setContacts] = useState<AdminContact[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const tabs = [
    { id: 'dashboard', name: '대시보드', icon: FiSettings },
    { id: 'posts', name: '게시글', icon: FiFileText },
    { id: 'contacts', name: '연락처', icon: FiMessageSquare },
  ]

  const fetchStats = useCallback(async () => {
    const res = await fetch('/api/admin/stats', { headers: adminAuthHeaders() })
    const data = await res.json()
    if (res.ok && data.success) {
      setStats(data.stats)
    }
  }, [])

  const fetchPosts = useCallback(async () => {
    const res = await fetch('/api/posts?limit=20')
    const data = await res.json()
    if (res.ok && Array.isArray(data.posts)) {
      setPosts(
        data.posts.map((p: Record<string, unknown>) => ({
          id: String(p.id),
          title: String(p.title),
          category: String(p.category),
          created_at: String(p.created_at ?? ''),
        })),
      )
    }
  }, [])

  const fetchContacts = useCallback(async () => {
    const res = await fetch('/api/contact', { headers: adminAuthHeaders() })
    const data = await res.json()
    if (res.ok && data.success) {
      setContacts(data.contacts)
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return
    setIsLoading(true)
    const load = async () => {
      try {
        await fetchStats()
        if (activeTab === 'posts') await fetchPosts()
        if (activeTab === 'contacts') await fetchContacts()
      } catch (e) {
        console.error('AdminPanel load error:', e)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [isOpen, activeTab, fetchStats, fetchPosts, fetchContacts])

  const handleDeletePost = async (id: string) => {
    if (!confirm('이 게시글을 삭제할까요?')) return
    const res = await fetch(`/api/posts/${id}`, {
      method: 'DELETE',
      headers: adminAuthHeaders(),
    })
    if (res.ok) {
      toast.success('삭제되었습니다.')
      fetchPosts()
      fetchStats()
    } else {
      toast.error('삭제 실패')
    }
  }

  const handleContactStatus = async (id: string, status: string) => {
    const res = await fetch('/api/contact', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...adminAuthHeaders() },
      body: JSON.stringify({ id, status }),
    })
    if (res.ok) {
      fetchContacts()
      fetchStats()
    } else {
      toast.error('상태 변경 실패')
    }
  }

  const DashboardTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[
        { label: '게시글', value: stats.totalPosts, icon: FiFileText },
        { label: '프로젝트', value: stats.totalProjects, icon: FiFolder },
        { label: '연락처', value: stats.totalContacts, icon: FiMessageSquare },
        { label: '미처리 연락처', value: stats.pendingContacts, icon: FiMessageSquare },
      ].map((card) => (
        <div
          key={card.label}
          className="bg-white dark:bg-dark-700 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-dark-600"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            </div>
            <card.icon className="text-primary-600 dark:text-primary-400" size={28} />
          </div>
        </div>
      ))}
    </div>
  )

  const PostsTab = () => (
    <ul className="divide-y divide-gray-200 dark:divide-dark-600">
      {posts.map((post) => (
        <li key={post.id} className="py-3 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="font-medium text-gray-900 dark:text-white truncate">{post.title}</p>
            <p className="text-xs text-gray-500">
              {post.category} · {new Date(post.created_at).toLocaleDateString('ko-KR')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleDeletePost(post.id)}
            className="text-red-500 hover:text-red-700 shrink-0"
            title="삭제"
          >
            <FiTrash2 size={18} />
          </button>
        </li>
      ))}
      {posts.length === 0 && (
        <p className="text-center text-gray-500 py-8">게시글이 없거나 DB에 연결되지 않았습니다.</p>
      )}
    </ul>
  )

  const ContactsTab = () => (
    <ul className="divide-y divide-gray-200 dark:divide-dark-600">
      {contacts.map((c) => (
        <li key={c.id} className="py-3">
          <p className="font-medium text-gray-900 dark:text-white">{c.subject}</p>
          <p className="text-sm text-gray-500">
            {c.name} · {c.email}
          </p>
          <div className="mt-2 flex gap-2">
            {['unread', 'read', 'replied'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => handleContactStatus(c.id, status)}
                className={`px-2 py-1 text-xs rounded ${
                  c.status === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-dark-600 text-gray-600 dark:text-gray-300'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </li>
      ))}
      {contacts.length === 0 && (
        <p className="text-center text-gray-500 py-8">연락처가 없거나 인증에 실패했습니다.</p>
      )}
    </ul>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab />
      case 'posts':
        return <PostsTab />
      case 'contacts':
        return <ContactsTab />
      default:
        return <DashboardTab />
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-y-auto"
        >
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 sm:p-0">
            <motion.div
              className="fixed inset-0 bg-gray-500 bg-opacity-75"
              onClick={onClose}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative inline-block w-full max-w-4xl bg-white dark:bg-dark-800 rounded-lg shadow-xl"
            >
              <div className="bg-primary-600 text-white px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold">관리자 패널</h2>
                <button type="button" onClick={onClose} className="hover:opacity-80">
                  <FiX size={24} />
                </button>
              </div>

              <nav className="flex border-b border-gray-200 dark:border-dark-600 px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-3 text-sm font-medium border-b-2 flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500'
                    }`}
                  >
                    <tab.icon size={16} />
                    {tab.name}
                  </button>
                ))}
              </nav>

              <div className="px-6 py-6 max-h-[28rem] overflow-y-auto">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin h-8 w-8 border-b-2 border-primary-600 rounded-full" />
                  </div>
                ) : (
                  renderTabContent()
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
