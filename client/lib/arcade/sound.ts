'use client'

// 외부 에셋 없이 WebAudio로 만든 짧은 비프음. 실패해도 게임에는 영향 없음(사운드는 부가효과).

let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      ctx = new AC()
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})
    return ctx
  } catch {
    return null
  }
}

function beep(freq: number, durationMs: number, type: OscillatorType = 'sine', volume = 0.06) {
  const c = getCtx()
  if (!c) return
  try {
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.type = type
    osc.frequency.value = freq
    gain.gain.value = volume
    osc.connect(gain)
    gain.connect(c.destination)
    const now = c.currentTime
    gain.gain.setValueAtTime(volume, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + durationMs / 1000)
    osc.start(now)
    osc.stop(now + durationMs / 1000)
  } catch {
    // ignore
  }
}

export const sfx = {
  tap: () => beep(320, 60, 'square', 0.04),
  tick: () => beep(880, 40, 'sine', 0.03),
  success: () => { beep(660, 90, 'triangle', 0.06); setTimeout(() => beep(990, 110, 'triangle', 0.06), 90) },
  perfect: () => { beep(880, 80, 'triangle', 0.07); setTimeout(() => beep(1320, 140, 'triangle', 0.07), 80) },
  fail: () => beep(140, 220, 'sawtooth', 0.06),
}

export function vibrate(ms: number) {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(ms)
  } catch {
    // ignore
  }
}
