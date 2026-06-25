'use client'

import { useState, useEffect, useRef } from 'react'

interface TrailPoint {
  x: number
  y: number
  t: number
}

interface Cursor {
  id: string
  x: number
  y: number
  color: string
  name: string
  updatedAt: number
  trail: TrailPoint[]
}

const COLORS = ['#f87171', '#fb923c', '#facc15', '#4ade80', '#60a5fa', '#c084fc', '#f472b6', '#22d3ee']
const NAMES = ['익명의 방문자', '누군가', '신비한 방문자', '탐험가', '구경꾼', '방랑자', '호기심쟁이']

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
      setCursors((data.cursors ?? []).filter((c) => c.id !== myId.current))
    }

    const pushTimer = setInterval(push, 2000)
    const pullTimer = setInterval(pull, 2000)
    push()
    pull()

    return () => {
      clearInterval(pushTimer)
      clearInterval(pullTimer)
    }
  }, [])

  return (
    <>
      {cursors.map((c) => (
        <div key={c.id}>
          {/* Ghost trail dots */}
          {c.trail.map((pt, i) => {
            const opacity = ((i + 1) / c.trail.length) * 0.28
            const size = 6 + (i / c.trail.length) * 5
            return (
              <div
                key={i}
                style={{
                  position: 'fixed',
                  left: `${pt.x}%`,
                  top: `${pt.y}%`,
                  width: size,
                  height: size,
                  borderRadius: '50%',
                  background: c.color,
                  opacity,
                  zIndex: 9985,
                  pointerEvents: 'none',
                  transform: 'translate(-50%, -50%)',
                  filter: 'blur(1px)',
                }}
              />
            )
          })}

          {/* Live cursor */}
          <div
            style={{
              position: 'fixed',
              left: `${c.x}%`,
              top: `${c.y}%`,
              zIndex: 9990,
              pointerEvents: 'none',
              transform: 'translate(-2px, -2px)',
              transition: 'left 1.8s cubic-bezier(0.25,0.46,0.45,0.94), top 1.8s cubic-bezier(0.25,0.46,0.45,0.94)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 2L16 10L10 11L7 17L4 2Z" fill={c.color} stroke="#000" strokeWidth="1" />
            </svg>
            <div
              style={{
                background: c.color,
                color: '#000',
                fontSize: '10px',
                fontFamily: 'monospace',
                padding: '2px 6px',
                borderRadius: '3px',
                marginTop: '2px',
                whiteSpace: 'nowrap',
              }}
            >
              {c.name}
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
