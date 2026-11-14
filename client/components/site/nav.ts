import type { Section } from './layout'

/** Top-level menu, shared by the header and the footer. */
export type NavItem = { href: string; ko: string; en: string; section?: Section }

export const PRIMARY_NAV: NavItem[] = [
  { href: '/posts', ko: '글', en: 'Posts', section: 'post' },
  { href: '/recipes', ko: '레시피', en: 'Recipes', section: 'recipe' },
  { href: '/food', ko: '맛집', en: 'Food', section: 'food' },
  { href: '/games', ko: '게임', en: 'Games', section: 'game' },
]

export const MORE_NAV: NavItem[] = [
  { href: '/bookmarks', ko: '북마크', en: 'Bookmarks' },
  { href: '/faq', ko: 'FAQ', en: 'FAQ' },
  { href: '/rpg', ko: 'RPG 월드', en: 'RPG World' },
]

export function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false
  if (href === '/games') {
    // Game pages live at top-level routes; keep 게임 lit while playing one.
    return ['/games', '/achievements', '/tetris', '/tower-defense', '/survive', '/typing-game', '/lotto', '/arcade'].some(
      (p) => pathname === p || pathname.startsWith(`${p}/`),
    )
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}
