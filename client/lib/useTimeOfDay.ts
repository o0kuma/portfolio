import { useEffect, useState } from 'react'

export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night'

function computeTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 7) return 'dawn'
  if (hour >= 7 && hour < 17) return 'day'
  if (hour >= 17 && hour < 20) return 'dusk'
  return 'night'
}

/** Local time-of-day bucket, re-evaluated every minute. Defaults to 'night' until mounted (SSR-safe). */
export function useTimeOfDay(): TimeOfDay {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('night')

  useEffect(() => {
    const update = () => setTimeOfDay(computeTimeOfDay(new Date().getHours()))
    update()
    const id = setInterval(update, 60_000)
    return () => clearInterval(id)
  }, [])

  return timeOfDay
}
