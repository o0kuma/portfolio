'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FiArrowLeft, FiClock, FiAward, FiTrendingUp } from 'react-icons/fi'
import { useLanguage } from '@/lib/LanguageContext'

interface HallEntry {
  name: string
  model: string
  role: string
  season: number
  survived_days: number
  final_gold: number
}
interface EventRow {
  agent_id: string
  agent_name: string
  model: string
  event_type: string
  display_text: string
  created_at: string
}
interface SeasonStat {
  season: number
  residents: number
  top_gold: number
  longest_days: number
}
interface PublicState {
  agents: { status: string; model: string }[]
  recentEvents: EventRow[]
  currentTick: number
  season: number
  hallOfFame: { longest: HallEntry[]; richest: HallEntry[] }
  seasonStats: SeasonStat[]
}

const T = {
  ko: {
    back: '홈으로',
    title: 'Aetheria 연대기',
    subtitle: 'GPT와 Gemini 에이전트가 스스로 사냥·거래·생존하는 자율 시뮬레이션의 기록입니다.',
    season: '시즌',
    tick: '틱',
    alive: '생존 중',
    longest: '최장수 명예의 전당',
    richest: '최고 부자 명예의 전당',
    timeline: '시즌 연대기',
    chronicle: '최근 기록',
    days: '일 생존',
    gold: '골드',
    residents: '거주자',
    topGold: '최고 골드',
    empty: '아직 기록된 데이터가 없습니다. 시뮬레이션이 진행되면 채워집니다.',
    noEvents: '최근 이벤트가 없습니다.',
    seasonN: (n: number) => `시즌 ${n}`,
  },
  en: {
    back: 'Home',
    title: 'Aetheria Chronicle',
    subtitle: 'A record of the autonomous simulation where GPT and Gemini agents hunt, trade, and survive on their own.',
    season: 'Season',
    tick: 'Tick',
    alive: 'Alive',
    longest: 'Hall of Fame — Longest Survivors',
    richest: 'Hall of Fame — Wealthiest',
    timeline: 'Season Timeline',
    chronicle: 'Recent Chronicle',
    days: 'days survived',
    gold: 'gold',
    residents: 'residents',
    topGold: 'top gold',
    empty: 'No records yet. This fills in as the simulation runs.',
    noEvents: 'No recent events.',
    seasonN: (n: number) => `Season ${n}`,
  },
}

function modelBadge(model: string): { label: string; cls: string } {
  const m = (model || '').toLowerCase()
  if (m.includes('gemini')) return { label: 'Gemini', cls: 'bg-sky-500/20 text-sky-300 border-sky-500/40' }
  if (m.includes('gpt')) return { label: 'GPT', cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' }
  return { label: model || '?', cls: 'bg-neutral-500/20 text-neutral-300 border-neutral-500/40' }
}

function timeAgo(iso: string, locale: 'ko' | 'en'): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return locale === 'ko' ? '방금' : 'now'
  if (m < 60) return locale === 'ko' ? `${m}분 전` : `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return locale === 'ko' ? `${h}시간 전` : `${h}h ago`
  const d = Math.floor(h / 24)
  return locale === 'ko' ? `${d}일 전` : `${d}d ago`
}

const MEDALS = ['🥇', '🥈', '🥉']

function HallCard({ entries, kind, tr }: { entries: HallEntry[]; kind: 'days' | 'gold'; tr: typeof T['ko'] }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-neutral-300">
        {kind === 'days' ? <FiClock className="h-4 w-4 text-amber-400" /> : <FiTrendingUp className="h-4 w-4 text-amber-400" />}
        {kind === 'days' ? tr.longest : tr.richest}
      </h2>
      {entries.length === 0 ? (
        <p className="text-sm text-neutral-600">{tr.empty}</p>
      ) : (
        <ol className="space-y-2">
          {entries.map((e, i) => {
            const b = modelBadge(e.model)
            return (
              <li key={i} className="flex items-center gap-3 rounded-lg bg-neutral-950/50 px-3 py-2">
                <span className="w-6 text-center text-lg">{MEDALS[i] ?? `${i + 1}`}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-semibold text-neutral-100">{e.name}</span>
                    <span className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-bold ${b.cls}`}>{b.label}</span>
                  </div>
                  <span className="text-[11px] text-neutral-500">{tr.seasonN(e.season)} · {e.role}</span>
                </div>
                <span className="shrink-0 text-right font-mono text-sm text-amber-300">
                  {kind === 'days' ? `${e.survived_days}` : `◉${e.final_gold.toLocaleString()}`}
                  <span className="block text-[10px] font-normal text-neutral-500">
                    {kind === 'days' ? tr.days : tr.gold}
                  </span>
                </span>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}

