'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiSave, FiTag } from 'react-icons/fi'
import { getApiBaseUrl } from '@/lib/api-base-url'
import { adminAuthHeaders } from '@/lib/admin-token'
import { useLanguage } from '@/lib/LanguageContext'

const API_BASE_URL = getApiBaseUrl()
const DRAFT_KEY = 'post-draft-anonymous'

interface EditPost {
  _id: string
  title: string
  content: string
  author: string
  category: string
  tags: string[]
  featured: boolean
  series?: string
}

interface CreatePostFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editPost?: EditPost | null
}

export default function CreatePostForm({ isOpen, onClose, onSuccess, editPost }: CreatePostFormProps) {
  const { t } = useLanguage()
  const isEditMode = !!editPost

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    category: 'tech',
    tags: [] as string[],
    featured: false,
    series: '',
  })
  const [tagInput, setTagInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saved'>('idle')
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (editPost) {
      setFormData({
        title: editPost.title,
        content: editPost.content,
        author: editPost.author,
        category: editPost.category,
        tags: editPost.tags,
        featured: editPost.featured,
        series: editPost.series ?? '',
      })
    } else {
      const blank = { title: '', content: '', author: '', category: 'tech', tags: [] as string[], featured: false, series: '' }
      setFormData(blank)
      // Check for saved draft only in create mode when modal opens
      if (isOpen) {
        try {
          const saved = localStorage.getItem(DRAFT_KEY)
          if (saved) {
            const draft = JSON.parse(saved)
            if (draft && (draft.title || draft.content)) {
              if (confirm('저장된 임시글이 있습니다. 복원하시겠습니까?')) {
                setFormData((prev) => ({ ...prev, ...draft }))
              } else {
                localStorage.removeItem(DRAFT_KEY)
              }
            }
          }
        } catch {
          // ignore localStorage errors
        }
      }
    }
    setTagInput('')
    setError('')
    setAutosaveStatus('idle')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editPost, isOpen])

  // Debounced autosave to localStorage (create mode only)
  useEffect(() => {
    if (isEditMode || !isOpen) return
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    autosaveTimer.current = setTimeout(() => {
      try {
        if (formData.title || formData.content) {
          localStorage.setItem(DRAFT_KEY, JSON.stringify({
            title: formData.title,
            content: formData.content,
            author: formData.author,
            category: formData.category,
            tags: formData.tags,
            featured: formData.featured,
            series: formData.series,
          }))
          setAutosaveStatus('saved')
          setTimeout(() => setAutosaveStatus('idle'), 2000)
        }
      } catch {
        // ignore
      }
    }, 2000)
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.title, formData.content, formData.author, formData.category, formData.tags, formData.featured, formData.series])

  const categories = [
    { id: 'tech', name: 'Tech' },
    { id: 'economy', name: 'Economy' },
    { id: 'coin', name: 'Coin' },
    { id: 'travel', name: 'Travel' },
    { id: 'food', name: 'Food' },
    { id: 'lottery', name: 'Lottery' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.title.trim() || !formData.content.trim() || !formData.author.trim()) {
      setError(t.createPostForm.errorRequired)
      return
    }

    try {
      setIsSubmitting(true)
      const url = isEditMode
        ? `${API_BASE_URL}/api/posts/${editPost!._id}`
        : `${API_BASE_URL}/api/posts`
      const method = isEditMode ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...adminAuthHeaders(),
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        if (!isEditMode) {
          // Clear draft on successful submit
          try { localStorage.removeItem(DRAFT_KEY) } catch { /* ignore */ }
          setFormData({
            title: '',
            content: '',
            author: '',
            category: 'tech',
            tags: [],
            featured: false,
            series: '',
          })
          setTagInput('')
        }
        onSuccess()
        onClose()
      } else {
        if (data.solution) {
          setError(
            `${data.message}\n\n` +
            `해결 방법:\n` +
            `1. ${data.solution.step1}\n` +
            `2. ${data.solution.step2}\n` +
            `3. ${data.solution.step3}\n` +
            `SQL: ${data.solution.sql}`
          )
        } else {
          setError(data.message || t.createPostForm.errorCreate)
        }
      }
    } catch (error) {
      console.error('게시글 생성 오류:', error)
      setError(t.createPostForm.errorNetwork)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      })
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    })
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEditMode ? t.createPostForm.titleEdit : t.createPostForm.titleNew}
            </h2>
            <div className="flex items-center gap-3">
              {!isEditMode && autosaveStatus === 'saved' && (
                <span className="text-xs text-green-600 dark:text-green-400 font-mono">임시저장됨</span>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.createPostForm.fieldTitle} *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={t.createPostForm.fieldTitlePlaceholder}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.createPostForm.fieldAuthor} *
                </label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={t.createPostForm.fieldAuthorPlaceholder}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.createPostForm.fieldCategory} *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  시리즈 <span className="text-gray-400 font-normal">(선택)</span>
                </label>
                <input
                  type="text"
                  value={formData.series}
                  onChange={(e) => setFormData({ ...formData, series: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="예: React 심화 가이드"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.createPostForm.fieldContent} *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={12}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  placeholder={t.createPostForm.fieldContentPlaceholder}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.createPostForm.fieldTags}
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddTag()
                      }
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={t.createPostForm.fieldTagPlaceholder}
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    {t.createPostForm.addTag}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm"
                    >
                      <FiTag className="w-3 h-3" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-red-600"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="featured" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.createPostForm.featured}
                </label>
              </div>
            </div>
          </form>

          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {t.createPostForm.cancel}
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FiSave className="w-4 h-4" />
              {isSubmitting ? t.createPostForm.saving : isEditMode ? t.createPostForm.saveEdit : t.createPostForm.saveNew}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
