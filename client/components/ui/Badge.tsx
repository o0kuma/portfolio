type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline'
type Size = 'sm' | 'md'

type Props = {
  variant?: Variant
  size?: Size
  dot?: boolean
  children: React.ReactNode
  className?: string
}

const variants: Record<Variant, string> = {
  default: 'bg-neutral-800 text-neutral-300 border border-neutral-700',
  success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  warning: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  danger:  'bg-rose-500/15 text-rose-400 border border-rose-500/30',
  info:    'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30',
  outline: 'bg-transparent text-neutral-400 border border-neutral-600',
}

const dotColors: Record<Variant, string> = {
  default: 'bg-neutral-400',
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  danger:  'bg-rose-400',
  info:    'bg-cyan-400',
  outline: 'bg-neutral-400',
}

const sizes: Record<Size, string> = {
  sm: 'text-[10px] px-1.5 py-0.5 rounded gap-1',
  md: 'text-xs px-2 py-1 rounded-md gap-1.5',
}

export default function Badge({
  variant = 'default',
  size = 'md',
  dot = false,
  children,
  className = '',
}: Props) {
  return (
    <span className={`inline-flex items-center font-mono font-medium uppercase tracking-wider ${variants[variant]} ${sizes[size]} ${className}`}>
      {dot && <span className={`shrink-0 w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  )
}
