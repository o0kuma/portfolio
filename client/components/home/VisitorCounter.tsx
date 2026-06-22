'use client'

import { useEffect, useState } from 'react'

export default function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/visitors')
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.count === 'number') setCount(data.count)
      })
      .catch(() => {})
  }, [])

  if (count === null) return null

  return (
    <span className="text-neutral-600 font-mono text-xs">
      visitors: {count.toLocaleString()}
    </span>
  )
}
