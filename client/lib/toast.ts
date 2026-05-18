export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastEvent {
  id: string
  type: ToastType
  message: string
  duration: number
}

const EVENT_NAME = 'portfolio:toast'

function emit(type: ToastType, message: string) {
  const duration = type === 'success' || type === 'info' ? 3000 : 5000
  const event = new CustomEvent<ToastEvent>(EVENT_NAME, {
    detail: { id: `${Date.now()}-${Math.random()}`, type, message, duration },
  })
  if (typeof window !== 'undefined') {
    window.dispatchEvent(event)
  }
}

export const toast = {
  success: (message: string) => emit('success', message),
  error: (message: string) => emit('error', message),
  warning: (message: string) => emit('warning', message),
  info: (message: string) => emit('info', message),
  EVENT_NAME,
}
