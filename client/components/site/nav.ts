/** Top-level menu, shared by the header and the footer. */
export type NavItem = { href: string; ko: string; en: string }

export const PRIMARY_NAV: NavItem[] = [
  { href: '/posts', ko: '글', en: 'Posts' },
  { href: '/recipes', ko: '레시피', en: 'Recipes' },
  { href: '/food', ko: '맛집', en: 'Food' },
  { href: '/games', ko: '게임', en: 'Games' },
]

export const MORE_NAV: NavItem[] = [
  { href: '/bookmarks', ko: '북마크', en: 'Bookmarks' },
  { href: '/faq', ko: 'FAQ', en: 'FAQ' },
  { href: '/rpg', ko: 'RPG 월드', en: 'RPG World' },
]

export function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false
  return pathname === href || pathname.startsWith(`${href}/`)
}
