'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { FiArrowLeft, FiRefreshCw } from 'react-icons/fi'
import { AnimatePresence, motion } from 'framer-motion'
import LottoBall, { ballColor } from '@/components/lotto/LottoBall'
import LottoLeaderboard from '@/components/lotto/LottoLeaderboard'
import { recommend, analyze, STRATEGY_INFO, type Strategy, type RecommendStats } from '@/lib/lotto/recommend'

type Mode = 'sim' | 'history' | 'auto'

interface DrawResult {
  drawn: number[]
  bonus: number
  matched: number
  rank: number
  prize: number
  cost: number
  drawNo: number | null
}

const RANK_LABEL: Record<number, string> = {
  1: '🎉 1등 당첨!',
  2: '🥈 2등 당첨!',
  3: '🥉 3등 당첨!',
  4: '4등 당첨',
  5: '5등 당첨',
  0: '꽝 — 다음 기회에',
}

const NUMBERS = Array.from({ length: 45 }, (_, i) => i + 1)

function getSessionId(): string {
  const KEY = 'lotto_session_id'
  let id = ''
  try {
    id = localStorage.getItem(KEY) ?? ''
    if (!id) {
      id = crypto.randomUUID().replace(/-/g, '')
      localStorage.setItem(KEY, id)
    }
  } catch {
    id = Math.random().toString(36).slice(2)
  }
  return id
}

function formatKRW(n: number): string {
  if (n >= 100_000_000) return `${(n / 100_000_000).toLocaleString(undefined, { maximumFractionDigits: 1 })}억원`
  if (n >= 10_000) return `${Math.round(n / 10_000).toLocaleString()}만원`
  return `${n.toLocaleString()}원`
}

// 클라이언트 측 빠른 추첨 (auto 모드 전용 — 리더보드 미반영)
function localDraw(): { drawn: number[]; bonus: number } {
  const pool = [...NUMBERS]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return { drawn: pool.slice(0, 6).sort((a, b) => a - b), bonus: pool[6] }
}
function localJudge(picked: number[], drawn: number[], bonus: number): number {
  const set = new Set(drawn)
  const m = picked.filter((n) => set.has(n)).length
  if (m === 6) return 1
  if (m === 5 && picked.includes(bonus)) return 2
  if (m === 5) return 3
  if (m === 4) return 4
  if (m === 3) return 5
  return 0
}

