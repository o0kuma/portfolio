'use client'

import { useEffect, useRef } from 'react'

// Am9-ish drone: root, fifth, and a couple of gentle upper voices.
const PAD_FREQS = [110, 164.81, 220, 277.18]

/**
 * "Code commit soundtrack" — a synthesized ambient loop (soft detuned pad +
 * irregular filtered-noise keyboard clicks) that plays while the visitor
 * browses. Everything is generated with the Web Audio API at runtime, so
 * there's no audio asset to host or license.
 */
export default function AmbientSoundtrack() {
  // Mounted only while the footer's "배경음" setting is on (see
  // AmbientSoundtrackClient), so it simply plays for as long as it is mounted.
  const on = true
  const ctxRef = useRef<AudioContext | null>(null)
  const masterRef = useRef<GainNode | null>(null)
  const oscillatorsRef = useRef<OscillatorNode[]>([])
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  function scheduleTypingClick(ctx: AudioContext, master: GainNode) {
    const bufferSize = Math.floor(ctx.sampleRate * 0.03)
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25))
    }

    const source = ctx.createBufferSource()
    source.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.value = 1800 + Math.random() * 1200

    const clickGain = ctx.createGain()
    clickGain.gain.value = 0.05 + Math.random() * 0.03

    source.connect(filter)
    filter.connect(clickGain)
    clickGain.connect(master)
    source.start()

    const nextDelay = 90 + Math.random() * 260
    typingTimerRef.current = setTimeout(() => {
      if (ctxRef.current) scheduleTypingClick(ctxRef.current, master)
    }, nextDelay)

    // Occasional pause, like a developer thinking between bursts of typing.
    if (Math.random() < 0.06) {
      clearTimeout(typingTimerRef.current)
      typingTimerRef.current = setTimeout(() => {
        if (ctxRef.current) scheduleTypingClick(ctxRef.current, master)
      }, 1200 + Math.random() * 1800)
    }
  }

  function start() {
    if (ctxRef.current) return
    const ctx = new AudioContext()
    ctxRef.current = ctx

    const master = ctx.createGain()
    master.gain.value = 0
    master.connect(ctx.destination)
    master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 1.5)
    masterRef.current = master

    const padGain = ctx.createGain()
    padGain.gain.value = 0.16
    padGain.connect(master)

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 900
    filter.connect(padGain)

    const lfo = ctx.createOscillator()
    lfo.frequency.value = 0.05
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 250
    lfo.connect(lfoGain)
    lfoGain.connect(filter.frequency)
    lfo.start()
    oscillatorsRef.current.push(lfo)

    PAD_FREQS.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      osc.type = i % 2 === 0 ? 'sine' : 'triangle'
      osc.frequency.value = freq
      osc.detune.value = (Math.random() - 0.5) * 8
      osc.connect(filter)
      osc.start()
      oscillatorsRef.current.push(osc)
    })

    scheduleTypingClick(ctx, master)
  }

  function stop() {
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    const ctx = ctxRef.current
    const master = masterRef.current
    if (ctx && master) {
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8)
      setTimeout(() => {
        oscillatorsRef.current.forEach((o) => { try { o.stop() } catch {} })
        oscillatorsRef.current = []
        ctx.close().catch(() => {})
        ctxRef.current = null
        masterRef.current = null
      }, 900)
    }
  }

  useEffect(() => {
    if (on) start()
    else stop()
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on])

  // A saved "on" preference restored on mount has no user gesture attached,
  // so autoplay policy leaves the context suspended — resume it on the
  // visitor's first interaction with the page.
  useEffect(() => {
    if (!on) return
    const resume = () => { ctxRef.current?.resume().catch(() => {}) }
    window.addEventListener('pointerdown', resume, { once: true })
    window.addEventListener('keydown', resume, { once: true })
    return () => {
      window.removeEventListener('pointerdown', resume)
      window.removeEventListener('keydown', resume)
    }
  }, [on])

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
      ctxRef.current?.close().catch(() => {})
    }
  }, [])

  return null
}
