'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiCheck, FiX, FiAlertTriangle, FiInfo } from 'react-icons/fi'
import { type ToastEvent, toast as toastLib } from '@/lib/toast'

const icons = {
  success: <FiCheck className="h-4 w-4 text-emerald-400" />,
  error:   <FiX className="h-4 w-4 text-rose-400" />,
  warning: <FiAlertTriangle className="h-4 w-4 text-amber-400" />,
  info:    <FiInfo className="h-4 w-4 text-cyan-400" />,
}

const borders = {
  success: 'border-emerald-500/30',
  error:   'border-rose-500/30',
  warning: 'border-amber-500/30',
  info:    'border-cyan-500/30',
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastEvent[]>([])

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ToastEvent>).detail
      setToasts((prev) => [...prev, detail])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== detail.id))
      }, detail.duration)
    }
    window.addEventListener(toastLib.EVENT_NAME, handler)
    return () => window.removeEventListener(toastLib.EVENT_NAME, handler)
  }, [])

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id))

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 items-end pointer-events-none"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, x: 48, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 48, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border bg-neutral-900 px-4 py-3 shadow-lg max-w-sm ${borders[t.type]}`}
          >
            <span className="mt-0.5 shrink-0">{icons[t.type]}</span>
            <p className="flex-1 text-sm text-neutral-200 leading-snug">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="shrink-0 text-neutral-600 hover:text-neutral-300 transition-colors"
              aria-label="닫기"
            >
              <FiX className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
