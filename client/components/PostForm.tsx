'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiX, FiSave, FiTag, FiEye } from 'react-icons/fi'
import { toast } from '@/lib/toast'

interface Post {
  _id?: string
  title: string
  content: string
  author: string
  category: string
  tags: string[]
  featured: boolean
}

interface PostFormProps {
  isOpen: boolean
  onClose: () => void
  post?: Post | null
  onSave: (post: Post) => void
}

export default function PostForm({ isOpen, onClose, post, onSave }: PostFormProps) {
  const [formData, setFormData] = useState<Post>({
    title: '',
    content: '',
    author: '',
    category: 'general',
    tags: [],
    featured: false
  })
  const [newTag, setNewTag] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  const categories = [
    { id: 'general', name: '일반' },
    { id: 'tech', name: '기술' },
    { id: 'project', name: '프로젝트' },
    { id: 'update', name: '업데이트' }
  ]

  useEffect(() => {
    if (post) {
      setFormData(post)
    } else {
      setFormData({
        title: '',
        content: '',
        author: '',
        category: 'general',
        tags: [],
        featured: false
      })
    }
  }, [post])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.content.trim() || !formData.author.trim()) {
      toast.warning('제목, 내용, 작성자를 모두 입력해주세요.')
      return
    }

    try {
      setIsSubmitting(true)
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Error saving post:', error)
      toast.error('저장 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-dark-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {post ? '게시글 수정' : '새 게시글 작성'}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
              title={previewMode ? '편집 모드' : '미리보기'}
            >
              <FiEye size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6">
            {previewMode ? (
              /* 미리보기 모드 */
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                    {formData.title || '제목을 입력하세요'}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span>작성자: {formData.author || '작성자'}</span>
                    <span>카테고리: {categories.find(c => c.id === formData.category)?.name}</span>
                    {formData.featured && (
                      <span className="px-2 py-1 bg-primary-600 text-white text-xs rounded-full">
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-300 text-sm rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300">
                  <div className="whitespace-pre-wrap">
                    {formData.content || '내용을 입력하세요'}
                  </div>
                </div>
              </div>
            ) : (
              /* 편집 모드 */
              <div className="space-y-6">
                {/* 제목 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    제목 *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="게시글 제목을 입력하세요"
                    required
                  />
                </div>

                {/* 작성자 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    작성자 *
                  </label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="작성자명을 입력하세요"
                    required
                  />
                </div>

                {/* 카테고리 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    카테고리
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 태그 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    태그
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="input-field flex-1"
                      placeholder="태그를 입력하고 Enter를 누르세요"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="btn-secondary px-4 py-2"
                    >
                      추가
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-400 text-sm rounded-full"
                      >
                        <FiTag size={14} />
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-red-500 transition-colors"
                        >
                          <FiX size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Featured 체크박스 */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    추천 게시글로 설정
                  </label>
                </div>

                {/* 내용 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    내용 *
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    className="input-field"
                    rows={12}
                    placeholder="게시글 내용을 입력하세요"
                    required
                  />
                </div>
              </div>
            )}
          </div>

          {/* 푸터 */}
          <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200 dark:border-dark-700">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary inline-flex items-center space-x-2 disabled:opacity-50"
            >
              <FiSave size={20} />
              <span>{isSubmitting ? '저장 중...' : '저장'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
