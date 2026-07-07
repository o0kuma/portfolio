import type { MiniGame } from '../engine'

interface Block { x: number; y: number; w: number; counted?: boolean }

interface State {
  playerX: number // 0~1
  blocks: Block[]
  speed: number // px/ms (fall speed)
  spawnTimer: number
  spawnEvery: number
  elapsed: number
  survived: number // ms 생존시간(=점수 기반)
  dodged: number // 지나쳐 보낸 블록 수 (콤보 표시용)
  over: boolean
}

const PLAYER_W = 0.12
const PLAYER_Y_RATIO = 0.85
const MIN_GAP = PLAYER_W * 1.8 // 항상 이만큼의 통로는 보장

function spawnRow(): Block[] {
  // 15% 확률로 두 개의 블록을 동시에 스폰하되, 사이에 항상 지나갈 틈을 보장
  if (Math.random() < 0.15) {
    const gapX = Math.random() * (1 - MIN_GAP)
    const leftW = gapX
    const rightW = 1 - (gapX + MIN_GAP)
    const blocks: Block[] = []
    if (leftW > 0.06) blocks.push({ x: 0, y: -0.05, w: leftW })
    if (rightW > 0.06) blocks.push({ x: gapX + MIN_GAP, y: -0.05, w: rightW })
    if (blocks.length > 0) return blocks
  }
  const w = 0.1 + Math.random() * 0.12
  const x = Math.random() * (1 - w)
  return [{ x, y: -0.05, w }]
}

export const dodge: MiniGame<State> = {
  id: 'dodge',
  title: 'Dodge',
  emoji: '🕹️',
  instruction: 'Tap left/right to dodge falling blocks!',
  accentColor: '#ef4444',
  init() {
    return {
      playerX: 0.5,
      blocks: [],
      speed: 0.00028,
      spawnTimer: 0,
      spawnEvery: 900,
      elapsed: 0,
      survived: 0,
      dodged: 0,
      over: false,
    }
  },
  update(state, input, dt) {
    if (state.over) return state
    let s = { ...state, elapsed: state.elapsed + dt, survived: state.survived + dt }

    // 입력: dx로 좌/우 이동 (드래그 감도는 GameCanvas에서 조절)
    let playerX = s.playerX + input.dx
    playerX = Math.max(PLAYER_W / 2, Math.min(1 - PLAYER_W / 2, playerX))

    // 난이도 상승
    const speed = s.speed + s.elapsed * 0.000000045
    const spawnEvery = Math.max(380, 900 - s.elapsed * 0.04)

    let spawnTimer = s.spawnTimer + dt
    let blocks = s.blocks.map((b) => ({ ...b, y: b.y + speed * dt }))
    if (spawnTimer >= spawnEvery) {
      spawnTimer = 0
      blocks.push(...spawnRow())
    }

    // 통과한 블록 카운트 (플레이어 라인을 완전히 지나친 순간 1회)
    let dodged = s.dodged
    blocks = blocks.map((b) => {
      if (!b.counted && b.y > PLAYER_Y_RATIO + 0.06) {
        dodged++
        return { ...b, counted: true }
      }
      return b
    })
    blocks = blocks.filter((b) => b.y < 1.1)

    // 충돌 판정
    const py = PLAYER_Y_RATIO
    for (const b of blocks) {
      if (Math.abs(b.y - py) < 0.045) {
        const px0 = playerX - PLAYER_W / 2
        const px1 = playerX + PLAYER_W / 2
        const bx0 = b.x
        const bx1 = b.x + b.w
        if (px0 < bx1 && px1 > bx0) {
          return { ...s, playerX, blocks, speed, spawnTimer, spawnEvery, dodged, over: true }
        }
      }
    }

    return { ...s, playerX, blocks, speed, spawnTimer, spawnEvery, dodged }
  },
  render(ctx, state, W, H) {
    ctx.fillStyle = '#1c1017'
    ctx.fillRect(0, 0, W, H)

    // 블록 — 위험한 운석 느낌: 몸통 + 하이라이트 + 발광 테두리
    for (const b of state.blocks) {
      const bx = b.x * W
      const by = b.y * H
      const bw = b.w * W
      const bh = 0.045 * H
      ctx.fillStyle = '#7f1d1d'
      ctx.fillRect(bx, by, bw, bh)
      ctx.fillStyle = '#ef4444'
      ctx.fillRect(bx, by, bw, bh * 0.55)
      ctx.fillStyle = 'rgba(255,180,120,0.5)'
      ctx.fillRect(bx, by, bw, 2)
    }

    // 플레이어 — 작은 우주선/캐릭터: 몸통 + 눈 + 추진 불꽃
    const pw = PLAYER_W * W
    const px = state.playerX * W
    const pyTop = PLAYER_Y_RATIO * H - 0.02 * H
    const ph = 0.045 * H
    const cx = px
    const cyc = pyTop + ph / 2
    // 추진 불꽃 (아래로)
    const flick = 0.6 + Math.abs(Math.sin(state.elapsed / 90)) * 0.4
    ctx.fillStyle = '#fb923c'
    ctx.beginPath()
    ctx.moveTo(cx - pw * 0.18, pyTop + ph)
    ctx.lineTo(cx + pw * 0.18, pyTop + ph)
    ctx.lineTo(cx, pyTop + ph + ph * flick)
    ctx.closePath()
    ctx.fill()
    // 몸통 (둥근 삼각형 느낌의 셔틀)
    ctx.fillStyle = '#38bdf8'
    ctx.beginPath()
    ctx.moveTo(cx, pyTop - ph * 0.35)
    ctx.lineTo(cx + pw / 2, pyTop + ph)
    ctx.lineTo(cx - pw / 2, pyTop + ph)
    ctx.closePath()
    ctx.fill()
    // 캐노피 하이라이트
    ctx.fillStyle = '#e0f2fe'
    ctx.beginPath()
    ctx.ellipse(cx, cyc, pw * 0.16, ph * 0.32, 0, 0, Math.PI * 2)
    ctx.fill()
    // 눈
    ctx.fillStyle = '#0c4a6e'
    ctx.beginPath()
    ctx.arc(cx, cyc, pw * 0.06, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#e2e8f0'
    ctx.font = 'bold 20px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`생존 ${(state.survived / 1000).toFixed(1)}s`, W / 2, H * 0.12)

    if (state.dodged > 0) {
      ctx.fillStyle = '#fbbf24'
      ctx.font = 'bold 14px sans-serif'
      ctx.fillText(`회피 ${state.dodged}`, W / 2, H * 0.18)
    }
  },
  isOver: (s) => s.over,
  score: (s) => Math.floor(s.survived / 100), // 0.1초당 1점
  soundEvent: (prev, next) => {
    if (next.over && !prev.over) return 'fail'
    // 500ms마다 짧은 틱으로 생존 리듬감 부여
    if (Math.floor(next.elapsed / 500) > Math.floor(prev.elapsed / 500)) return 'tick'
    return null
  },
}
