import type { MiniGame } from '../engine'

const PALETTE = ['#ef4444', '#3b82f6', '#eab308', '#22c55e', '#a855f7']
const SEGMENTS = PALETTE.length

interface State {
  angle: number // 0~1 (한 바퀴 비율)
  speed: number // per ms
  targetIndex: number
  round: number
  totalRounds: number
  totalScore: number
  lastHit: 'perfect' | 'good' | 'miss' | null
  flashUntil: number
  elapsed: number
  over: boolean
}

const TOTAL_ROUNDS = 6

function judge(angle: number, targetIndex: number): { hit: 'perfect' | 'good' | 'miss'; pts: number } {
  const segCenter = (targetIndex + 0.5) / SEGMENTS
  let d = Math.abs(angle - segCenter)
  d = Math.min(d, 1 - d) // wrap-around
  const segHalf = 0.5 / SEGMENTS
  if (d <= segHalf * 0.35) return { hit: 'perfect', pts: 100 }
  if (d <= segHalf) return { hit: 'good', pts: 50 }
  return { hit: 'miss', pts: 0 }
}

export const colorSpin: MiniGame<State> = {
  id: 'color-spin',
  title: '컬러 스핀',
  emoji: '🎡',
  instruction: '바늘이 표시된 색 위에 올 때 탭!',
  accentColor: '#a855f7',
  init() {
    return {
      angle: 0,
      speed: 0.00035,
      targetIndex: Math.floor(Math.random() * SEGMENTS),
      round: 1,
      totalRounds: TOTAL_ROUNDS,
      totalScore: 0,
      lastHit: null,
      flashUntil: 0,
      elapsed: 0,
      over: false,
    }
  },
  update(state, input, dt) {
    if (state.over) return state
    let s = { ...state, elapsed: state.elapsed + dt }

    if (input.tapped && s.elapsed > s.flashUntil) {
      const { hit, pts } = judge(s.angle, s.targetIndex)
      s = { ...s, totalScore: s.totalScore + pts, lastHit: hit, flashUntil: s.elapsed + 350 }
      if (s.round >= s.totalRounds) {
        return { ...s, over: true }
      }
      return {
        ...s,
        round: s.round + 1,
        targetIndex: Math.floor(Math.random() * SEGMENTS),
        speed: s.speed + 0.00004,
      }
    }

    let angle = s.angle + s.speed * dt
    if (angle >= 1) angle -= 1
    return { ...s, angle }
  },
  render(ctx, state, W, H) {
    ctx.fillStyle = '#12071a'
    ctx.fillRect(0, 0, W, H)

    const cx = W / 2
    const cy = H * 0.45
    const r = Math.min(W, H) * 0.32

    for (let i = 0; i < SEGMENTS; i++) {
      const a0 = (i / SEGMENTS) * Math.PI * 2 - Math.PI / 2
      const a1 = ((i + 1) / SEGMENTS) * Math.PI * 2 - Math.PI / 2
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, r, a0, a1)
      ctx.closePath()
      ctx.fillStyle = i === state.targetIndex ? PALETTE[i] : `${PALETTE[i]}55`
      ctx.fill()
      if (i === state.targetIndex) {
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 3
        ctx.stroke()
      }
    }

    // 바늘
    const needleAngle = state.angle * Math.PI * 2 - Math.PI / 2
    ctx.strokeStyle = '#f8fafc'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + Math.cos(needleAngle) * r, cy + Math.sin(needleAngle) * r)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(cx, cy, 6, 0, Math.PI * 2)
    ctx.fillStyle = '#f8fafc'
    ctx.fill()

    ctx.fillStyle = '#e2e8f0'
    ctx.font = 'bold 18px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`${state.round} / ${state.totalRounds}`, W / 2, H * 0.12)
    ctx.fillText(`점수 ${state.totalScore}`, W / 2, H * 0.85)

    if (state.lastHit && state.elapsed < state.flashUntil) {
      const label = state.lastHit === 'perfect' ? 'PERFECT!' : state.lastHit === 'good' ? 'GOOD' : 'MISS'
      const color = state.lastHit === 'perfect' ? '#fbbf24' : state.lastHit === 'good' ? '#4ade80' : '#f87171'
      ctx.fillStyle = color
      ctx.font = 'bold 30px sans-serif'
      ctx.fillText(label, W / 2, H * 0.92)
    }
  },
  isOver: (s) => s.over,
  score: (s) => s.totalScore,
  soundEvent: (prev, next) => {
    if (next.lastHit && next.lastHit !== prev.lastHit) {
      if (next.lastHit === 'perfect') return 'perfect'
      if (next.lastHit === 'good') return 'success'
      return 'fail'
    }
    return null
  },
}
