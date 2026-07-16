'use client'

import { usePathname } from 'next/navigation'

/**
 * These games render an on-screen touch control pad that, on narrow
 * viewports, occupies the same bottom-left corner (left: 24px, bottom:
 * 24-164px) as the KuumaCompanion / AmbientSoundtrack / ExplorationBadge
 * floating stack — the corner-badge icons end up sitting on top of the
 * rotate/left buttons, risking a mis-tap during play. Suppressing the
 * decorative stack on these routes avoids that; none of them are core to
 * actually playing the game.
 */
const TOUCH_CONTROL_ROUTES = ['/tetris', '/survive', '/tower-defense', '/lotto', '/arcade']

export function useHideCornerWidgets(): boolean {
  const pathname = usePathname()
  return TOUCH_CONTROL_ROUTES.some((route) => pathname === route || pathname?.startsWith(`${route}/`))
}
