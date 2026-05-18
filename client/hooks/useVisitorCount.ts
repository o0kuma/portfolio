'use client'

import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

export interface UseVisitorCountResult {
  count: number
  status: ConnectionStatus
}

const SERVER_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

export function useVisitorCount(): UseVisitorCountResult {
  const [count, setCount] = useState(0)
  const [status, setStatus] = useState<ConnectionStatus>('connecting')
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const socket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    })
    socketRef.current = socket

    socket.on('connect', () => {
      setStatus('connected')
      socket.emit('request_visitor_count')
    })

    socket.on('visitor_count', (data: { count: number }) => {
      setCount(data.count)
    })

    socket.on('connect_error', () => {
      setStatus('error')
    })

    socket.on('disconnect', () => {
      setStatus('disconnected')
    })

    socket.on('reconnect', () => {
      setStatus('connected')
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [])

  return { count, status }
}
