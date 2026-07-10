'use client'

import dynamic from 'next/dynamic'
import { useIdleMount } from '@/lib/useIdleMount'

// Mouse-following mascot with proactive speech bubbles — deferred to the
// client so it never ships in the SSR bundle, and its fetch/hydration is
// held until the browser is idle so it doesn't compete with page content.
const KuumaCompanion = dynamic(() => import('@/components/KuumaCompanion'), { ssr: false })

export default function KuumaCompanionClient() {
  const ready = useIdleMount()
  if (!ready) return null
  return <KuumaCompanion />
}
