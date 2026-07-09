'use client'

import dynamic from 'next/dynamic'

const AmbientSoundtrack = dynamic(() => import('@/components/AmbientSoundtrack'), { ssr: false })

export default function AmbientSoundtrackClient() {
  return <AmbientSoundtrack />
}
