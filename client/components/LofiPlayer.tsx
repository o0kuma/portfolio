'use client'
import { useState, useRef, useEffect } from 'react'

const STATIONS = [
  { name: 'Lofi Hip Hop', youtubeId: 'jfKfPfyJRdk' },        // lofi girl
  { name: 'Chill Beats', youtubeId: '5qap5aO4i9A' },          // lofi hip hop
  { name: 'Jazz Lofi', youtubeId: 'kgx4WGK0oNU' },            // jazz lofi
]

export default function LofiPlayer() {
  const [isOpen, setIsOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [volume, setVolume] = useState(50)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // YouTube iframe API: play/pause via postMessage
  const sendYT = (cmd: string) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func: cmd, args: [] }),
      '*'
    )
  }

  const togglePlay = () => {
    if (isPlaying) { sendYT('pauseVideo') } else { sendYT('playVideo') }
    setIsPlaying(p => !p)
  }

  const switchStation = (idx: number) => {
    setCurrent(idx)
    setIsPlaying(true) // auto-play on switch
  }

  return (
    <>
      {/* Toggle button - bottom left */}
      <button
        onClick={() => setIsOpen(o => !o)}
        style={{ position: 'fixed', bottom: '24px', left: '24px', zIndex: 9998, pointerEvents: 'auto' }}
        className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center hover:border-neutral-500 transition-colors"
        title="lofi 음악"
      >
        {isPlaying ? (
          <span className="text-sm animate-pulse">🎵</span>
        ) : (
          <span className="text-sm opacity-50">🎵</span>
        )}
      </button>

      {/* Player panel */}
      {isOpen && (
        <div
          style={{ position: 'fixed', bottom: '72px', left: '24px', zIndex: 9998, pointerEvents: 'auto' }}
          className="w-64 bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl"
        >
          {/* Hidden YouTube iframe */}
          <iframe
            ref={iframeRef}
            width="0"
            height="0"
            src={`https://www.youtube.com/embed/${STATIONS[current].youtubeId}?enablejsapi=1&autoplay=${isPlaying ? 1 : 0}&loop=1&playlist=${STATIONS[current].youtubeId}`}
            allow="autoplay"
            style={{ display: 'none' }}
          />

          {/* Album art / visualizer */}
          <div className="h-32 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 relative flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500 via-transparent to-transparent" />
            {/* Fake visualizer bars */}
            {isPlaying && (
              <div className="flex items-end gap-0.5 h-12">
                {Array.from({length: 12}).map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-purple-400/60 rounded-sm"
                    style={{
                      height: `${20 + Math.random() * 80}%`,
                      animation: `lofi-bar ${0.4 + Math.random() * 0.6}s ease-in-out infinite alternate`,
                      animationDelay: `${i * 0.05}s`,
                    }}
                  />
                ))}
              </div>
            )}
            {!isPlaying && <span className="text-4xl opacity-30">🎵</span>}
            <div className="absolute bottom-2 left-3 right-3">
              <p className="text-xs text-neutral-300 font-mono truncate">{STATIONS[current].name}</p>
              <p className="text-xs text-neutral-600 font-mono">lofi beats</p>
            </div>
          </div>

          {/* Controls */}
          <div className="p-3 space-y-3">
            {/* Play/pause + station name */}
            <div className="flex items-center justify-between">
              <button
                onClick={togglePlay}
                className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-sm transition-colors"
              >
                {isPlaying ? '⏸' : '▶'}
              </button>
              <div className="flex gap-1">
                {STATIONS.map((s, i) => (
                  <button
                    key={s.youtubeId}
                    onClick={() => switchStation(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${current === i ? 'bg-purple-400' : 'bg-neutral-700 hover:bg-neutral-500'}`}
                    title={s.name}
                  />
                ))}
              </div>
              <button
                onClick={() => switchStation((current + 1) % STATIONS.length)}
                className="text-neutral-500 hover:text-neutral-300 text-sm transition-colors"
              >
                ⏭
              </button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-600">🔈</span>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={e => {
                  setVolume(+e.target.value)
                  sendYT(`setVolume:${e.target.value}`)
                }}
                className="flex-1 h-0.5 accent-purple-400"
              />
              <span className="text-xs text-neutral-600">🔊</span>
            </div>

            {/* Station list */}
            <div className="space-y-1">
              {STATIONS.map((s, i) => (
                <button
                  key={s.youtubeId}
                  onClick={() => switchStation(i)}
                  className={`w-full text-left text-xs px-2 py-1.5 rounded-lg transition-colors ${
                    current === i
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800'
                  }`}
                >
                  {current === i && isPlaying ? '♪ ' : '  '}{s.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes lofi-bar {
          from { transform: scaleY(0.3); }
          to { transform: scaleY(1); }
        }
      `}</style>
    </>
  )
}
