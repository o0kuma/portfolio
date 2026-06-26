'use client'

import { useState } from 'react'
import SnippetCard from '@/components/snippets/SnippetCard'

export interface Snippet {
  id: string
  title: string
  description: string
  language: 'typescript' | 'javascript' | 'python' | 'css' | 'bash'
  code: string
  tags: string[]
  category: 'algorithm' | 'hook' | 'utility' | 'animation' | 'game'
}

const SNIPPETS: Snippet[] = [
  {
    id: 'use-debounce',
    title: 'useDebounce Hook',
    description: '디바운스로 불필요한 API 호출을 줄이는 커스텀 훅',
    language: 'typescript',
    category: 'hook',
    tags: ['React', 'Hook', 'Performance'],
    code: `import { useState, useEffect } from 'react'

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

// Usage
function SearchComponent() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    if (debouncedQuery) {
      fetchResults(debouncedQuery) // fires only after 300ms idle
    }
  }, [debouncedQuery])

  return <input onChange={(e) => setQuery(e.target.value)} />
}`,
  },
  {
    id: 'binary-search',
    title: 'Binary Search',
    description: 'O(log n) 탐색으로 대용량 정렬 배열에서 빠르게 값을 찾는 알고리즘',
    language: 'typescript',
    category: 'algorithm',
    tags: ['Algorithm', 'Search', 'O(log n)'],
    code: `function binarySearch<T>(
  arr: T[],
  target: T,
  compareFn: (a: T, b: T) => number = (a, b) => (a < b ? -1 : a > b ? 1 : 0)
): number {
  let left = 0
  let right = arr.length - 1

  while (left <= right) {
    // Avoid integer overflow: use bit shift instead of (left + right) / 2
    const mid = left + ((right - left) >> 1)
    const cmp = compareFn(arr[mid], target)

    if (cmp === 0) return mid
    if (cmp < 0) left = mid + 1
    else right = mid - 1
  }

  return -1 // not found
}

// Usage
const sorted = [1, 3, 7, 12, 19, 25, 42, 88, 100]
console.log(binarySearch(sorted, 25)) // 5
console.log(binarySearch(sorted, 99)) // -1

// Works with custom comparators too
const words = ['apple', 'banana', 'cherry', 'date']
console.log(binarySearch(words, 'cherry', (a, b) => a.localeCompare(b))) // 2`,
  },
  {
    id: 'canvas-particle',
    title: 'Canvas Particle System',
    description: 'requestAnimationFrame 기반 파티클 시스템 핵심 루프',
    language: 'typescript',
    category: 'animation',
    tags: ['Canvas', 'Animation', 'WebGL'],
    code: `interface Particle {
  x: number; y: number
  vx: number; vy: number
  life: number; maxLife: number
  size: number; color: string
}

class ParticleSystem {
  private particles: Particle[] = []
  private rafId = 0

  constructor(private ctx: CanvasRenderingContext2D) {}

  spawn(x: number, y: number, count = 20): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 4 + 1
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: Math.random() * 60 + 30,
        size: Math.random() * 4 + 1,
        color: \`hsl(\${Math.random() * 60 + 200}, 80%, 65%)\`,
      })
    }
  }

  private tick(): void {
    const { width, height } = this.ctx.canvas
    this.ctx.clearRect(0, 0, width, height)

    this.particles = this.particles.filter((p) => p.life > 0)

    for (const p of this.particles) {
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.1 // gravity
      p.life -= 1 / p.maxLife

      this.ctx.globalAlpha = p.life
      this.ctx.fillStyle = p.color
      this.ctx.beginPath()
      this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
      this.ctx.fill()
    }

    this.ctx.globalAlpha = 1
    this.rafId = requestAnimationFrame(() => this.tick())
  }

  start(): void { this.rafId = requestAnimationFrame(() => this.tick()) }
  stop(): void { cancelAnimationFrame(this.rafId) }
}`,
  },
  {
    id: 'glassmorphism',
    title: 'Glassmorphism Mixin',
    description: '백드롭 블러로 유리 느낌을 주는 재사용 가능한 스타일',
    language: 'css',
    category: 'utility',
    tags: ['CSS', 'Design', 'UI'],
    code: `/* Base glassmorphism utility */
.glass {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
}

/* Dark variant */
.glass-dark {
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(16px) saturate(150%);
  -webkit-backdrop-filter: blur(16px) saturate(150%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* Interactive card with hover effect */
.glass-card {
  composes: glass;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}

.glass-card:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

/* Fallback for browsers without backdrop-filter support */
@supports not (backdrop-filter: blur(1px)) {
  .glass, .glass-dark, .glass-card {
    background: rgba(20, 20, 30, 0.92);
  }
}`,
  },
  {
    id: 'rate-limiter',
    title: 'Sliding Window Rate Limiter',
    description: '슬라이딩 윈도우 방식으로 IP당 요청 수를 제한하는 미들웨어',
    language: 'typescript',
    category: 'utility',
    tags: ['Node.js', 'Security', 'Middleware'],
    code: `interface RateLimitEntry {
  timestamps: number[]
}

class SlidingWindowRateLimiter {
  private store = new Map<string, RateLimitEntry>()

  constructor(
    private readonly limit: number,    // max requests
    private readonly windowMs: number, // window in milliseconds
  ) {}

  check(key: string): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now()
    const windowStart = now - this.windowMs

    const entry = this.store.get(key) ?? { timestamps: [] }

    // Evict timestamps outside the current window
    entry.timestamps = entry.timestamps.filter((t) => t > windowStart)

    const remaining = this.limit - entry.timestamps.length
    const allowed = remaining > 0

    if (allowed) {
      entry.timestamps.push(now)
      this.store.set(key, entry)
    }

    const oldest = entry.timestamps[0] ?? now
    const resetAt = oldest + this.windowMs

    return { allowed, remaining: Math.max(0, remaining - 1), resetAt }
  }
}

// Express middleware usage
const limiter = new SlidingWindowRateLimiter(100, 60_000) // 100 req/min

function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip ?? 'unknown'
  const { allowed, remaining, resetAt } = limiter.check(ip)

  res.setHeader('X-RateLimit-Remaining', remaining)
  res.setHeader('X-RateLimit-Reset', Math.ceil(resetAt / 1000))

  if (!allowed) {
    return res.status(429).json({ error: 'Too Many Requests' })
  }
  next()
}`,
  },
  {
    id: 'game-loop',
    title: 'Fixed Timestep Game Loop',
    description: '물리 연산과 렌더링을 분리해 일정한 게임 속도를 보장하는 루프',
    language: 'typescript',
    category: 'game',
    tags: ['Game', 'Canvas', 'Physics'],
    code: `const FIXED_DT = 1000 / 60  // 60Hz physics tick (ms)
const MAX_FRAME_TIME = 250  // prevent spiral of death

class GameLoop {
  private rafId = 0
  private lastTime = 0
  private accumulator = 0
  private running = false

  constructor(
    private readonly update: (dt: number) => void,   // fixed physics step
    private readonly render: (alpha: number) => void, // interpolated render
  ) {}

  private loop(timestamp: number): void {
    if (!this.running) return

    let frameTime = timestamp - this.lastTime
    if (frameTime > MAX_FRAME_TIME) frameTime = MAX_FRAME_TIME
    this.lastTime = timestamp

    this.accumulator += frameTime

    // Consume accumulated time in fixed steps
    while (this.accumulator >= FIXED_DT) {
      this.update(FIXED_DT / 1000) // seconds
      this.accumulator -= FIXED_DT
    }

    // alpha: how far into the next physics step we are (0–1)
    const alpha = this.accumulator / FIXED_DT
    this.render(alpha)

    this.rafId = requestAnimationFrame((t) => this.loop(t))
  }

  start(): void {
    this.running = true
    this.lastTime = performance.now()
    this.rafId = requestAnimationFrame((t) => this.loop(t))
  }

  stop(): void {
    this.running = false
    cancelAnimationFrame(this.rafId)
  }
}`,
  },
]

