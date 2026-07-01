export interface Particle {
  x: number; y: number
  vx: number; vy: number
  life: number; maxLife: number
  color: string
  size: number
}

export function burst(x: number, y: number, color: string, count = 16): Particle[] {
  const particles: Particle[] = []
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4
    const speed = 0.15 + Math.random() * 0.35
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 500 + Math.random() * 250,
      maxLife: 700,
      color,
      size: 2 + Math.random() * 3,
    })
  }
  return particles
}

export function stepParticles(particles: Particle[], dt: number): Particle[] {
  return particles
    .map((p) => ({
      ...p,
      x: p.x + p.vx * dt,
      y: p.y + p.vy * dt + 0.0002 * dt, // 중력
      life: p.life - dt,
    }))
    .filter((p) => p.life > 0)
}

export function renderParticles(ctx: CanvasRenderingContext2D, particles: Particle[], W: number, H: number) {
  for (const p of particles) {
    const alpha = Math.max(0, p.life / p.maxLife)
    ctx.globalAlpha = alpha
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(p.x * W, p.y * H, p.size, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}
