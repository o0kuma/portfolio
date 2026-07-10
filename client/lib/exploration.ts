export type Landmark = {
  key: string
  labelKo: string
  labelEn: string
}

// Page-level and in-page landmarks that make up "exploring the whole site."
export const LANDMARKS: Landmark[] = [
  { key: 'home', labelKo: '홈', labelEn: 'Home' },
  { key: 'portfolio', labelKo: '포트폴리오', labelEn: 'Portfolio' },
  { key: 'about', labelKo: '소개', labelEn: 'About' },
  { key: 'skills', labelKo: '기술 스택', labelEn: 'Skills' },
  { key: 'projects', labelKo: '프로젝트', labelEn: 'Projects' },
  { key: 'contact', labelKo: '연락처', labelEn: 'Contact' },
  { key: 'posts', labelKo: '블로그', labelEn: 'Blog' },
  { key: 'food', labelKo: '맛집', labelEn: 'Food' },
  { key: 'games', labelKo: '게임', labelEn: 'Games' },
  { key: 'rpg', labelKo: 'RPG 타운', labelEn: 'RPG Town' },
  { key: 'terminal', labelKo: '터미널', labelEn: 'Terminal' },
]

const STORAGE_KEY = 'portfolio_explored'

export function getVisited(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return new Set(Array.isArray(raw) ? raw : [])
  } catch {
    return new Set()
  }
}

/** Marks a landmark visited; returns true the first time it's newly recorded. */
export function markVisited(key: string): boolean {
  if (typeof window === 'undefined') return false
  const visited = getVisited()
  if (visited.has(key)) return false
  visited.add(key)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(visited)))
  } catch {}
  return true
}

export function pathToLandmark(pathname: string): string | null {
  if (pathname === '/') return 'home'
  if (pathname.startsWith('/portfolio')) return 'portfolio'
  if (pathname.startsWith('/posts')) return 'posts'
  if (pathname.startsWith('/food')) return 'food'
  if (pathname.startsWith('/games') || pathname.startsWith('/tetris') || pathname.startsWith('/survive') || pathname.startsWith('/tower-defense') || pathname.startsWith('/typing-game') || pathname.startsWith('/arcade')) return 'games'
  if (pathname.startsWith('/rpg')) return 'rpg'
  if (pathname.startsWith('/terminal')) return 'terminal'
  return null
}
