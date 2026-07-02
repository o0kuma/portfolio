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

// 이 페이지는 비용 관리를 위해 본인(관리자)만 볼 수 있다.
// 인증 전에는 어떤 시뮬레이션 데이터도 요청하지 않는다.
export default function AetheriaPageClient() {
  const [checking, setChecking] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  const [agents, setAgents] = useState<Agent[]>([])
  const [events, setEvents] = useState<LogEvent[]>([])
  const [running, setRunning] = useState(false)
  const [budget, setBudget] = useState<{ spentCents: number; capCents: number } | null>(null)
  const [busy, setBusy] = useState(false)
  const [tickBusy, setTickBusy] = useState(false)
  const [tickMessage, setTickMessage] = useState('')

  const [tokenInput, setTokenInput] = useState('')
  const [tokenError, setTokenError] = useState('')

  const load = useCallback(async () => {
    try {
      const headers = adminAuthHeaders()
      const [stateRes, logRes] = await Promise.all([
        fetch('/api/aetheria/state', { cache: 'no-store', headers }),
        fetch('/api/aetheria/log?limit=30', { cache: 'no-store', headers }),
      ])
      if (stateRes.status === 401 || logRes.status === 401) {
        setIsAdmin(false)
        return
      }
      const state = await stateRes.json()
      const log = await logRes.json()
      setAgents(state.agents ?? [])
      setRunning(Boolean(state.running))
      setBudget(state.budget ?? null)
      setEvents(log.events ?? [])
    } catch {
      // 네트워크 오류는 무시, 다음 폴링에서 재시도
    }
  }, [])

  const verifyAdmin = useCallback(async () => {
    const res = await fetch('/api/aetheria/admin', { headers: adminAuthHeaders() })
    const ok = res.ok
    setIsAdmin(ok)
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
      setTokenError('토큰이 올바르지 않습니다.')
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

  const runTickNow = async () => {
    setTickBusy(true)
    setTickMessage('')
    try {
      const res = await fetch('/api/aetheria/admin/run-tick', {
        method: 'POST',
        headers: adminAuthHeaders(),
      })
      const data = await res.json()
      if (res.ok) {
        setTickMessage(`✅ ${data.processed}명 처리 완료`)
        await load()
      } else {
        setTickMessage(`❌ ${data.error ?? '실행 실패'}`)
      }
    } catch {
      setTickMessage('❌ 네트워크 오류')
    } finally {
      setTickBusy(false)
    }
  }

  // 인증 확인 중
  if (checking) {
    return <div className="flex min-h-screen items-center justify-center bg-[#05070d] text-sm text-slate-500">확인 중...</div>
  }

  // 비공개 — 관리자만 접근 가능
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#05070d] px-4 text-white">
        <FiLock className="text-3xl text-slate-600" />
        <h1 className="text-lg font-bold">Project Aetheria</h1>
        <p className="text-center text-xs text-slate-500">
          이 페이지는 비공개입니다. 관리자만 접근할 수 있습니다.
        </p>
        <div className="flex w-full max-w-xs flex-col gap-2">
          <input
            type="password"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitToken()}
            placeholder="관리자 토큰"
            autoFocus
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
          />
          <button onClick={submitToken} className="rounded-lg bg-cyan-600 px-3 py-2 text-sm font-bold hover:bg-cyan-500">
            확인
          </button>
          {tokenError && <p className="text-center text-[11px] text-red-400">{tokenError}</p>}
        </div>
        <Link href="/" className="mt-4 text-xs text-slate-600 hover:text-slate-400">← 메인으로</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#05070d] pb-20 text-white">
      <header className="sticky top-0 z-30 border-b border-cyan-900/40 bg-[#05070d]/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white">
            <FiArrowLeft className="h-4 w-4" /> 메인
          </Link>
          <span className="text-sm font-bold text-cyan-300">Project Aetheria</span>
          <span className="rounded-full bg-cyan-900/40 px-2 py-0.5 text-[10px] text-cyan-300">🔒 비공개</span>
          <div className="ml-auto flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${running ? 'bg-emerald-400' : 'bg-slate-600'}`} />
            <span className="text-xs text-slate-400">{running ? '진행 중' : '정지됨'}</span>
            <button onClick={load} className="text-slate-500 hover:text-cyan-300" aria-label="새로고침">
              <FiRefreshCw size={14} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 pt-8">
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-3xl font-black">🧠 Project Aetheria</h1>
          <p className="text-sm text-slate-400">GPT-4o vs Gemini — 자율 에이전트 샌드박스 시뮬레이션</p>
        </div>

        {!running && (
          <p className="mb-6 rounded-lg border border-amber-800/40 bg-amber-950/10 px-4 py-2 text-center text-xs text-amber-300">
            {agents.length === 0
              ? '시뮬레이션이 아직 시작되지 않았습니다. 시작하면 다음 크론 실행 시각에 첫 데이터가 생성됩니다.'
              : '시뮬레이션이 정지된 상태입니다. 마지막으로 기록된 상태를 보고 있습니다.'}
          </p>
        )}

        <div className="mb-6 rounded-xl border border-cyan-800/40 bg-cyan-950/10 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400">
              관리자 제어 · 오늘 사용 {budget ? (budget.spentCents / 100).toFixed(2) : '0.00'}$ / {budget ? (budget.capCents / 100).toFixed(2) : '0.00'}$
            </div>
            <div className="flex gap-2">
              <button
                onClick={runTickNow}
                disabled={tickBusy}
                className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-600 disabled:opacity-50"
              >
                {tickBusy ? '실행 중...' : '⚡ 지금 1틱 실행'}
              </button>
              <button
                onClick={toggleRunning}
                disabled={busy}
                className={`rounded-lg px-4 py-1.5 text-xs font-bold transition disabled:opacity-50 ${
                  running ? 'bg-red-600 hover:bg-red-500' : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                {running ? '정지' : '시작'}
              </button>
            </div>
          </div>
          {tickMessage && <p className="mt-2 text-[11px] text-slate-400">{tickMessage}</p>}
          <p className="mt-1 text-[10px] text-slate-600">
            크론은 하루 1회만 자동 실행됩니다 — 테스트하려면 "지금 1틱 실행"을 누르세요 (예산 상한은 그대로 적용됨)
          </p>
        </div>

        {/* 그리드 월드 */}
        <WorldGrid agents={agents} />

        {/* 에이전트 카드 */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {agents.map((a) => (
            <div key={a.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <div className="mb-1 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: MODEL_COLOR[a.model] }} />
                <span className="text-sm font-bold">{a.name}</span>
              </div>
              <p className="text-[10px] text-slate-500">{a.role} · {a.model.toUpperCase()}</p>
              <p className="mt-1 text-xs text-amber-300">🪙 {a.gold}</p>
              <p className="text-[10px] text-slate-600">({a.x}, {a.y}) · {a.status}</p>
              {a.last_action && <p className="mt-1 text-[10px] text-slate-500">최근: {a.last_action}</p>}
            </div>
          ))}
          {agents.length === 0 && (
            <p className="col-span-full text-center text-sm text-slate-600">에이전트 데이터가 아직 없습니다.</p>
          )}
        </div>

        {/* 로그 스트림 */}
        <h2 className="mb-3 text-sm font-bold text-slate-300">📜 이벤트 로그</h2>
        <div className="max-h-96 space-y-2 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          {events.length === 0 && <p className="text-center text-xs text-slate-600">아직 기록된 이벤트가 없습니다.</p>}
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
          하루 1회 정해진 시각에 자동으로 진행됩니다 (방문으로는 진행되지 않음) · 예산 초과 시 자동 정지
        </p>
      </main>
    </div>
  )
}
