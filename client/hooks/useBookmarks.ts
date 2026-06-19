'use client'

import { useState, useEffect, useCallback } from 'react'

const KEY = 'post_bookmarks'

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<string[]>([])

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(KEY) ?? '[]') as string[]
      setBookmarks(stored)
    } catch { setBookmarks([]) }
  }, [])

  const toggle = useCallback((postId: string) => {
    setBookmarks(prev => {
      const next = prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
      localStorage.setItem(KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const isBookmarked = useCallback((postId: string) => bookmarks.includes(postId), [bookmarks])

  return { bookmarks, toggle, isBookmarked }
}
