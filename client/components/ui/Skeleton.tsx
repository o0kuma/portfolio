type Props = {
  className?: string
  variant?: 'text' | 'rect' | 'circle'
}

export function Skeleton({ className, variant = 'rect' }: Props) {
  const base = 'animate-pulse bg-neutral-200 dark:bg-neutral-800'
  const variants = {
    text: 'h-4 rounded',
    rect: 'rounded-lg',
    circle: 'rounded-full',
  }
  return <div className={`${base} ${variants[variant]} ${className ?? ''}`} />
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={`rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-3 ${className ?? ''}`}>
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-5 w-12 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </div>
  )
}

export function LeaderboardSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2">
          <Skeleton className="h-5 w-5 rounded" variant="rect" />
          <Skeleton className="h-4 flex-1" variant="text" />
          <Skeleton className="h-4 w-12" variant="text" />
        </div>
      ))}
    </div>
  )
}
