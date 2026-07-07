import type { MiniGame } from '../engine'

interface State {
  pos: number // 0~1, 바 위치
  dir: 1 | -1
  speed: number // per ms
  round: number
  totalRounds: number
  totalScore: number
  lastHit: 'perfect' | 'good' | 'miss' | null
  flashUntil: number
  elapsed: number
  over: boolean
}

const TOTAL_ROUNDS = 8
const ZONE_CENTER = 0.5
const PERFECT_RANGE = 0.045
const GOOD_RANGE = 0.12

function judge(pos: number): { hit: 'perfect' | 'good' | 'miss'; pts: number } {
  const d = Math.abs(pos - ZONE_CENTER)
  if (d <= PERFECT_RANGE) return { hit: 'perfect', pts: 100 }
  if (d <= GOOD_RANGE) return { hit: 'good', pts: 50 }
  return { hit: 'miss', pts: 0 }
}

export const tapTiming: MiniGame<State> = {
  id: 'tap-timing',
  title: 'Timing Tap',
  emoji: '🎯',
  instruction: 'Tap when the bar hits the center of the green zone!',
  accentColor: '#22c55e',
  init() {
    return {
      pos: 0,
      dir: 1,
      speed: 0.0011,
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
      const { hit, pts } = judge(s.pos)
      s = {
        ...s,
        totalScore: s.totalScore + pts,
        lastHit: hit,
        flashUntil: s.elapsed + 350,
      }
      if (s.round >= s.totalRounds) {
        s = { ...s, over: true }
      } else {
        // 초반엔 완만하게, 후반엔 가파르게 가속 (곡선형 난이도)
        const increment = 0.00012 + s.round * 0.00008
        s = { ...s, round: s.round + 1, pos: 0, dir: 1, speed: s.speed + increment }
      }
      return s
    }

    let pos = s.pos + s.dir * s.speed * dt
    let dir = s.dir
    if (pos >= 1) { pos = 1; dir = -1 }
    if (pos <= 0) { pos = 0; dir = 1 }
    return { ...s, pos, dir }
  },
  render(ctx, state, W, H) {
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, W, H)

    const barY = H * 0.55
    const barW = W * 0.8
    const barX = (W - barW) / 2
    const barH = 22

    // 트랙
    ctx.fillStyle = '#1e293b'
    ctx.fillRect(barX, barY, barW, barH)

    // 존
    const zoneW = barW * GOOD_RANGE * 2
    ctx.fillStyle = 'rgba(34,197,94,0.35)'
    ctx.fillRect(barX + barW * ZONE_CENTER - zoneW / 2, barY, zoneW, barH)
    const perfectW = barW * PERFECT_RANGE * 2
    ctx.fillStyle = 'rgba(34,197,94,0.8)'
    ctx.fillRect(barX + barW * ZONE_CENTER - perfectW / 2, barY, perfectW, barH)

    // 커서
    const cx = barX + barW * state.pos
    ctx.fillStyle = '#f8fafc'
    ctx.fillRect(cx - 3, barY - 10, 6, barH + 20)

    // 라운드 표시
    ctx.fillStyle = '#94a3b8'
    ctx.font = 'bold 16px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`${state.round} / ${state.totalRounds}`, W / 2, barY - 40)

    // 판정 플래시
    if (state.lastHit && state.elapsed < state.flashUntil) {
      const label = state.lastHit === 'perfect' ? 'PERFECT!' : state.lastHit === 'good' ? 'GOOD' : 'MISS'
      const color = state.lastHit === 'perfect' ? '#fbbf24' : state.lastHit === 'good' ? '#4ade80' : '#f87171'
      ctx.fillStyle = color
      ctx.font = 'bold 34px sans-serif'
      ctx.fillText(label, W / 2, barY + 90)
    }

    ctx.fillStyle = '#e2e8f0'
    ctx.font = 'bold 22px sans-serif'
    ctx.fillText(`점수 ${state.totalScore}`, W / 2, H * 0.25)
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
