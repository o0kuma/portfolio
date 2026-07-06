'use client'

import React, { useState, useEffect } from 'react'
import AdBanner from './AdBanner'

interface InArticleAdProps {
  postId: string
  postCategory?: string
  postTags?: string[]
  paragraphIndex?: number // 몇 번째 단락 다음에 표시할지
}

// 게시물 내용을 파싱하여 단락 사이에 광고 삽입
export function insertAdsInContent(
  content: string,
  postId: string,
  postCategory?: string,
  postTags?: string[]
): (string | React.JSX.Element)[] {
  const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0)
  const result: (string | React.JSX.Element)[] = []
  
  // 3-4개 단락마다 광고 삽입
  const adInterval = 3
  let adIndex = 0

  paragraphs.forEach((paragraph, index) => {
    result.push(paragraph)
    
    // 단락 사이에 줄바꿈 추가
    if (index < paragraphs.length - 1) {
      result.push('\n\n')
    }

    // 광고 삽입 조건: 3개 단락마다, 마지막 단락 전에만
    if ((index + 1) % adInterval === 0 && index < paragraphs.length - 1) {
      result.push(
        <div key={`ad-${adIndex++}`} className="my-8">
          <AdBanner
            adType="in_article"
            position="middle"
            postId={postId}
            postCategory={postCategory}
            postTags={postTags}
            className="my-6"
          />
        </div>
      )
    }
  })

  return result
}

export default function InArticleAd({
  postId,
  postCategory,
  postTags
}: InArticleAdProps) {
  return (
    <div className="my-8">
      <AdBanner
        adType="in_article"
        position="middle"
        postId={postId}
        postCategory={postCategory}
        postTags={postTags}
      />
    </div>
  )
}

