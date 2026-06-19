type Variant = 'default' | 'glass' | 'bordered' | 'elevated'
type Props = {
  variant?: Variant
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
  className?: string
  children: React.ReactNode
  onClick?: () => void
}

const variants: Record<Variant, string> = {
  default:  'bg-neutral-900 border border-neutral-800',
  glass:    'bg-neutral-900/60 border border-neutral-700/50 backdrop-blur-sm',
  bordered: 'bg-transparent border border-neutral-700',
  elevated: 'bg-neutral-900 border border-neutral-800 shadow-lg shadow-black/20',
}

const paddings = {
  none: '',
  sm:   'p-3',
  md:   'p-5',
  lg:   'p-7',
}

export default function Card({
  variant = 'default',
  padding = 'md',
  hover = false,
  className = '',
  children,
  onClick,
}: Props) {
  return (
    <div
      onClick={onClick}
      className={[
        'rounded-xl transition-colors',
        variants[variant],
        paddings[padding],
        hover ? 'hover:border-neutral-600 cursor-pointer' : '',
        onClick ? 'cursor-pointer' : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}
