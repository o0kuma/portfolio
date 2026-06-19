import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <p className="text-[8rem] font-black text-neutral-800 leading-none mb-6 select-none">404</p>
        <h1 className="text-2xl font-bold text-neutral-100 mb-3">페이지를 찾을 수 없습니다</h1>
        <p className="text-neutral-500 mb-8 text-sm leading-relaxed">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-lg bg-neutral-100 text-neutral-950 text-sm font-semibold hover:bg-white transition-colors"
          >
            홈으로
          </Link>
          <Link
            href="/posts"
            className="px-5 py-2.5 rounded-lg border border-neutral-700 text-neutral-300 text-sm font-semibold hover:border-neutral-500 transition-colors"
          >
            블로그
          </Link>
        </div>
      </div>
    </div>
  )
}
