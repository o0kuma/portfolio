'use client'

import dynamic from 'next/dynamic'
import { useIdleMount } from '@/lib/useIdleMount'
import { useHideCornerWidgets } from '@/lib/useHideCornerWidgets'

const AmbientSoundtrack = dynamic(() => import('@/components/AmbientSoundtrack'), { ssr: false })

export default function AmbientSoundtrackClient() {
  const ready = useIdleMount()
  const hidden = useHideCornerWidgets()
  if (!ready || hidden) return null
  return <AmbientSoundtrack />
}
