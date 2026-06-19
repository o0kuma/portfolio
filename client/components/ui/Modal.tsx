'use client'

import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX } from 'react-icons/fi'

type Size = 'sm' | 'md' | 'lg' | 'xl' | 'full'

type Props = {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  size?: Size
  showCloseButton?: boolean
  closeOnBackdrop?: boolean
  children: React.ReactNode
  footer?: React.ReactNode
}

const sizes: Record<Size, string> = {
  sm:   'max-w-sm',
  md:   'max-w-md',
  lg:   'max-w-2xl',
  xl:   'max-w-4xl',
  full: 'max-w-[95vw]',
}

export default function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  children,
  footer,
}: Props) {
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [open, handleEscape])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeOnBackdrop ? onClose : undefined}
            aria-hidden
          />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className={`relative z-10 w-full ${sizes[size]} max-h-[88vh] flex flex-col rounded-2xl border border-neutral-700 bg-neutral-900 shadow-2xl`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between gap-4 border-b border-neutral-800 px-6 py-4 shrink-0">
                <div>
                  {title && (
                    <h2 id="modal-title" className="text-base font-semibold text-neutral-100">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="mt-0.5 text-sm text-neutral-500">{description}</p>
                  )}
                </div>
                {showCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="shrink-0 rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-200 transition-colors"
                    aria-label="닫기"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="border-t border-neutral-800 px-6 py-4 shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
