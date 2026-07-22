'use client'

import dynamic from 'next/dynamic'
import { useIdleMount } from '@/lib/useIdleMount'

const NightOwlClub = dynamic(() => import('@/components/NightOwlClub'), { ssr: false })

export default function NightOwlClubClient() {
  const ready = useIdleMount()
  if (!ready) return null
  return <NightOwlClub />
}
