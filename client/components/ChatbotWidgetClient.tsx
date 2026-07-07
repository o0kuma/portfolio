'use client'

import dynamic from 'next/dynamic'

// Floating chat widget — defer to the client so it never ships in the SSR
// bundle and loads after the page is interactive.
const ChatbotWidget = dynamic(() => import('@/components/ChatbotWidget'), { ssr: false })

export default function ChatbotWidgetClient() {
  return <ChatbotWidget />
}
