'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { FiTrash2, FiSearch } from 'react-icons/fi'
import { toast } from '@/lib/toast'
import { useLanguage } from '@/lib/LanguageContext'
import { interpolate } from '@/lib/i18n'

interface Post {
  id: string
  title: string
  author: string
  category: string
  status: string
  created_at: string
}

interface PostsResponse {
  posts: Post[]
  total: number
  totalPages: number
  currentPage: number
}

export default function AdminPostsPage() {
  const { t } = useLanguage()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [adminToken, setAdminToken] = useState('')
  const [showTokenInput, setShowTokenInput] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const fetchPosts = useCallback(async (token: string) => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/posts?limit=50', { cache: 'no-store' })
      const data: PostsResponse = await res.json()
      setPosts(data.posts ?? [])
    } catch (err: unknown) {
      console.error('posts fetch error', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('admin_token') ?? ''
    setAdminToken(saved)
    fetchPosts(saved)
  }, [fetchPosts])

  const saveToken = (token: string) => {
    setAdminToken(token)
    localStorage.setItem('admin_token', token)
    setShowTokenInput(false)
  }

  const filteredPosts = useMemo(
    () =>
      posts.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [posts, searchQuery],
  )

  const allFilteredSelected =
    filteredPosts.length > 0 &&
    filteredPosts.every((p) => selectedIds.has(p.id))

  const toggleAll = () => {
    if (allFilteredSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        filteredPosts.forEach((p) => next.delete(p.id))
        return next
      })
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        filteredPosts.forEach((p) => next.add(p.id))
        return next
      })
    }
  }

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const deletePost = async (id: string, title: string) => {
    if (!confirm(interpolate(t.adminPosts.deleteConfirm, { title }))) return
    if (!adminToken.trim()) {
      toast.warning(t.adminPosts.noToken)
      return
    }
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      })
      const result = await res.json()
      if (result.message !== undefined || res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== id))
        setSelectedIds((prev) => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      } else {
        toast.error(t.adminPosts.deleteFailed)
      }
    } catch {
      toast.error(t.adminPosts.deleteFailed)
    }
  }

  const bulkDelete = async () => {
    const ids = Array.from(selectedIds).filter((id) =>
      filteredPosts.some((p) => p.id === id),
    )
    if (ids.length === 0) return
    if (
      !confirm(
        interpolate(t.adminPosts.bulkDeleteConfirm, { count: ids.length }),
      )
    )
      return
    if (!adminToken.trim()) {
      toast.warning(t.adminPosts.noToken)
      return
    }
    const results = await Promise.allSettled(
      ids.map((id) =>
        fetch(`/api/posts/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
      ),
    )
    const succeeded = ids.filter((_, i) => results[i].status === 'fulfilled')
    setPosts((prev) => prev.filter((p) => !succeeded.includes(p.id)))
    setSelectedIds((prev) => {
      const next = new Set(prev)
      succeeded.forEach((id) => next.delete(id))
      return next
    })
    const failed = ids.length - succeeded.length
    if (failed > 0) toast.error(t.adminPosts.deleteFailed)
  }

  const selectedInView = filteredPosts.filter((p) =>
    selectedIds.has(p.id),
  ).length

  return (
    <div className="min-h-screen bg-canvas px-4 py-8 text-textPrimary">
      <div className="page-shell max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t.adminPosts.pageTitle}
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
                id="posts-token-input"
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
                    'posts-token-input',
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

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.adminPosts.searchPlaceholder}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {selectedInView > 0 && (
            <button
              onClick={bulkDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
            >
              <FiTrash2 className="w-4 h-4" />
              {t.adminPosts.bulkDelete} ({selectedInView})
            </button>
          )}
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center gap-3 py-16 text-gray-500 justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            <span>{t.adminPosts.loading}</span>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            {t.adminPosts.empty}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      onChange={toggleAll}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  {[
                    t.adminPosts.colTitle,
                    t.adminPosts.colAuthor,
                    t.adminPosts.colCategory,
                    t.adminPosts.colStatus,
                    t.adminPosts.colDate,
                    t.adminPosts.colAction,
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPosts.map((post) => (
                  <tr
                    key={post.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      selectedIds.has(post.id)
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(post.id)}
                        onChange={() => toggleOne(post.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white max-w-xs truncate">
                      {post.title}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {post.author}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {post.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          post.status === 'published'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {new Date(post.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => deletePost(post.id, post.title)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="삭제"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
