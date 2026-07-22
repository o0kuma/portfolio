import { useEffect, useState } from 'react'

/**
 * True during the narrow 2am–5am local-time window — deliberately tighter
 * than useTimeOfDay's broad 'night' bucket (20:00–05:00), since this backs
 * a rare "night owl club" easter egg meant for actual middle-of-the-night
 * visitors, not everyone browsing after dinner.
 */
export function useIsNightOwlHours(): boolean {
  const [isNightOwlHours, setIsNightOwlHours] = useState(false)

  useEffect(() => {
    const update = () => {
      const hour = new Date().getHours()
      setIsNightOwlHours(hour >= 2 && hour < 5)
    }
    update()
    const id = setInterval(update, 60_000)
    return () => clearInterval(id)
  }, [])

  return isNightOwlHours
}
