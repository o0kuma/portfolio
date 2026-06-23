'use client'
import { useState, useEffect } from 'react'

const THEMES = [
  { id: 'default', label: 'Default', color: '#262626' },
  { id: 'terminal', label: 'Terminal', color: '#0a0f0a', accent: '#4ade80' },
  { id: 'ocean', label: 'Ocean', color: '#020818', accent: '#3b82f6' },
  { id: 'sunset', label: 'Sunset', color: '#0f0a08', accent: '#f97316' },
]

export default function ThemePicker() {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState('default')

  useEffect(() => {
    const saved = localStorage.getItem('color-theme') ?? 'default'
    setCurrent(saved)
    if (saved !== 'default') document.documentElement.setAttribute('data-theme', saved)
  }, [])

  const pick = (id: string) => {
    setCurrent(id)
    localStorage.setItem('color-theme', id)
    if (id === 'default') document.documentElement.removeAttribute('data-theme')
    else document.documentElement.setAttribute('data-theme', id)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="p-2 rounded-lg hover:bg-neutral-800 transition-colors" title="테마 선택">
        <span className="text-sm">🎨</span>
      </button>
      {open && (
        <div className="absolute right-0 top-10 bg-neutral-900 border border-neutral-700 rounded-xl p-2 flex gap-2 z-50 shadow-xl">
          {THEMES.map(t => (
            <button key={t.id} onClick={() => pick(t.id)} title={t.label}
              className={`w-7 h-7 rounded-full border-2 transition-all ${current === t.id ? 'border-white scale-110' : 'border-transparent'}`}
              style={{ background: t.accent ?? t.color }} />
          ))}
        </div>
      )}
    </div>
  )
}
