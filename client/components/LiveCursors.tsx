'use client'
import { useState, useEffect, useRef } from 'react'

interface Cursor {
  id: string
  x: number  // percentage 0-100
  y: number  // percentage 0-100
  color: string
  name: string
  updatedAt: number
}

const COLORS = ['#f87171', '#fb923c', '#facc15', '#4ade80', '#60a5fa', '#c084fc', '#f472b6']
const NAMES = ['익명의 방문자', '누군가', '신비한 방문자', '탐험가', '구경꾼']

function getMyId(): string {
  if (typeof window === 'undefined') return ''
  let id = sessionStorage.getItem('cursor-id')
  if (!id) {
    id = Math.random().toString(36).slice(2, 10)
    sessionStorage.setItem('cursor-id', id)
  }
  return id
}

export default function LiveCursors() {
  const [cursors, setCursors] = useState<Cursor[]>([])
  const myId = useRef(getMyId())
  const myColor = useRef(COLORS[Math.floor(Math.random() * COLORS.length)])
  const myName = useRef(NAMES[Math.floor(Math.random() * NAMES.length)])
  const posRef = useRef({ x: -1, y: -1 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      posRef.current = {
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      }
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  useEffect(() => {
    const push = async () => {
      if (posRef.current.x < 0) return
      await fetch('/api/cursors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: myId.current,
          x: posRef.current.x,
          y: posRef.current.y,
          color: myColor.current,
          name: myName.current,
        }),
      }).catch(() => {})
    }

    const pull = async () => {
      const res = await fetch('/api/cursors').catch(() => null)
      if (!res?.ok) return
      const data = await res.json() as { cursors: Cursor[] }
      setCursors((data.cursors ?? []).filter(c => c.id !== myId.current))
    }

    const pushTimer = setInterval(push, 2000)
    const pullTimer = setInterval(pull, 2000)
    push()

    return () => { clearInterval(pushTimer); clearInterval(pullTimer) }
  }, [])

  return (
    <>
      {cursors.map(c => (
        <div
          key={c.id}
          style={{
            position: 'fixed',
            left: `${c.x}%`,
            top: `${c.y}%`,
            zIndex: 9990,
            pointerEvents: 'none',
            transform: 'translate(-2px, -2px)',
            transition: 'left 2s linear, top 2s linear',
          }}
        >
          {/* Cursor SVG */}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 2L16 10L10 11L7 17L4 2Z" fill={c.color} stroke="black" strokeWidth="1" />
          </svg>
          {/* Name tag */}
          <div
            className="text-xs px-1.5 py-0.5 rounded-sm mt-0.5 whitespace-nowrap font-mono"
            style={{ background: c.color, color: '#000', fontSize: '10px' }}
          >
            {c.name}
          </div>
        </div>
      ))}
    </>
  )
}