const CATEGORIES = [
  { key: 'all', label: '전체' },
  { key: 'algorithm', label: 'Algorithm' },
  { key: 'hook', label: 'Hook' },
  { key: 'utility', label: 'Utility' },
  { key: 'animation', label: 'Animation' },
  { key: 'game', label: 'Game' },
] as const

export default function SnippetsClient() {
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const filtered =
    activeCategory === 'all'
      ? SNIPPETS
      : SNIPPETS.filter((s) => s.category === activeCategory)

  return (
    <main className="min-h-screen bg-[#080808] pt-24 pb-20">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-12">
          <p className="text-neutral-600 font-mono text-xs tracking-widest uppercase mb-3">
            — Code Snippets
          </p>
          <h1 className="text-3xl font-bold text-neutral-100 mb-3">
            잘 짠 코드 조각들
          </h1>
          <p className="text-neutral-500 text-sm max-w-xl">
            실제로 써먹은 패턴들. syntax highlight + AI 한줄 설명과 함께.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-10">
          {CATEGORIES.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveCategory(key)}
              className={[
                'px-4 py-1.5 rounded-full text-xs font-mono transition-colors border',
                activeCategory === key
                  ? 'bg-neutral-100 text-neutral-900 border-neutral-100'
                  : 'bg-transparent text-neutral-500 border-neutral-800 hover:border-neutral-600 hover:text-neutral-300',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map((snippet) => (
            <SnippetCard key={snippet.id} snippet={snippet} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-neutral-600 font-mono text-sm text-center mt-20">
            No snippets found.
          </p>
        )}
      </div>
    </main>
  )
}
