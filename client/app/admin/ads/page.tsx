'use client'

import { useState, useEffect, useCallback } from 'react'
import { FiPlus, FiEdit, FiTrash2, FiEye, FiMousePointer, FiDollarSign, FiX, FiSave } from 'react-icons/fi'
import { toast } from '@/lib/toast'

interface Advertisement {
  id: string
  title: string
  description: string
  ad_type: string
  position: string
  image_url: string | null
  target_url: string | null
  is_active: boolean
  current_impressions: number
  current_clicks: number
  cpc: number
  cpm: number
  total_revenue: number
  created_at: string
}

interface AdFormData {
  title: string
  description: string
  ad_type: string
  position: string
  image_url: string
  target_url: string
  is_active: boolean
  cpc: string
  cpm: string
}

const EMPTY_FORM: AdFormData = {
  title: '',
  description: '',
  ad_type: 'banner',
  position: 'top',
  image_url: '',
  target_url: '',
  is_active: true,
  cpc: '0',
  cpm: '0',
}

const AD_TYPES = ['banner', 'sidebar', 'inline', 'popup', 'native', 'video']
const AD_POSITIONS = ['top', 'bottom', 'sidebar-left', 'sidebar-right', 'inline', 'header', 'footer']

export default function AdsManagementPage() {
  const [ads, setAds] = useState<Advertisement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null)
  const [formData, setFormData] = useState<AdFormData>(EMPTY_FORM)
  const [adminToken, setAdminToken] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [showTokenInput, setShowTokenInput] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('admin_token') ?? ''
    setAdminToken(saved)
    fetchAds()
  }, [])

  const fetchAds = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/ads', { cache: 'no-store' })
      const data = await response.json()
      if (!data.success) throw new Error(data.error || '광고 조회 실패')
      setAds(data.ads || [])
    } catch (error) {
      console.error('광고 조회 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const openNewForm = () => {
    setEditingAd(null)
    setFormData(EMPTY_FORM)
    setFormError('')
    setShowForm(true)
  }

  const openEditForm = (ad: Advertisement) => {
    setEditingAd(ad)
    setFormData({
      title: ad.title ?? '',
      description: ad.description ?? '',
      ad_type: ad.ad_type ?? 'banner',
      position: ad.position ?? 'top',
      image_url: ad.image_url ?? '',
      target_url: ad.target_url ?? '',
      is_active: ad.is_active ?? true,
      cpc: String(ad.cpc ?? 0),
      cpm: String(ad.cpm ?? 0),
    })
    setFormError('')
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingAd(null)
    setFormError('')
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const saveToken = (token: string) => {
    setAdminToken(token)
    localStorage.setItem('admin_token', token)
    setShowTokenInput(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!formData.title.trim()) {
      setFormError('제목은 필수입니다.')
      return
    }
    if (!adminToken.trim()) {
      setFormError('관리자 토큰이 없습니다. 우측 상단의 [토큰 설정]을 먼저 해주세요.')
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        ...formData,
        cpc: Number(formData.cpc) || 0,
        cpm: Number(formData.cpm) || 0,
        image_url: formData.image_url.trim() || null,
        target_url: formData.target_url.trim() || null,
      }

      const url = editingAd ? `/api/admin/ads/${editingAd.id}` : '/api/admin/ads'
      const method = editingAd ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()
      if (!result.success) {
        setFormError(result.error || '저장에 실패했습니다.')
        return
      }

      closeForm()
      await fetchAds()
    } catch (err: any) {
      setFormError(err.message || '네트워크 오류가 발생했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (ad: Advertisement) => {
    if (!confirm(`"${ad.title}" 광고를 삭제하시겠습니까?`)) return
    if (!adminToken.trim()) {
      toast.warning('관리자 토큰이 없습니다. 토큰 설정을 먼저 해주세요.')
      return
    }
    try {
      const response = await fetch(`/api/admin/ads/${ad.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      })
      const result = await response.json()
      if (result.success) await fetchAds()
      else toast.error(result.error || '삭제에 실패했습니다.')
    } catch (err) {
      console.error('삭제 오류:', err)
    }
  }

  const calculateCTR = (impressions: number, clicks: number) => {
    if (impressions === 0) return '0.00'
    return ((clicks / impressions) * 100).toFixed(2)
  }

  const calculateRevenue = (ad: Advertisement) => {
    return (ad.current_clicks * (ad.cpc || 0)).toFixed(0)
  }

  return (
    <div className="min-h-screen bg-canvas px-4 py-8 text-textPrimary">
      <div className="page-shell max-w-7xl">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">광고 관리</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTokenInput((v) => !v)}
              className="text-sm px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              {adminToken ? '토큰 변경' : '토큰 설정'}
            </button>
            <button onClick={openNewForm} className="btn-primary flex items-center gap-2">
              <FiPlus className="w-5 h-5" />
              새 광고 추가
            </button>
          </div>
        </div>

        {/* 토큰 입력 인라인 패널 */}
        {showTokenInput && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
            <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-2 font-medium">
              관리자 API 토큰 설정 (localStorage에 저장됩니다)
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                defaultValue={adminToken}
                placeholder="ADMIN_API_TOKEN 값 입력"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveToken((e.target as HTMLInputElement).value)
                }}
                id="token-input"
              />
              <button
                onClick={() => {
                  const el = document.getElementById('token-input') as HTMLInputElement
                  saveToken(el?.value ?? '')
                }}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium"
              >
                저장
              </button>
            </div>
          </div>
        )}

        {/* 통계 카드 */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">총 광고 수</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{ads.length}</p>
              </div>
              <FiEye className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="card rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">총 노출 수</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {ads.reduce((sum, ad) => sum + (ad.current_impressions || 0), 0).toLocaleString()}
                </p>
              </div>
              <FiEye className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="card rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">총 클릭 수</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {ads.reduce((sum, ad) => sum + (ad.current_clicks || 0), 0).toLocaleString()}
                </p>
              </div>
              <FiMousePointer className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <div className="card rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">총 수익</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  ₩{ads.reduce((sum, ad) => sum + Number(calculateRevenue(ad)), 0).toLocaleString()}
                </p>
              </div>
              <FiDollarSign className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* 광고 목록 */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
          </div>
        ) : ads.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <p className="text-lg">등록된 광고가 없습니다.</p>
            <button onClick={openNewForm} className="mt-4 btn-primary">
              첫 광고 추가하기
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  {['제목', '타입', '위치', '노출', '클릭', 'CTR', '수익', '상태', '작업'].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {ads.map((ad) => (
                  <tr key={ad.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{ad.title}</div>
                      {ad.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-xs">
                          {ad.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {ad.ad_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                        {ad.position}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {(ad.current_impressions || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {(ad.current_clicks || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {calculateCTR(ad.current_impressions || 0, ad.current_clicks || 0)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600 dark:text-green-400">
                      ₩{Number(calculateRevenue(ad)).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          ad.is_active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {ad.is_active ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openEditForm(ad)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                        title="수정"
                      >
                        <FiEdit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(ad)}
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

      {/* 광고 추가/수정 모달 */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingAd ? '광고 수정' : '새 광고 추가'}
              </h2>
              <button
                onClick={closeForm}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* 폼 */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* 제목 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="광고 제목을 입력하세요"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 설명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  설명
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="광고 설명 (선택사항)"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* 타입 & 위치 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    광고 타입 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="ad_type"
                    value={formData.ad_type}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    {AD_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    위치 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    {AD_POSITIONS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 타겟 URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  타겟 URL (클릭 시 이동)
                </label>
                <input
                  type="url"
                  name="target_url"
                  value={formData.target_url}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 이미지 URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  이미지 URL
                </label>
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  placeholder="https://example.com/ad-image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* CPC & CPM */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    CPC (클릭당 단가, ₩)
                  </label>
                  <input
                    type="number"
                    name="cpc"
                    value={formData.cpc}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    CPM (1,000 노출당 단가, ₩)
                  </label>
                  <input
                    type="number"
                    name="cpm"
                    value={formData.cpm}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* 활성 상태 */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="is_active"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  광고 활성화
                </label>
              </div>

              {/* 에러 메시지 */}
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
                  {formError}
                </div>
              )}

              {/* 버튼 */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-5 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium flex items-center gap-2 transition"
                >
                  <FiSave className="w-4 h-4" />
                  {isSaving ? '저장 중...' : editingAd ? '수정 저장' : '광고 추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
