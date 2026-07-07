'use client'

import { useState, useEffect, useCallback } from 'react'
import { FiPlus, FiEdit, FiTrash2, FiEye, FiMousePointer, FiDollarSign, FiX, FiSave } from 'react-icons/fi'
import { toast } from '@/lib/toast'
import { useLanguage } from '@/lib/LanguageContext'
import { interpolate } from '@/lib/i18n'

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
  const { t } = useLanguage()
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
      const response = await fetch('/api/admin/ads', {
        cache: 'no-store',
        headers: { Authorization: `Bearer ${localStorage.getItem('admin_token') ?? adminToken}` },
      })
      const data = await response.json()
      if (!data.success) throw new Error(data.error || 'Failed to load ads')
      setAds(data.ads || [])
    } catch (error) {
      console.error('Ad fetch error:', error)
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
      setFormError(t.adminAds.errorTitleRequired)
      return
    }
    if (!adminToken.trim()) {
      setFormError(t.adminAds.errorNoToken)
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
        setFormError(result.error || t.adminAds.errorSaveFailed)
        return
      }

      closeForm()
      await fetchAds()
    } catch (err: any) {
      setFormError(err.message || t.adminAds.errorNetwork)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (ad: Advertisement) => {
    if (!confirm(interpolate(t.adminAds.deleteConfirm, { title: ad.title }))) return
    if (!adminToken.trim()) {
      toast.warning(t.adminAds.errorNoTokenDelete)
      return
    }
    try {
      const response = await fetch(`/api/admin/ads/${ad.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      })
      const result = await response.json()
      if (result.success) await fetchAds()
      else toast.error(result.error || t.adminAds.errorDeleteFailed)
    } catch (err) {
      console.error('Delete error:', err)
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t.adminAds.pageTitle}</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTokenInput((v) => !v)}
              className="text-sm px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              {adminToken ? t.adminAds.tokenChange : t.adminAds.tokenSet}
            </button>
            <button onClick={openNewForm} className="btn-primary flex items-center gap-2">
              <FiPlus className="w-5 h-5" />
              {t.adminAds.addNew}
            </button>
          </div>
        </div>

        {showTokenInput && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
            <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-2 font-medium">
              {t.adminAds.tokenPanelLabel}
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                defaultValue={adminToken}
                placeholder={t.adminAds.tokenPlaceholder}
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
                {t.adminAds.save}
              </button>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t.adminAds.statTotalAds}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{ads.length}</p>
              </div>
              <FiEye className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="card rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t.adminAds.statImpressions}</p>
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
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t.adminAds.statClicks}</p>
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
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t.adminAds.statRevenue}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  ₩{ads.reduce((sum, ad) => sum + Number(calculateRevenue(ad)), 0).toLocaleString()}
                </p>
              </div>
              <FiDollarSign className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
          </div>
        ) : ads.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <p className="text-lg">{t.adminAds.emptyMessage}</p>
            <button onClick={openNewForm} className="mt-4 btn-primary">
              {t.adminAds.addFirst}
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  {[
                    t.adminAds.colTitle,
                    t.adminAds.colType,
                    t.adminAds.colPosition,
                    t.adminAds.colImpressions,
                    t.adminAds.colClicks,
                    t.adminAds.colCTR,
                    t.adminAds.colRevenue,
                    t.adminAds.colStatus,
                    t.adminAds.colAction,
                  ].map((h) => (
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
                        {ad.is_active ? t.adminAds.statusActive : t.adminAds.statusInactive}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openEditForm(ad)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                        title="Edit"
                      >
                        <FiEdit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(ad)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete"
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

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingAd ? t.adminAds.modalTitleEdit : t.adminAds.modalTitleNew}
              </h2>
              <button
                onClick={closeForm}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.adminAds.fieldTitle} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder={t.adminAds.fieldTitle}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.adminAds.fieldDesc}
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder={t.adminAds.fieldDesc}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.adminAds.fieldType} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="ad_type"
                    value={formData.ad_type}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    {AD_TYPES.map((adType) => (
                      <option key={adType} value={adType}>{adType}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.adminAds.fieldPosition} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    {AD_POSITIONS.map((pos) => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.adminAds.fieldTargetUrl}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.adminAds.fieldImageUrl}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.adminAds.fieldCpc}
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
                    {t.adminAds.fieldCpm}
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
                  {t.adminAds.fieldActive}
                </label>
              </div>

              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
                  {formError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-5 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition"
                >
                  {t.adminAds.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium flex items-center gap-2 transition"
                >
                  <FiSave className="w-4 h-4" />
                  {isSaving ? t.adminAds.saving : editingAd ? t.adminAds.savingEdit : t.adminAds.savingNew}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
