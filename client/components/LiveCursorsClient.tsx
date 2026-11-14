'use client'

import dynamic from 'next/dynamic'
import { useSiteSettings } from '@/lib/siteSettings'

const LiveCursors = dynamic(() => import('@/components/LiveCursors'), { ssr: false })

/** Other visitors' cursors — off until turned on in the footer's settings row. */
export default function LiveCursorsClient() {
  const { settings } = useSiteSettings()
  if (!settings.cursors) return null
  return <LiveCursors />
}
