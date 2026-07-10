'use client'

import dynamic from 'next/dynamic'

const ExplorationBadge = dynamic(() => import('@/components/ExplorationBadge'), { ssr: false })

export default function ExplorationBadgeClient() {
  return <ExplorationBadge />
}
