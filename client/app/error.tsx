'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="ko">
      <body className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <p className="text-6xl font-black text-neutral-800 mb-6">500</p>
          <h1 className="text-2xl font-bold text-neutral-100 mb-3">오류가 발생했습니다</h1>
          <p className="text-neutral-500 mb-8 text-sm leading-relaxed">
            예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button variant="primary" size="md" onClick={reset}>
              다시 시도
            </Button>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-lg border border-neutral-700 text-neutral-300 text-sm font-semibold hover:border-neutral-500 transition-colors"
            >
              홈으로
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}
