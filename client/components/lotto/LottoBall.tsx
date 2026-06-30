'use client'

// 실제 로또 공 색상 규칙: 1~10 노랑, 11~20 파랑, 21~30 빨강, 31~40 회색, 41~45 초록
export function ballColor(n: number): string {
  if (n <= 10) return '#fbc400'
  if (n <= 20) return '#69c8f2'
  if (n <= 30) return '#ff7272'
  if (n <= 40) return '#aaaaaa'
  return '#b0d840'
}

type Size = 'sm' | 'md' | 'lg'

const SIZES: Record<Size, string> = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
}

export default function LottoBall({
  n,
  size = 'md',
  dim = false,
  highlight = false,
}: {
  n: number
  size?: Size
  dim?: boolean
  highlight?: boolean
}) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-bold text-black shadow-md transition-all ${SIZES[size]} ${
        dim ? 'opacity-30' : ''
      } ${highlight ? 'ring-2 ring-white scale-110' : ''}`}
      style={{ backgroundColor: ballColor(n) }}
    >
      {n}
    </span>
  )
}
