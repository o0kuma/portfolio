'use client'

import { useEffect } from 'react'

export default function GamesError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-4xl font-black text-neutral-800">Error</p>
      <p className="text-neutral-400 text-sm">An error occurred while loading the page.</p>
      <button type="button" onClick={reset} className="px-4 py-2 rounded-lg bg-neutral-100 text-neutral-950 text-sm font-semibold">
        Try Again
      </button>
    </div>
  )
}
