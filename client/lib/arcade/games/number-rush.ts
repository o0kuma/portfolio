import type { MiniGame } from '../engine'

interface Cell { n: number; x: number; y: number; hit: boolean }

interface State {
  cells: Cell[]
  next: number // 다음에 눌러야 할 숫자
  cols: number
  rows: number
  elapsed: number
  mistakes: number
  over: boolean
  finishedAt: number | null
}

const COLS = 3
const ROWS = 3
const TOTAL = COLS * ROWS

function shuffledCells(): Cell[] {
  const nums = Array.from({ length: TOTAL }, (_, i) => i + 1)
  for (let i = nums.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[nums[i], nums[j]] = [nums[j], nums[i]]
  }
  const cells: Cell[] = []
  let idx = 0
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      cells.push({
        n: nums[idx++],
        x: (c + 0.5) / COLS,
        y: 0.22 + (r + 0.5) / ROWS * 0.65,
        hit: false,
      })
    }
  }
  return cells
}

export const numberRush: MiniGame<State> = {
  id: 'number-rush',
  title: '숫자 순서',
  emoji: '🔢',
  instruction: '1부터 9까지 순서대로 빠르게 탭!',
  accentColor: '#38bdf8',
  init() {
    return { cells: shuffledCells(), next: 1, cols: COLS, rows: ROWS, elapsed: 0, mistakes: 0, over: false, finishedAt: null }
  },
  update(state, input, dt) {
    if (state.over) return state
    let s = { ...state, elapsed: state.elapsed + dt }

    if (input.tapped) {
      const cellW = 1 / s.cols
      const cellH = 0.65 / s.rows
      let mistakes = s.mistakes
      let next = s.next
      const cells = s.cells.map((cell) => {
        if (cell.hit) return cell
        const dx = Math.abs(input.tapX - cell.x)
        const dy = Math.abs(input.tapY - cell.y)
        if (dx < cellW / 2 && dy < cellH / 2) {
          if (cell.n === next) {
            next++
            return { ...cell, hit: true }
          }
          mistakes++
        }
        return cell
      })
      const over = next > TOTAL
      s = { ...s, cells, next, mistakes, over, finishedAt: over ? s.elapsed : null }
    }
    return s
  },
  render(ctx, state, W, H) {
    ctx.fillStyle = '#0b1220'
    ctx.fillRect(0, 0, W, H)

    ctx.fillStyle = '#e2e8f0'
    ctx.font = 'bold 20px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`다음: ${state.next > 9 ? '완료!' : state.next}`, W / 2, H * 0.12)
    ctx.fillStyle = '#f87171'
    ctx.font = '13px sans-serif'
    ctx.fillText(`실수 ${state.mistakes}`, W / 2, H * 0.18)

    const r = Math.min(W / state.cols, H * 0.65 / state.rows) * 0.36
    for (const cell of state.cells) {
      const cx = cell.x * W
      const cy = cell.y * H
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fillStyle = cell.hit ? '#1e293b' : '#38bdf8'
      ctx.fill()
      if (!cell.hit) {
        ctx.fillStyle = '#0b1220'
        ctx.font = `bold ${Math.round(r * 0.9)}px sans-serif`
        ctx.textBaseline = 'middle'
        ctx.fillText(String(cell.n), cx, cy + 2)
        ctx.textBaseline = 'alphabetic'
      }
    }

    if (state.over) {
      ctx.fillStyle = '#4ade80'
      ctx.font = 'bold 22px sans-serif'
      ctx.fillText(`${(state.finishedAt! / 1000).toFixed(2)}초 완료!`, W / 2, H * 0.92)
    }
  },
  isOver: (s) => s.over,
  // 빠를수록, 실수 적을수록 고득점. 기준 4초=100점.
  score: (s) => {
    if (!s.over || s.finishedAt == null) return 0
    const base = Math.max(0, Math.round(400 - s.finishedAt / 10))
    return Math.max(0, base - s.mistakes * 15)
  },
  soundEvent: (prev, next) => {
    if (next.mistakes > prev.mistakes) return 'fail'
    if (next.next > prev.next) return next.over ? 'perfect' : 'tap'
    return null
  },
}
