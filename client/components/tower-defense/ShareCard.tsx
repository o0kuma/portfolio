'use client'

import { useCallback, useState } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

type Props = {
  wave: number
  kills: number
  bestWave: number
  isDaily: boolean
}

export default function ShareCard({ wave, kills, bestWave, isDaily }: Props) {
  const { lang } = useLanguage()
  const [copied, setCopied] = useState(false)

  const shareText = lang === 'ko'
    ? `🗼 타워 디펜스 | 웨이브 ${wave} | 처치 ${kills}\n${isDaily ? '📅 데일리 챌린지 ' : ''}최고 기록: 웨이브 ${bestWave}\n지금 도전해보세요!`
    : `🗼 Tower Defense | Wave ${wave} | Kills ${kills}\n${isDaily ? '📅 Daily Challenge ' : ''}Best: Wave ${bestWave}\nCan you beat me?`

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: select a textarea
    }
  }, [shareText])

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`

  return (
    <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        onClick={handleCopy}
        className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
      >
        {copied ? (lang === 'ko' ? '복사됨 ✓' : 'Copied ✓') : (lang === 'ko' ? '결과 복사' : 'Copy Result')}
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
