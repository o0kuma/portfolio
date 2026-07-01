import type { MiniGame } from '../engine'

type Phase = 'waiting' | 'ready' | 'go' | 'result' | 'fail'

interface State {
  phase: Phase
  waitFor: number // ms until 'go'
  elapsedInPhase: number
  reactionMs: number | null
  round: number
  totalRounds: number
  times: number[]
  over: boolean
}

const TOTAL_ROUNDS = 3

function randomWait(): number {
  return 800 + Math.random() * 2200
}

export const reaction: MiniGame<State> = {
  id: 'reaction',
  title: '반응속도',
  emoji: '⚡',
  instruction: '화면이 초록으로 바뀌면 최대한 빨리 탭!',
  accentColor: '#eab308',
  init() {
    return {
      phase: 'ready',
      waitFor: randomWait(),
      elapsedInPhase: 0,
      reactionMs: null,
      round: 1,
      totalRounds: TOTAL_ROUNDS,
      times: [],
      over: false,
    }
  },
  update(state, input, dt) {
    if (state.over) return state
    let s = { ...state, elapsedInPhase: state.elapsedInPhase + dt }

    if (s.phase === 'ready') {
      if (input.tapped) {
        // 너무 일찍 탭 → 실패 처리, 재시도 유도
        return { ...s, phase: 'fail', elapsedInPhase: 0 }
      }
      if (s.elapsedInPhase >= s.waitFor) {
        return { ...s, phase: 'go', elapsedInPhase: 0 }
      }
      return s
    }

    if (s.phase === 'go') {
      if (input.tapped) {
        const rt = s.elapsedInPhase
        const times = [...s.times, rt]
        if (s.round >= s.totalRounds) {
          return { ...s, phase: 'result', reactionMs: rt, times, over: true }
        }
        return {
          ...s,
          phase: 'ready',
          reactionMs: rt,
          times,
          round: s.round + 1,
          waitFor: randomWait(),
          elapsedInPhase: 0,
        }
      }
      return s
    }

    if (s.phase === 'fail') {
      if (input.tapped) {
        return { ...s, phase: 'ready', waitFor: randomWait(), elapsedInPhase: 0 }
      }
      return s
    }

    return s
  },
  render(ctx, state, W, H) {
    const bg = state.phase === 'go' ? '#16a34a' : state.phase === 'fail' ? '#b91c1c' : '#1e293b'
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)

    ctx.fillStyle = '#f8fafc'
    ctx.font = 'bold 22px sans-serif'
    ctx.textAlign = 'center'

    if (state.phase === 'ready') {
      ctx.fillText('대기...', W / 2, H / 2)
    } else if (state.phase === 'go') {
      ctx.font = 'bold 32px sans-serif'
      ctx.fillText('지금 탭!', W / 2, H / 2)
    } else if (state.phase === 'fail') {
      ctx.fillText('너무 빨랐어요! 다시 탭해서 재시도', W / 2, H / 2)
    } else if (state.phase === 'result') {
      const avg = Math.round(state.times.reduce((a, b) => a + b, 0) / state.times.length)
      ctx.fillText(`평균 ${avg}ms`, W / 2, H / 2)
    }

    if (state.reactionMs != null && state.phase !== 'go') {
      ctx.fillStyle = '#cbd5e1'
      ctx.font = '16px sans-serif'
      ctx.fillText(`직전 반응: ${Math.round(state.reactionMs)}ms`, W / 2, H / 2 + 40)
    }

    ctx.fillStyle = '#94a3b8'
    ctx.font = 'bold 14px sans-serif'
    ctx.fillText(`${state.round} / ${state.totalRounds}`, W / 2, H * 0.15)
  },
  isOver: (s) => s.over,
  // 평균 반응속도가 빠를수록 높은 점수 (250ms 기준 100점, 느릴수록 감점)
  score: (s) => {
    if (s.times.length === 0) return 0
    const avg = s.times.reduce((a, b) => a + b, 0) / s.times.length
    return Math.max(0, Math.round(300 - avg))
  },
  toCoins: (score) => Math.max(0, Math.floor(score / 15)),
  soundEvent: (prev, next) => {
    if (next.phase === 'go' && prev.phase !== 'go') return 'tick'
    if (next.phase === 'fail' && prev.phase !== 'fail') return 'fail'
    if (prev.phase === 'go' && (next.phase === 'ready' || next.phase === 'result') && next.reactionMs != null) {
      return next.reactionMs < 250 ? 'perfect' : 'success'
    }
    return null
  },
}
