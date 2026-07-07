'use client'

import { useEffect } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

export default function PostsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { locale } = useLanguage()
  useEffect(() => { console.error(error) }, [error])
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-4xl font-black text-neutral-800">{locale === 'en' ? 'Error' : '오류'}</p>
      <p className="text-neutral-400 text-sm">
        {locale === 'en' ? 'Something went wrong while loading the page.' : '페이지를 불러오는 중 오류가 발생했습니다.'}
      </p>
      <button type="button" onClick={reset} className="px-4 py-2 rounded-lg bg-neutral-100 text-neutral-950 text-sm font-semibold">
        {locale === 'en' ? 'Try again' : '다시 시도'}
      </button>
    </div>
  )
}
