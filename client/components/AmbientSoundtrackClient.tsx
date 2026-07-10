'use client'

import dynamic from 'next/dynamic'
import { useIdleMount } from '@/lib/useIdleMount'

const AmbientSoundtrack = dynamic(() => import('@/components/AmbientSoundtrack'), { ssr: false })

export default function AmbientSoundtrackClient() {
  const ready = useIdleMount()
  if (!ready) return null
  return <AmbientSoundtrack />
}
