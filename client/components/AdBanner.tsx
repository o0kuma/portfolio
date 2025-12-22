'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiX } from 'react-icons/fi'

interface AdBannerProps {
  adType: 'banner' | 'in_article' | 'sidebar' | 'popup'
  position?: 'top' | 'middle' | 'bottom' | 'sidebar'
  postId?: string
  postCategory?: string
  postTags?: string[]
  className?: string
}

interface Advertisement {
  id: string
  title: string
  ad_type: string
  ad_code?: string
  image_url?: string
  link_url?: string
  position?: string
}

export default function AdBanner({
  adType,
  position = 'top',
  postId,
  postCategory,
  postTags = [],
  className = ''
}: AdBannerProps) {
  const [ad, setAd] = useState<Advertisement | null>(null)
  const [impressionId, setImpressionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isClosed, setIsClosed] = useState(false)

  useEffect(() => {
    loadAd()
  }, [adType, position, postCategory, postTags])

  const loadAd = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        type: adType,
        position: position
      })
      
      if (postCategory) params.append('category', postCategory)
      if (postTags.length > 0) params.append('tags', postTags.join(','))
      
      const response = await fetch(`/api/ads/get?${params}`)
      const data = await response.json()
      
      if (data.success && data.ad) {
        setAd(data.ad)
        // 노출 기록
        recordImpression(data.ad.id)
      }
    } catch (error) {
      console.error('광고 로드 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const recordImpression = async (adId: string) => {
    try {
      const sessionId = getSessionId()
      const response = await fetch('/api/ads/impression', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          advertisementId: adId,
          postId: postId,
          sessionId: sessionId,
          position: position
        })
      })
      const data = await response.json()
      if (data.success && data.impressionId) {
        setImpressionId(data.impressionId)
      }
    } catch (error) {
      console.error('노출 기록 오류:', error)
    }
  }

  const handleClick = async () => {
    if (!ad || !impressionId) return
    
    try {
      await fetch('/api/ads/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          advertisementId: ad.id,
          impressionId: impressionId,
          postId: postId
        })
      })
    } catch (error) {
      console.error('클릭 기록 오류:', error)
    }
  }

  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('ad_session_id')
    if (!sessionId) {
      sessionId = `ad_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('ad_session_id', sessionId)
    }
    return sessionId
  }

  if (isLoading || !ad || isClosed) return null

  // Google AdSense 코드인 경우
  if (ad.ad_code) {
    return (
      <div 
        className={`ad-container ${className}`}
        dangerouslySetInnerHTML={{ __html: ad.ad_code }}
        onClick={handleClick}
      />
    )
  }

  // 커스텀 이미지 광고
  if (ad.image_url) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative ${className}`}
      >
        {adType === 'popup' && (
          <button
            onClick={() => setIsClosed(true)}
            className="absolute top-2 right-2 z-10 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
          >
            <FiX className="w-4 h-4" />
          </button>
        )}
        <a
          href={ad.link_url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="block"
        >
          <img
            src={ad.image_url}
            alt={ad.title}
            className="w-full h-auto rounded-lg"
          />
        </a>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
          광고
        </div>
      </motion.div>
    )
  }

  return null
}

