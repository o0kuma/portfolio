'use client'

import { useCallback } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import { toast } from '@/lib/toast'

type Props = {
  wave: number
  kills: number
  bestWave: number
  isDaily: boolean
}

export default function ShareCard({ wave, kills, bestWave, isDaily }: Props) {
  const { locale } = useLanguage()

  const shareText = locale === 'ko'
    ? `🗼 타워 디펜스 웨이브 ${wave} 달성! kuuuma.com/tower-defense`
    : `🗼 Tower Defense Wave ${wave}! kuuuma.com/tower-defense`

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      toast.success(locale === 'ko' ? '복사됨!' : 'Copied!')
    } catch {
      toast.error(locale === 'ko' ? '복사 실패' : 'Copy failed')
    }
  }, [shareText, locale])

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`

  return (
    <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        onClick={handleCopy}
        className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
      >
        {locale === 'ko' ? '결과 공유' : 'Share Result'}
      </button>
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg border border-sky-400/40 bg-sky-400/10 px-3 py-1.5 text-xs font-semibold text-sky-300 transition hover:bg-sky-400/20"
      >
        X (Twitter)
      </a>
    </div>
  )
}
