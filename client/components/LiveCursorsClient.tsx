'use client'

import dynamic from 'next/dynamic'

const LiveCursors = dynamic(() => import('@/components/LiveCursors'), { ssr: false })

export default function LiveCursorsClient() {
  return <LiveCursors />
}
