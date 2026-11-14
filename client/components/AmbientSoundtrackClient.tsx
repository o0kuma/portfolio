'use client'

import dynamic from 'next/dynamic'
import { useSiteSettings } from '@/lib/siteSettings'

const AmbientSoundtrack = dynamic(() => import('@/components/AmbientSoundtrack'), { ssr: false })

/** Plays only while "배경음" is on in the footer's settings row. */
export default function AmbientSoundtrackClient() {
  const { settings } = useSiteSettings()
  if (!settings.sound) return null
  return <AmbientSoundtrack />
}