export default function LottoPageClient() {
  const [mode, setMode] = useState<Mode>('sim')
  const [picked, setPicked] = useState<number[]>([])
  const [playerName, setPlayerName] = useState('')
  const [drawing, setDrawing] = useState(false)
  const [revealed, setRevealed] = useState(0) // 공개된 공 개수 (애니메이션)
  const [result, setResult] = useState<DrawResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [profit, setProfit] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)

  // auto 모드 상태
  const [autoRunning, setAutoRunning] = useState(false)
  const [autoStats, setAutoStats] = useState<{ tickets: number; best: number; spent: number; counts: Record<number, number> } | null>(null)
  const autoStopRef = useRef(false)

  // 통계(빈도) — 있으면 핫/콜드 추천 활성화
  const [stats, setStats] = useState<(RecommendStats & { counts?: { n: number; count: number }[]; latestDraw?: number; totalDraws?: number }) | null>(null)
  const [statsAvailable, setStatsAvailable] = useState(false)
  const [lastStrategy, setLastStrategy] = useState<Strategy | null>(null)

  const sessionId = useMemo(() => (typeof window !== 'undefined' ? getSessionId() : ''), [])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lotto_player_name')
      if (saved) setPlayerName(saved)
    } catch {}
  }, [])

  useEffect(() => {
    fetch('/api/lotto/stats')
      .then((r) => r.json())
      .then((d) => {
        if (d?.available) {
          setStats({ hot: d.hot, cold: d.cold, counts: d.counts, latestDraw: d.latestDraw, totalDraws: d.totalDraws })
          setStatsAvailable(true)
        }
      })
      .catch(() => {})
  }, [])

  const applyRecommendation = (strategy: Strategy) => {
    if (drawing || autoRunning) return
    const combo = recommend(strategy, statsAvailable ? stats : null)
    setPicked(combo)
    setLastStrategy(strategy)
    setResult(null)
  }

  const toggleNumber = (n: number) => {
    if (drawing) return
    setPicked((prev) => {
      if (prev.includes(n)) return prev.filter((x) => x !== n)
      if (prev.length >= 6) return prev
      return [...prev, n].sort((a, b) => a - b)
    })
  }

  const autoFill = () => {
    if (drawing) return
    const pool = [...NUMBERS]
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[pool[i], pool[j]] = [pool[j], pool[i]]
    }
    setPicked(pool.slice(0, 6).sort((a, b) => a - b))
  }

  const reset = () => {
    if (drawing) return
    setPicked([])
    setResult(null)
    setError(null)
  }

  // 선택한 번호를 로또 용지 스타일 이미지로 저장
  const saveTicketImage = useCallback(() => {
    if (picked.length !== 6) return
    const W = 600, H = 280
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 배경
    const grad = ctx.createLinearGradient(0, 0, W, H)
    grad.addColorStop(0, '#0f172a')
    grad.addColorStop(1, '#1e1b4b')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)

    ctx.fillStyle = '#fbbf24'
    ctx.font = 'bold 28px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('🎰 LOTTO 6/45', 32, 56)

    ctx.fillStyle = '#94a3b8'
    ctx.font = '14px sans-serif'
    ctx.fillText(lastStrategy ? `${STRATEGY_INFO[lastStrategy].emoji} ${STRATEGY_INFO[lastStrategy].label}` : '내 행운의 번호', 32, 82)

    // 번호 공
    const colorOf = (n: number) =>
      n <= 10 ? '#fbc400' : n <= 20 ? '#69c8f2' : n <= 30 ? '#ff7272' : n <= 40 ? '#aaaaaa' : '#b0d840'
    const r = 36
    const gap = (W - 64 - r * 2 * 6) / 5
    picked.forEach((n, i) => {
      const cx = 32 + r + i * (r * 2 + gap)
      const cy = 160
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fillStyle = colorOf(n)
      ctx.fill()
      ctx.fillStyle = '#000'
      ctx.font = 'bold 26px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(n), cx, cy)
    })

    ctx.fillStyle = '#64748b'
    ctx.font = '13px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'
    ctx.fillText('kuuuma.com · 로또 번호 추천', W / 2, H - 28)

    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `lotto-${picked.join('-')}.png`
    a.click()
  }, [picked, lastStrategy])

  const drawnSet = useMemo(() => new Set(result?.drawn ?? []), [result])

  const submitDraw = useCallback(async () => {
    if (picked.length !== 6 || drawing) return
    setDrawing(true)
    setError(null)
    setResult(null)
    setRevealed(0)

    try {
      const res = await fetch('/api/lotto/draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          picked,
          mode,
          playerName: playerName.trim() || undefined,
          sessionId,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message ?? '추첨에 실패했습니다.')
        setDrawing(false)
        return
      }
      const r = data as DrawResult
      setResult(r)

      // 공 하나씩 공개
      for (let i = 1; i <= 7; i++) {
        await new Promise((rs) => setTimeout(rs, 450))
        setRevealed(i)
      }
      await new Promise((rs) => setTimeout(rs, 300))

      setProfit((p) => p + r.prize - r.cost)
      if (playerName.trim()) {
        try { localStorage.setItem('lotto_player_name', playerName.trim()) } catch {}
      }
      setRefreshKey((k) => k + 1)
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setDrawing(false)
    }
  }, [picked, drawing, mode, playerName, sessionId])

  // ── auto 모드: 1등 나올 때까지 ──
  const runAuto = useCallback(async () => {
    if (picked.length !== 6) return
    setAutoRunning(true)
    autoStopRef.current = false
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    let tickets = 0
    let best = 99
    const MAX = 5_000_000
    const start = performance.now()

    while (!autoStopRef.current && tickets < MAX) {
      // 배치로 돌려 UI 블로킹 최소화
      for (let i = 0; i < 5000; i++) {
        const { drawn, bonus } = localDraw()
        const rank = localJudge(picked, drawn, bonus)
        tickets++
        if (rank > 0) {
          counts[rank]++
          if (rank < best) best = rank
        }
        if (rank === 1) { autoStopRef.current = true; break }
      }
      setAutoStats({ tickets, best: best === 99 ? 0 : best, spent: tickets * 1000, counts: { ...counts } })
      await new Promise((rs) => setTimeout(rs, 0))
      if (performance.now() - start > 30_000) break // 안전장치
    }
    setAutoRunning(false)
  }, [picked])

  const canDraw = picked.length === 6 && !drawing && !autoRunning

  return (
    <div className="min-h-screen bg-slate-950 pb-20 text-white">
      {/* nav */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-3">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white">
            <FiArrowLeft className="h-4 w-4" /> 메인으로
          </Link>
          <span className="text-sm font-semibold text-slate-200">🎰 로또 6/45</span>
          <Link href="/games" className="ml-auto text-xs font-semibold text-slate-400 hover:text-white">게임 허브 →</Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pt-8">
        <div className="mb-6 text-center">
          <h1 className="font-display mb-2 text-4xl font-bold">🎰 로또 번호 맞추기</h1>
          <p className="text-sm text-slate-400">번호 6개를 고르고 추첨에 도전하세요</p>
        </div>

        {/* 모드 선택 */}
        <div className="mb-6 flex justify-center gap-2">
          {([
            ['sim', '🎲 시뮬레이션'],
            ['history', '📜 역대 회차 도전'],
            ['auto', '⚡ 무한 자동'],
          ] as const).map(([m, label]) => (
            <button
              key={m}
              onClick={() => { setMode(m); setResult(null); setAutoStats(null); setError(null) }}
              disabled={drawing || autoRunning}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
                mode === m ? 'bg-amber-500 text-black' : 'border border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-500'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <p className="mb-4 text-center text-xs text-slate-500">
          {mode === 'sim' && '서버에서 6개+보너스를 추첨해 등수를 판정합니다.'}
          {mode === 'history' && '실제 역대 당첨 회차(무작위)와 비교합니다. "그때 샀다면?"'}
          {mode === 'auto' && '1등이 나올 때까지 자동으로 구매를 반복합니다. (브라우저 계산, 랭킹 미반영)'}
        </p>

        {/* 추천 번호 패널 */}
        <div className="mb-5 rounded-2xl border border-amber-700/40 bg-amber-950/10 p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-sm font-semibold text-amber-300">📊 추천 번호</span>
            {statsAvailable && stats?.totalDraws ? (
              <span className="text-[11px] text-slate-500">역대 {stats.totalDraws}회차 통계 기반</span>
            ) : (
              <span className="text-[11px] text-slate-500">통계적 밸런스 기반</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {(['balanced', 'hot', 'cold', 'mix'] as Strategy[]).map((s) => {
              const info = STRATEGY_INFO[s]
              const needsStats = s !== 'balanced'
              const disabled = drawing || autoRunning
              return (
                <button
                  key={s}
                  onClick={() => applyRecommendation(s)}
                  disabled={disabled}
                  title={needsStats && !statsAvailable ? `${info.desc} (통계 미적재 시 밸런스로 대체)` : info.desc}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-40 ${
                    lastStrategy === s
                      ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                      : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-amber-600/60'
                  }`}
                >
                  {info.emoji} {info.label}
                </button>
              )
            })}
          </div>
          {lastStrategy && (
            <p className="mt-2.5 text-[11px] text-slate-500">
              {STRATEGY_INFO[lastStrategy].emoji} {STRATEGY_INFO[lastStrategy].desc}
              {lastStrategy !== 'balanced' && !statsAvailable && ' — 통계 미적재로 밸런스 적용됨'}
            </p>
          )}
          {/* 빈도 미니 차트 */}
          {statsAvailable && stats?.counts && (
            <div className="mt-4">
              <p className="mb-1.5 text-[11px] font-semibold text-slate-400">번호별 출현 빈도</p>
              <div className="flex items-end gap-[2px]" style={{ height: 48 }}>
                {(() => {
                  const max = Math.max(...stats.counts.map((c) => c.count), 1)
                  return stats.counts.map((c) => (
                    <div
                      key={c.n}
                      title={`${c.n}번: ${c.count}회`}
                      className="flex-1 rounded-sm"
                      style={{ height: `${Math.max(8, (c.count / max) * 100)}%`, backgroundColor: ballColor(c.n), opacity: 0.75 }}
                    />
                  ))
                })()}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
                <span className="text-slate-500">🔥 핫: <span className="text-orange-300">{stats.hot.slice(0, 5).join(', ')}</span></span>
                <span className="text-slate-500">❄️ 콜드: <span className="text-sky-300">{stats.cold.slice(0, 5).join(', ')}</span></span>
              </div>
            </div>
          )}
        </div>

        {/* 번호 선택판 */}
        <div className="mb-5 rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-300">번호 선택 <span className="text-amber-400">{picked.length}/6</span></span>
            <div className="flex gap-2">
              <button onClick={autoFill} disabled={drawing || autoRunning} className="rounded-lg bg-slate-800 px-3 py-1 text-xs text-slate-300 hover:bg-slate-700 disabled:opacity-50">자동</button>
              <button onClick={reset} disabled={drawing || autoRunning} className="rounded-lg bg-slate-800 px-3 py-1 text-xs text-slate-300 hover:bg-slate-700 disabled:opacity-50">초기화</button>
            </div>
          </div>
          <div className="grid grid-cols-6 gap-2 sm:grid-cols-9 sm:gap-1.5">
            {NUMBERS.map((n) => {
              const sel = picked.includes(n)
              return (
                <button
                  key={n}
                  onClick={() => toggleNumber(n)}
                  disabled={drawing || autoRunning}
                  className={`flex aspect-square items-center justify-center rounded-full text-xs font-bold transition disabled:cursor-not-allowed ${
                    sel ? 'scale-105 text-black shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                  style={sel ? { backgroundColor: ['#fbc400','#69c8f2','#ff7272','#aaaaaa','#b0d840'][Math.floor((n-1)/10)] ?? '#b0d840' } : undefined}
                >
                  {n}
                </button>
              )
            })}
          </div>
        </div>

        {/* 조합 분석 카드 */}
        {picked.length === 6 && (
          <div className="mb-5 rounded-2xl border border-slate-700 bg-slate-900/40 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-300">🔍 내 조합 분석</span>
              <button
                onClick={saveTicketImage}
                disabled={drawing || autoRunning}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-300 hover:border-amber-600/60 disabled:opacity-50"
              >
                🖼️ 이미지 저장
              </button>
            </div>
            {(() => {
              const a = analyze(picked)
              const items = [
                { label: '홀:짝', value: `${a.odd}:${6 - a.odd}`, ok: a.odd >= 2 && a.odd <= 4 },
                { label: '고:저', value: `${6 - a.low}:${a.low}`, ok: a.low >= 2 && a.low <= 4 },
                { label: '합계', value: `${a.sum}`, ok: a.sum >= 100 && a.sum <= 175 },
                { label: '연속수', value: a.maxConsecutive <= 1 ? '없음' : `${a.maxConsecutive}연속`, ok: a.maxConsecutive <= 2 },
                { label: '끝수종류', value: `${a.distinctLastDigits}종`, ok: a.distinctLastDigits >= 4 },
              ]
              return (
                <>
                  <div className="grid grid-cols-5 gap-2 text-center">
                    {items.map((it) => (
                      <div key={it.label} className={`rounded-lg border py-2 ${it.ok ? 'border-emerald-700/40 bg-emerald-950/20' : 'border-amber-700/40 bg-amber-950/20'}`}>
                        <p className="text-[10px] text-slate-500">{it.label}</p>
                        <p className={`text-sm font-bold ${it.ok ? 'text-emerald-300' : 'text-amber-300'}`}>{it.value}</p>
                        <p className="text-[10px]">{it.ok ? '✓' : '!'}</p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2.5 text-center text-[11px] text-slate-500">
                    {a.passed
                      ? '✅ 역대 1등 조합들이 가진 통계적 균형을 모두 만족합니다.'
                      : '⚠️ 일부 항목이 통계적 평균에서 벗어나 있습니다. (재미로만 참고)'}
                  </p>
                </>
              )
            })()}
          </div>
        )}

        {/* 이름 + 추첨 버튼 */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value.slice(0, 20))}
            placeholder="닉네임 (랭킹 등록용, 선택)"
            disabled={drawing || autoRunning}
            className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none"
          />
          {mode === 'auto' ? (
            autoRunning ? (
              <button onClick={() => { autoStopRef.current = true }} className="rounded-lg bg-red-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-red-500">정지</button>
            ) : (
              <button onClick={runAuto} disabled={picked.length !== 6} className="rounded-lg bg-amber-500 px-6 py-2.5 text-sm font-bold text-black transition hover:bg-amber-400 disabled:opacity-40">⚡ 1등까지 자동</button>
            )
          ) : (
            <button onClick={submitDraw} disabled={!canDraw} className="rounded-lg bg-amber-500 px-6 py-2.5 text-sm font-bold text-black transition hover:bg-amber-400 disabled:opacity-40">
              {drawing ? '추첨 중...' : '🎰 추첨하기'}
            </button>
          )}
        </div>

        {error && <p className="mb-4 rounded-lg border border-red-800 bg-red-950/40 px-4 py-2 text-sm text-red-300">{error}</p>}

        {/* 결과 */}
        <AnimatePresence mode="wait">
          {result && mode !== 'auto' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-8 rounded-2xl border border-slate-700 bg-slate-900/80 p-6"
            >
              {result.drawNo != null && (
                <p className="mb-3 text-center text-xs font-semibold text-amber-400">제 {result.drawNo}회 당첨번호</p>
              )}
              <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
                {result.drawn.map((n, i) => (
                  <span key={n} className={revealed > i ? 'opacity-100' : 'opacity-0'} style={{ transition: 'opacity .3s' }}>
                    <LottoBall n={n} size="lg" highlight={picked.includes(n)} />
                  </span>
                ))}
                <span className="px-1 text-2xl text-slate-600">+</span>
                <span className={revealed >= 7 ? 'opacity-100' : 'opacity-0'} style={{ transition: 'opacity .3s' }}>
                  <LottoBall n={result.bonus} size="lg" highlight={picked.includes(result.bonus)} />
                </span>
              </div>

              {revealed >= 7 && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                  <p className={`mb-1 text-2xl font-black ${result.rank === 1 ? 'text-amber-400' : result.rank > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {RANK_LABEL[result.rank]}
                  </p>
                  <p className="text-sm text-slate-400">{result.matched}개 일치{picked.includes(result.bonus) ? ' + 보너스' : ''}</p>
                  {result.prize > 0 && <p className="mt-2 text-lg font-bold text-amber-300">당첨금 {formatKRW(result.prize)}</p>}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* auto 결과 */}
        {autoStats && mode === 'auto' && (
          <div className="mb-8 rounded-2xl border border-slate-700 bg-slate-900/80 p-6 text-center">
            <p className="mb-2 text-sm text-slate-400">구매한 복권</p>
            <p className="mb-4 text-3xl font-black text-amber-400">{autoStats.tickets.toLocaleString()}장</p>
            <p className="mb-4 text-sm text-slate-400">사용 금액 <span className="font-bold text-white">{formatKRW(autoStats.spent)}</span></p>
            <div className="grid grid-cols-5 gap-2 text-xs">
              {[1, 2, 3, 4, 5].map((r) => (
                <div key={r} className="rounded-lg bg-slate-800 py-2">
                  <p className="font-bold text-slate-300">{r}등</p>
                  <p className="text-amber-400">{autoStats.counts[r] ?? 0}</p>
                </div>
              ))}
            </div>
            {autoStats.best === 1 && <p className="mt-4 font-bold text-amber-400">🎉 마침내 1등 당첨!</p>}
            {autoRunning && <p className="mt-3 text-xs text-slate-500">추첨 중...</p>}
          </div>
        )}

        {/* 누적 수익 (sim/history) */}
        {mode !== 'auto' && (
          <div className="mb-10 flex items-center justify-center gap-2 text-sm">
            <span className="text-slate-500">누적 수익</span>
            <span className={`font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {profit >= 0 ? '+' : ''}{formatKRW(profit)}
            </span>
          </div>
        )}

        {/* 리더보드 */}
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
          🏆 명예의 전당
          <button onClick={() => setRefreshKey((k) => k + 1)} className="text-slate-500 hover:text-amber-400"><FiRefreshCw size={14} /></button>
        </h2>
        <LottoLeaderboard refreshKey={refreshKey} />
        <p className="mt-3 text-center text-[11px] text-slate-600">최고 등수 → 누적 당첨금 순 · 닉네임 입력 시 등록</p>
      </main>
    </div>
  )
}
