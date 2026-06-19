import { SkeletonCard, Skeleton } from '@/components/ui/Skeleton'

export default function PortfolioSlugLoading() {
  return (
    <div className="min-h-screen bg-neutral-950 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6 space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-4/5" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    </div>
  )
}
