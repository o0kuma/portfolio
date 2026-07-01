import type { MiniGame } from '../engine'

interface Block { x: number; w: number }

interface State {
  stack: Block[] // 쌓인 블록 (아래→위)
  movingX: number // 현재 움직이는 블록의 x (0~1, w 기준 좌측 끝)
  movingW: number
  dir: 1 | -1
  speed: number // per ms
  over: boolean
}

const INITIAL_W = 0.32
const MIN_W = 0.05
const LEVEL_H_RATIO = 0.09 // 화면 높이 대비 블록 한 층 높이

export const stackTower: MiniGame<State> = {
  id: 'stack-tower',
  title: '스택 타워',
  emoji: '🏗️',
  instruction: '움직이는 블록을 탭해서 정확히 쌓으세요!',
  accentColor: '#f97316',
  init() {
    return {
      stack: [{ x: 0.5 - INITIAL_W / 2, w: INITIAL_W }],
      movingX: 0,
      movingW: INITIAL_W,
      dir: 1,
      speed: 0.00045,
      over: false,
    }
  },
  update(state, input, dt) {
    if (state.over) return state
    let s = { ...state }

    if (input.tapped) {
      const base = s.stack[s.stack.length - 1]
      const overlapStart = Math.max(base.x, s.movingX)
      const overlapEnd = Math.min(base.x + base.w, s.movingX + s.movingW)
      const overlapW = overlapEnd - overlapStart

      if (overlapW <= MIN_W * 0.6) {
        return { ...s, over: true }
      }

      const newBlock: Block = { x: overlapStart, w: overlapW }
      const stack = [...s.stack, newBlock]
      const speed = s.speed + 0.00003
      return {
        ...s,
        stack,
        movingX: 0,
        movingW: newBlock.w,
        dir: 1,
        speed,
      }
    }

    let movingX = s.movingX + s.dir * s.speed * dt
    let dir = s.dir
    const maxX = 1 - s.movingW
    if (movingX >= maxX) { movingX = maxX; dir = -1 }
    if (movingX <= 0) { movingX = 0; dir = 1 }
    return { ...s, movingX, dir }
  },
  render(ctx, state, W, H) {
    ctx.fillStyle = '#0f0a05'
    ctx.fillRect(0, 0, W, H)

    const levelH = H * LEVEL_H_RATIO
    const baseY = H * 0.92

    // 카메라: 쌓일수록 위로 스크롤
    const visibleLevels = Math.floor(H * 0.75 / levelH)
    const scrollOffset = Math.max(0, state.stack.length - visibleLevels)

    state.stack.forEach((b, i) => {
      const levelFromBottom = i - scrollOffset
      const y = baseY - (levelFromBottom + 1) * levelH
      if (y < -levelH || y > H) return
      const hue = 24 + (i * 8) % 200
      ctx.fillStyle = `hsl(${hue}, 70%, 55%)`
      ctx.fillRect(b.x * W, y, b.w * W, levelH - 2)
    })

    // 움직이는 블록
    const movingLevel = state.stack.length - scrollOffset
    const movingY = baseY - (movingLevel + 1) * levelH
    ctx.fillStyle = '#fef08a'
    ctx.fillRect(state.movingX * W, movingY, state.movingW * W, levelH - 2)

    ctx.fillStyle = '#e2e8f0'
    ctx.font = 'bold 20px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`높이 ${state.stack.length - 1}`, W / 2, H * 0.1)
  },
  isOver: (s) => s.over,
  score: (s) => (s.stack.length - 1) * 10,
  soundEvent: (prev, next) => {
    if (next.over && !prev.over) return 'fail'
    if (next.stack.length > prev.stack.length) return 'tap'
    return null
  },
}
