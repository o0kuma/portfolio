'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { FiArrowLeft, FiRefreshCw, FiLock } from 'react-icons/fi'
import { setStoredAdminToken, adminAuthHeaders } from '@/lib/admin-token'
import WorldGrid from '@/components/aetheria/WorldGrid'

interface Agent {
  id: string
  model: 'gpt' | 'gemini'
  name: string
  role: string
  gold: number
  stamina: number
  x: number
  y: number
  status: string
  last_action: string | null
}

interface LogEvent {
  tick_id: number
  agent_id: string
  agent_name: string
  model: 'gpt' | 'gemini'
  event_type: string
  display_text: string
  created_at: string
}

const MODEL_COLOR: Record<string, string> = { gpt: '#10b981', gemini: '#3b82f6' }
const MODEL_LABEL: Record<string, string> = { gpt: 'GPT-4o mini', gemini: 'Gemini 2.5 Flash' }

interface ModelStat {
  model: string
  alive: number
  dead: number
  avgGold: number
  avgStamina: number
  totalGold: number
  huntCount: number
  huntGoldEarned: number
  tradeCount: number
  partyCount: number
  deathCount: number
}

// 이 페이지는 비용 관리를 위해 본인(관리자)만 볼 수 있다.
// 인증 전에는 어떤 시뮬레이션 데이터도 요청하지 않는다.
export default function AetheriaPageClient() {
  const [checking, setChecking] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  const [agents, setAgents] = useState<Agent[]>([])
  const [events, setEvents] = useState<LogEvent[]>([])
  const [running, setRunning] = useState(false)
  const [currentTick, setCurrentTick] = useState(0)
  const [budget, setBudget] = useState<{ spentCents: number; capCents: number } | null>(null)
  const [busy, setBusy] = useState(false)

  const [tokenInput, setTokenInput] = useState('')
  const [tokenError, setTokenError] = useState('')
  const [envStatus, setEnvStatus] = useState<{
    openai: { present: boolean; length: number }
    gemini: { present: boolean; length: number }
  } | null>(null)
  const [modelStats, setModelStats] = useState<ModelStat[]>([])

  const load = useCallback(async () => {
    try {
      const headers = adminAuthHeaders()
      const [stateRes, logRes, statsRes] = await Promise.all([
        fetch('/api/aetheria/state', { cache: 'no-store', headers }),
        fetch('/api/aetheria/log?limit=30', { cache: 'no-store', headers }),
        fetch('/api/aetheria/stats', { cache: 'no-store', headers }),
      ])
      if (stateRes.status === 401 || logRes.status === 401) {
        setIsAdmin(false)
        return
      }
      const state = await stateRes.json()
      const log = await logRes.json()
      const stats = await statsRes.json().catch(() => ({ stats: [] }))
      setAgents(state.agents ?? [])
      setRunning(Boolean(state.running))
      setCurrentTick(state.currentTick ?? 0)
      setBudget(state.budget ?? null)
      setEvents(log.events ?? [])
      setModelStats(stats.stats ?? [])
    } catch {
      // 네트워크 오류는 무시, 다음 폴링에서 재시도
    }
  }, [])

  const verifyAdmin = useCallback(async () => {
    const res = await fetch('/api/aetheria/admin', { headers: adminAuthHeaders() })
    const ok = res.ok
    setIsAdmin(ok)
    if (ok) {
      const data = await res.json()
      setEnvStatus(data.envStatus ?? null)
    }
    return ok
  }, [])

  useEffect(() => {
    (async () => {
      const ok = await verifyAdmin()
      setChecking(false)
      if (ok) load()
    })()
  }, [verifyAdmin, load])

  // 관리자 인증된 상태에서만 폴링
  useEffect(() => {
    if (!isAdmin) return
    const interval = setInterval(load, 30_000)
    return () => clearInterval(interval)
  }, [isAdmin, load])

  const submitToken = async () => {
    setTokenError('')
    setStoredAdminToken(tokenInput)
    const ok = await verifyAdmin()
    if (ok) {
      setTokenInput('')
      load()
    } else {
      setTokenError('Invalid token.')
      setStoredAdminToken('')
    }
  }

  const toggleRunning = async () => {
    setBusy(true)
    try {
      await fetch('/api/aetheria/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...adminAuthHeaders() },
        body: JSON.stringify({ running: !running }),
      })
      await load()
    } finally {
      setBusy(false)
    }
  }

  // Verifying authentication
  if (checking) {
    return <div className="flex min-h-screen items-center justify-center bg-[#05070d] text-sm text-slate-500">Checking...</div>
  }

  // Private — admin access only
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#05070d] px-4 text-white">
        <FiLock className="text-3xl text-slate-600" />
        <h1 className="text-lg font-bold">Project Aetheria</h1>
        <p className="text-center text-xs text-slate-500">
          This page is private. Admin access only.
        </p>
        <div className="flex w-full max-w-xs flex-col gap-2">
          <input
            type="password"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitToken()}
            placeholder="Admin token"
            autoFocus
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
          />
          <button onClick={submitToken} className="rounded-lg bg-cyan-600 px-3 py-2 text-sm font-bold hover:bg-cyan-500">
            Confirm
          </button>
          {tokenError && <p className="text-center text-[11px] text-red-400">{tokenError}</p>}
        </div>

        <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-600">
          <span className="h-px w-10 bg-slate-800" /> or <span className="h-px w-10 bg-slate-800" />
        </div>
        <Link
          href={`/admin/login?redirect=${encodeURIComponent('/aetheria')}`}
          className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
        >
          Log in with admin password →
        </Link>

        <Link href="/" className="mt-4 text-xs text-slate-600 hover:text-slate-400">← Back to home</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#05070d] pb-20 text-white">
      <header className="sticky top-0 z-30 border-b border-cyan-900/40 bg-[#05070d]/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white">
            <FiArrowLeft className="h-4 w-4" /> Home
          </Link>
          <span className="text-sm font-bold text-cyan-300">Project Aetheria</span>
          <span className="rounded-full bg-cyan-900/40 px-2 py-0.5 text-[10px] text-cyan-300">🔒 Private</span>
          <div className="ml-auto flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${running ? 'bg-emerald-400' : 'bg-slate-600'}`} />
            <span className="text-xs text-slate-400">{running ? 'Running' : 'Stopped'}</span>
            <button onClick={load} className="text-slate-500 hover:text-cyan-300" aria-label="Refresh">
              <FiRefreshCw size={14} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 pt-8">
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-3xl font-black">🧠 Project Aetheria</h1>
          <p className="text-sm text-slate-400">GPT-4o vs Gemini — Autonomous Agent Sandbox Simulation</p>
        </div>

        {agents.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-xs text-slate-400">
            <span>🕐 Tick {currentTick}</span>
            <span>💚 Alive {agents.filter((a) => a.status === 'alive').length}/{agents.length}</span>
            {agents.some((a) => a.gold > 0) && (
              <span>
                👑 Richest: {[...agents].sort((a, b) => b.gold - a.gold)[0]?.name} (🪙{[...agents].sort((a, b) => b.gold - a.gold)[0]?.gold})
              </span>
            )}
          </div>
        )}

        {!running && (
          <p className="mb-6 rounded-lg border border-amber-800/40 bg-amber-950/10 px-4 py-2 text-center text-xs text-amber-300">
            {agents.length === 0
              ? 'The simulation has not started yet. Once started, the first data will be generated at the next cron run.'
              : 'The simulation is stopped. You are viewing the last recorded state.'}
          </p>
        )}

        <div className="mb-6 rounded-xl border border-cyan-800/40 bg-cyan-950/10 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400">
              Admin Controls · Today's usage {budget ? (budget.spentCents / 100).toFixed(4) : '0.0000'}$ / {budget ? (budget.capCents / 100).toFixed(2) : '0.00'}$
            </div>
            <button
              onClick={toggleRunning}
              disabled={busy}
              className={`rounded-lg px-4 py-1.5 text-xs font-bold transition disabled:opacity-50 ${
                running ? 'bg-red-600 hover:bg-red-500' : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
            >
              {running ? 'Stop' : 'Start'}
            </button>
          </div>
          <p className="mt-1 text-[10px] text-slate-600">
            Runs automatically every 8 hours (3 times/day) — no manual runs. Auto-stops if the budget is exceeded.
          </p>

          {envStatus && (
            <div className="mt-3 flex gap-4 border-t border-cyan-900/30 pt-2 text-[11px]">
              <span className={envStatus.openai.present ? 'text-emerald-400' : 'text-red-400'}>
                {envStatus.openai.present ? '✅' : '❌'} OPENAI_API_KEY {envStatus.openai.present ? `(${envStatus.openai.length} chars)` : 'not set'}
              </span>
              <span className={envStatus.gemini.present ? 'text-emerald-400' : 'text-red-400'}>
                {envStatus.gemini.present ? '✅' : '❌'} GEMINI_API_KEY {envStatus.gemini.present ? `(${envStatus.gemini.length} chars)` : 'not set'}
              </span>
            </div>
          )}
        </div>

        {/* Model comparison — "which intelligence dominates the ecosystem?" */}
        {modelStats.length > 0 && (
          <div className="mb-8 rounded-xl border border-purple-800/30 bg-purple-950/5 p-4">
            <h2 className="mb-3 text-sm font-bold text-purple-300">🧬 Model Comparison</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {modelStats.map((s) => (
                <div key={s.model} className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
                  <div className="mb-2 flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: MODEL_COLOR[s.model] }} />
                    <span className="text-sm font-bold text-white">{MODEL_LABEL[s.model] ?? s.model}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-slate-400">
                    <span>Alive/Dead</span><span className="text-right text-slate-200">{s.alive} / {s.dead}</span>
                    <span>Avg. Gold</span><span className="text-right text-amber-300">🪙 {s.avgGold}</span>
                    <span>Avg. Stamina</span><span className="text-right text-slate-200">{s.avgStamina}</span>
                    <span>Total Gold</span><span className="text-right text-amber-300">🪙 {s.totalGold}</span>
                    <span>Hunts</span><span className="text-right text-slate-200">{s.huntCount}x</span>
                    <span>Hunt Earnings</span><span className="text-right text-amber-300">🪙 {s.huntGoldEarned}</span>
                    <span>Trade Attempts</span><span className="text-right text-slate-200">{s.tradeCount}x</span>
                    <span>Party Attempts</span><span className="text-right text-slate-200">{s.partyCount}x</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[10px] text-slate-600">
              This is a small sample of 3 agents per model, for reference only. Statistical significance grows as more ticks accumulate.
            </p>
          </div>
        )}

        {/* Grid world */}
        <WorldGrid agents={agents} />

        {/* Leaderboard */}
        {agents.length > 0 && (
          <div className="mb-8 rounded-xl border border-amber-800/30 bg-amber-950/5 p-4">
            <h2 className="mb-3 text-sm font-bold text-amber-300">🏆 Gold Ranking</h2>
            <div className="space-y-1.5">
              {[...agents]
                .sort((a, b) => b.gold - a.gold)
                .map((a, i) => {
                  const medal = ['🥇', '🥈', '🥉'][i]
                  const dead = a.status !== 'alive'
                  return (
                    <div key={a.id} className="flex items-center gap-2 text-xs">
                      <span className="w-5 text-center font-mono text-slate-500">{medal ?? i + 1}</span>
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: MODEL_COLOR[a.model] }} />
                      <span className={`flex-1 font-semibold ${dead ? 'text-slate-600 line-through' : 'text-slate-200'}`}>
                        {a.name}
                      </span>
                      <span className="font-mono text-amber-300">🪙 {a.gold}</span>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {/* Agent cards */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {agents.map((a) => {
            const dead = a.status !== 'alive'
            const staminaColor = a.stamina > 50 ? '#4ade80' : a.stamina > 20 ? '#fbbf24' : '#f87171'
            return (
              <div
                key={a.id}
                className={`rounded-xl border p-3 ${dead ? 'border-slate-900 bg-slate-950/60 opacity-50' : 'border-slate-800 bg-slate-900/60'}`}
              >
                <div className="mb-1 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: MODEL_COLOR[a.model] }} />
                  <span className="text-sm font-bold">{dead ? '💀 ' : ''}{a.name}</span>
                </div>
                <p className="text-[10px] text-slate-500">{a.role} · {a.model.toUpperCase()}</p>
                <p className="mt-1 text-xs text-amber-300">🪙 {a.gold}</p>
                {!dead && (
                  <div className="mt-1.5">
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                      <div className="h-full rounded-full" style={{ width: `${a.stamina}%`, backgroundColor: staminaColor }} />
                    </div>
                    <p className="mt-0.5 text-[9px] text-slate-600">Stamina {a.stamina}</p>
                  </div>
                )}
                <p className="mt-1 text-[10px] text-slate-600">({a.x}, {a.y}) · {dead ? 'Dead' : 'Alive'}</p>
                {a.last_action && <p className="mt-1 text-[10px] text-slate-500">Recent: {a.last_action}</p>}
              </div>
            )
          })}
          {agents.length === 0 && (
            <p className="col-span-full text-center text-sm text-slate-600">No agent data yet.</p>
          )}
        </div>

        {/* Log stream */}
        <h2 className="mb-3 text-sm font-bold text-slate-300">📜 Event Log</h2>
        <div className="max-h-96 space-y-2 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          {events.length === 0 && <p className="text-center text-xs text-slate-600">No events recorded yet.</p>}
          {events.map((e, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <span className="h-1.5 w-1.5 flex-shrink-0 translate-y-1 rounded-full" style={{ backgroundColor: MODEL_COLOR[e.model] }} />
              <div>
                <span className="font-semibold text-slate-300">{e.agent_name}</span>{' '}
                <span className="text-slate-500">[{e.event_type}]</span>{' '}
                <span className="text-slate-400">{e.display_text}</span>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-[11px] text-slate-600">
          Runs automatically every 8 hours (3 times/day, not triggered by visits) · Auto-stops if budget is exceeded · These agents are also alive in <Link href="/rpg" className="underline hover:text-cyan-400">/rpg</Link>
        </p>
      </main>
    </div>
  )
}
