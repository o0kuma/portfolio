'use client'

import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

type Props = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export default function Pagination({ page, totalPages, onPageChange, className = '' }: Props) {
  if (totalPages <= 1) return null

  const pages: (number | '...')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push('...')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i)
    if (page < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  const btn = (active: boolean, disabled: boolean, onClick: () => void, children: React.ReactNode, key?: string | number) => (
    <button
      key={key}
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        'flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-sm font-mono transition-colors',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        active
          ? 'border-neutral-400 bg-neutral-100 text-neutral-950 font-semibold'
          : 'border-neutral-800 bg-transparent text-neutral-400 hover:border-neutral-600 hover:text-neutral-200',
      ].join(' ')}
    >
      {children}
    </button>
  )

  return (
    <nav aria-label="페이지 네비게이션" className={`flex items-center gap-1.5 ${className}`}>
      {btn(false, page <= 1, () => onPageChange(page - 1), <FiChevronLeft className="h-4 w-4" />)}
      {pages.map((p, i) =>
        p === '...'
          ? <span key={`ellipsis-${i}`} className="px-1 text-neutral-600">…</span>
          : btn(p === page, false, () => onPageChange(p as number), p, p)
      )}
      {btn(false, page >= totalPages, () => onPageChange(page + 1), <FiChevronRight className="h-4 w-4" />)}
    </nav>
  )
}
