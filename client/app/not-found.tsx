import Link from 'next/link'
import PageShell from '@/components/site/PageShell'
import { Container, buttonSecondary, buttonQuiet } from '@/components/site/layout'

export default function NotFound() {
  return (
    <PageShell>
      <Container width="reading" className="py-24 md:py-32">
        <p className="text-xs text-fg-subtle">404</p>
        <h1 className="mt-3 text-[32px] font-bold leading-[1.3] tracking-[-0.02em] text-fg md:text-[40px]">페이지를 찾을 수 없습니다</h1>
        <p className="mt-3 text-base leading-[1.7] text-fg-muted">주소가 바뀌었거나 없는 페이지입니다.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className={buttonSecondary}>
            메인으로
          </Link>
          <Link href="/posts" className={buttonQuiet}>
            글 목록
          </Link>
        </div>
      </Container>
    </PageShell>
  )
}
