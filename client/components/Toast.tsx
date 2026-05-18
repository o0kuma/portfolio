'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast as toastLib, type ToastEvent, type ToastType } from '@/lib/toast'

const ICONS: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
}

const COLORS: Record<ToastType, { bar: string; icon: string; border: string }> = {
  success: {
    bar: 'bg-emerald-400',
    icon: 'text-emerald-400',
    border: 'border-emerald-400/20',
  },
  error: {
    bar: 'bg-red-400',
    icon: 'text-red-400',
    border: 'border-red-400/20',
  },
  warning: {
    bar: 'bg-amber-400',
    icon: 'text-amber-400',
    border: 'border-amber-400/20',
  },
  info: {
    bar: 'bg-cyan-400',
    icon: 'text-cyan-400',
    border: 'border-cyan-400/20',
  },
}

interface ToastItem extends ToastEvent {
  visible: boolean
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const remove = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, visible: false } : t)),
    )
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 350)
  }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ToastEvent>).detail
      setToasts((prev) => [...prev, { ...detail, visible: true }])
      setTimeout(() => remove(detail.id), detail.duration)
    }

    window.addEventListener(toastLib.EVENT_NAME, handler)
    return () => window.removeEventListener(toastLib.EVENT_NAME, handler)
  }, [remove])

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none"
    >
      {toasts.map((t) => {
        const c = COLORS[t.type]
        return (
          <div
            key={t.id}
            role="alert"
            style={{
              transition: 'opacity 0.3s ease, transform 0.3s ease',
              opacity: t.visible ? 1 : 0,
              transform: t.visible ? 'translateX(0)' : 'translateX(100%)',
            }}
            className={`pointer-events-auto flex items-start gap-3 min-w-[280px] max-w-sm rounded-xl border ${c.border} bg-[#0d1117]/95 backdrop-blur-sm shadow-2xl px-4 py-3`}
          >
            {/* progress bar */}
            <div
              className={`absolute bottom-0 left-0 h-[3px] rounded-b-xl ${c.bar}`}
              style={{
                width: '100%',
                animation: `shrink ${t.duration}ms linear forwards`,
              }}
            />

            {/* icon */}
            <span className={`text-base font-bold mt-0.5 shrink-0 ${c.icon}`}>
              {ICONS[t.type]}
            </span>

            {/* message */}
            <p className="flex-1 text-sm text-white/85 leading-snug">{t.message}</p>

            {/* close */}
            <button
              onClick={() => remove(t.id)}
              className="shrink-0 text-white/30 hover:text-white/70 transition-colors mt-0.5 text-xs leading-none"
              aria-label="닫기"
            >
              ✕
            </button>

            <style>{`
              @keyframes shrink {
                from { width: 100%; }
                to   { width: 0%; }
              }
            `}</style>
          </div>
        )
      })}
    </div>
  )
}
