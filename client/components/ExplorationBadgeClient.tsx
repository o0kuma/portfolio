'use client'

import dynamic from 'next/dynamic'

// Tracks visited sections site-wide; the progress itself is shown in the footer.
const ExplorationTracker = dynamic(() => import('@/components/ExplorationBadge'), { ssr: false })

export default function ExplorationBadgeClient() {
  return <ExplorationTracker />
}
