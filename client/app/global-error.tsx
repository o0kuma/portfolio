'use client'

import { useEffect } from 'react'

/**
 * Root-level error boundary — only fires when the root layout itself throws,
 * so (unlike app/error.tsx) it must render its own <html>/<body> since the
 * layout that normally provides them is what failed.
 */
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
          <button
            type="button"
            onClick={reset}
            className="px-5 py-2.5 rounded-lg bg-neutral-100 text-neutral-950 text-sm font-semibold hover:bg-neutral-300 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  )
}
