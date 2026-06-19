import { LeaderboardSkeleton } from '@/components/ui/Skeleton'

export default function PostsLoading() {
  return (
    <div className="min-h-screen bg-neutral-950 pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6">
        <LeaderboardSkeleton />
      </div>
    </div>
  )
}
