'use client'

import dynamic from 'next/dynamic'

// Mouse-following mascot with proactive speech bubbles — deferred to the
// client so it never ships in the SSR bundle and loads after the page is
// interactive.
const KuumaCompanion = dynamic(() => import('@/components/KuumaCompanion'), { ssr: false })

export default function KuumaCompanionClient() {
  return <KuumaCompanion />
}