export default function AetheriaHistoryClient() {
  const { locale } = useLanguage()
  const tr = T[locale === 'ko' ? 'ko' : 'en']
  const [data, setData] = useState<PublicState | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/aetheria/public', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  const aliveCount = data?.agents.filter((a) => a.status === 'alive').length ?? 0

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-4xl px-5 py-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 transition hover:text-neutral-200">
          <FiArrowLeft className="h-4 w-4" /> {tr.back}
        </Link>

        <header className="mt-6 mb-8">
          <h1 className="flex items-center gap-2 font-display text-3xl font-bold">
            <FiAward className="h-7 w-7 text-amber-400" /> {tr.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-400">{tr.subtitle}</p>
        </header>

        {/* status band */}
        <div className="mb-8 grid grid-cols-3 gap-3">
          <Stat label={tr.season} value={data?.season ?? '—'} tone="text-fuchsia-300" />
          <Stat label={tr.tick} value={data ? data.currentTick.toLocaleString() : '—'} tone="text-cyan-300" />
          <Stat label={tr.alive} value={loading ? '—' : aliveCount} tone="text-emerald-300" />
        </div>

        {loading ? (
          <p className="py-16 text-center text-neutral-600">…</p>
        ) : (
          <>
            <div className="mb-8 grid gap-4 md:grid-cols-2">
              <HallCard entries={data?.hallOfFame.longest ?? []} kind="days" tr={tr} />
              <HallCard entries={data?.hallOfFame.richest ?? []} kind="gold" tr={tr} />
            </div>

            {/* season timeline */}
            {(data?.seasonStats.length ?? 0) > 0 && (
              <div className="mb-8 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5">
                <h2 className="mb-4 text-sm font-semibold text-neutral-300">{tr.timeline}</h2>
                <ol className="relative space-y-4 border-l border-neutral-800 pl-5">
                  {data!.seasonStats.map((s) => (
                    <li key={s.season} className="relative">
                      <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-neutral-950 bg-fuchsia-500" />
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="font-semibold text-fuchsia-300">{tr.seasonN(s.season)}</span>
                        <span className="text-xs text-neutral-500">{s.residents} {tr.residents}</span>
                        <span className="text-xs text-amber-300/80">◉{s.top_gold.toLocaleString()} {tr.topGold}</span>
                        <span className="text-xs text-cyan-300/80">{s.longest_days} {tr.days}</span>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* recent chronicle */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5">
              <h2 className="mb-4 text-sm font-semibold text-neutral-300">{tr.chronicle}</h2>
              {(data?.recentEvents.length ?? 0) === 0 ? (
                <p className="text-sm text-neutral-600">{tr.noEvents}</p>
              ) : (
                <ul className="space-y-2">
                  {data!.recentEvents.map((e, i) => {
                    const b = modelBadge(e.model)
                    return (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <span className={`mt-0.5 shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-bold ${b.cls}`}>{b.label}</span>
                        <span className="flex-1 text-neutral-300">{e.display_text}</span>
                        <span className="shrink-0 text-[11px] text-neutral-600">{timeAgo(e.created_at, locale === 'ko' ? 'ko' : 'en')}</span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value, tone }: { label: string; value: number | string; tone: string }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 text-center">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${tone}`}>{value}</p>
    </div>
  )
}
