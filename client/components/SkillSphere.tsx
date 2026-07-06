'use client'
import { useEffect, useRef, useState } from 'react'

const SKILLS = [
  { name: 'React', color: '#61dafb' },
  { name: 'Next.js', color: '#ffffff' },
  { name: 'TypeScript', color: '#3178c6' },
  { name: 'TailwindCSS', color: '#38bdf8' },
  { name: 'Node.js', color: '#68a063' },
  { name: 'PostgreSQL', color: '#336791' },
  { name: 'Canvas API', color: '#f59e0b' },
  { name: 'WebSocket', color: '#8b5cf6' },
  { name: 'Supabase', color: '#3ecf8e' },
  { name: 'Git', color: '#f05032' },
  { name: 'Vercel', color: '#ffffff' },
  { name: 'Docker', color: '#2496ed' },
  { name: 'Prisma', color: '#5a67d8' },
  { name: 'Framer', color: '#ff0055' },
  { name: 'Notion API', color: '#ffffff' },
  { name: 'Express', color: '#68a063' },
]

export default function SkillSphere() {
  const containerRef = useRef<HTMLDivElement>(null)
  const angleRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number | undefined>(undefined)
  const isDragging = useRef(false)
  const lastMouse = useRef({ x: 0, y: 0 })
  const [positions, setPositions] = useState<{ x: number; y: number; z: number; scale: number }[]>([])

  // Distribute skills evenly on sphere surface using Fibonacci spiral
  useEffect(() => {
    const n = SKILLS.length
    const golden = Math.PI * (3 - Math.sqrt(5))
    const pos = SKILLS.map((_, i) => {
      const y = 1 - (i / (n - 1)) * 2
      const r = Math.sqrt(1 - y * y)
      const theta = golden * i
      return { x: Math.cos(theta) * r, y, z: Math.sin(theta) * r, scale: 1 }
    })
    setPositions(pos)
  }, [])

  useEffect(() => {
    const R = 160 // sphere radius in px

    const animate = () => {
      if (!isDragging.current) {
        angleRef.current.y += 0.003
      }
      const { x: ax, y: ay } = angleRef.current
      const cosX = Math.cos(ax), sinX = Math.sin(ax)
      const cosY = Math.cos(ay), sinY = Math.sin(ay)

      setPositions(positions.map(p => {
        // Rotate around Y axis
        const x1 = p.x * cosY - p.z * sinY
        const z1 = p.x * sinY + p.z * cosY
        // Rotate around X axis
        const y2 = p.y * cosX - z1 * sinX
        const z2 = p.y * sinX + z1 * cosX
        const scale = (z2 + 1.5) / 2.5
        return { x: x1 * R, y: y2 * R, z: z2, scale }
      }))

      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [positions.length])

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true
    lastMouse.current = { x: e.clientX, y: e.clientY }
  }
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return
    const dx = e.clientX - lastMouse.current.x
    const dy = e.clientY - lastMouse.current.y
    angleRef.current.y += dx * 0.005
    angleRef.current.x += dy * 0.005
    lastMouse.current = { x: e.clientX, y: e.clientY }
  }
  const onMouseUp = () => { isDragging.current = false }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-80 cursor-grab active:cursor-grabbing select-none"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {SKILLS.map((skill, i) => {
          const pos = positions[i]
          if (!pos) return null
          const opacity = Math.max(0.2, pos.scale)
          const fontSize = Math.max(11, pos.scale * 16)
          return (
            <div
              key={skill.name}
              className="absolute font-mono font-semibold px-2 py-1 rounded-sm border transition-none"
              style={{
                transform: `translate(${pos.x}px, ${pos.y}px)`,
                opacity,
                fontSize,
                color: skill.color,
                borderColor: `${skill.color}40`,
                background: `${skill.color}10`,
                zIndex: Math.round(pos.z * 100 + 100),
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {skill.name}
            </div>
          )
        })}
      </div>
    </div>
  )
}
