import { SkeletonCard } from '@/components/ui/Skeleton'

export default function BookmarksLoading() {
  return (
    <div className="min-h-screen bg-neutral-950 pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6">
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
