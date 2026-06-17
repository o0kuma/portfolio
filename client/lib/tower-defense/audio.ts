/**
 * Tiny Web-Audio SFX for Tower Defense. No asset files — every sound is a short
 * oscillator blip. SSR-safe: the AudioContext is lazily created on the first
 * play() call (which only ever happens after a user gesture starts the game).
 */
const MUTE_KEY = 'tower-defense-muted'

export type SfxEvent = 'shoot' | 'hit' | 'place' | 'evolve' | 'wave' | 'over'

type ToneSpec = {
  freq: number
  endFreq?: number
  dur: number
  type: OscillatorType
  gain: number
}

const TONES: Record<SfxEvent, ToneSpec> = {
  shoot: { freq: 660, endFreq: 420, dur: 0.07, type: 'square', gain: 0.05 },
  hit: { freq: 240, endFreq: 140, dur: 0.06, type: 'triangle', gain: 0.05 },
  place: { freq: 520, endFreq: 760, dur: 0.12, type: 'sine', gain: 0.08 },
  evolve: { freq: 380, endFreq: 1100, dur: 0.45, type: 'sawtooth', gain: 0.09 },
  wave: { freq: 300, endFreq: 600, dur: 0.22, type: 'square', gain: 0.07 },
  over: { freq: 320, endFreq: 80, dur: 0.6, type: 'sawtooth', gain: 0.09 },
}

class TdAudio {
  private ctx: AudioContext | null = null
  private muted = false
  private loaded = false

  private ensureLoaded(): void {
    if (this.loaded || typeof window === 'undefined') return
    this.loaded = true
    try {
      this.muted = window.localStorage.getItem(MUTE_KEY) === '1'
    } catch {
      this.muted = false
    }
  }

  isMuted(): boolean {
    this.ensureLoaded()
    return this.muted
  }

  toggleMute(): boolean {
    this.ensureLoaded()
    this.muted = !this.muted
    try {
      window.localStorage.setItem(MUTE_KEY, this.muted ? '1' : '0')
    } catch {
      /* ignore */
    }
    return this.muted
  }

  private getCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext
      if (!Ctor) return null
      this.ctx = new Ctor()
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume()
    return this.ctx
  }

  play(event: SfxEvent): void {
    this.ensureLoaded()
    if (this.muted) return
    const ctx = this.getCtx()
    if (!ctx) return
    const spec = TONES[event]
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = spec.type
    osc.frequency.setValueAtTime(spec.freq, now)
    if (spec.endFreq) {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(1, spec.endFreq),
        now + spec.dur,
      )
    }
    gain.gain.setValueAtTime(spec.gain, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + spec.dur)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + spec.dur + 0.02)
  }
}

export const tdAudio = new TdAudio()
