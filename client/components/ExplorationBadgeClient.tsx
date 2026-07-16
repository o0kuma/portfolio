'use client'

import dynamic from 'next/dynamic'
import { useHideCornerWidgets } from '@/lib/useHideCornerWidgets'

const ExplorationBadge = dynamic(() => import('@/components/ExplorationBadge'), { ssr: false })

export default function ExplorationBadgeClient() {
  const hidden = useHideCornerWidgets()
  if (hidden) return null
  return <ExplorationBadge />
}
