'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import PageShell from '@/components/site/PageShell'
import { Container, buttonSecondary, buttonQuiet } from '@/components/site/layout'

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
    <PageShell>
      <Container width="reading" className="py-24 md:py-32">
        <p className="text-xs text-fg-subtle">500</p>
        <h1 className="mt-3 text-[32px] font-bold leading-[1.3] tracking-[-0.02em] text-fg md:text-[40px]">페이지를 열지 못했습니다</h1>
        <p className="mt-3 text-base leading-[1.7] text-fg-muted">잠시 후 다시 시도해 주세요.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" onClick={reset} className={buttonSecondary}>
            다시 시도
          </button>
          <Link href="/" className={buttonQuiet}>
            메인으로
          </Link>
        </div>
      </Container>
    </PageShell>
  )
}
