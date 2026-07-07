'use client'

import Link from 'next/link'
import { FiArrowLeft, FiPause, FiPlay } from 'react-icons/fi'
import SurviveCanvas from '@/components/survive/SurviveCanvas'
import SurviveHud from '@/components/survive/SurviveHud'
import SurviveJoystick from '@/components/survive/SurviveJoystick'
import SurviveLevelUp from '@/components/survive/SurviveLevelUp'
import SurviveBossUpgrade from '@/components/survive/SurviveBossUpgrade'
import SurviveLeaderboard from '@/components/survive/SurviveLeaderboard'
import { useSurviveGame } from '@/hooks/useSurviveGame'
import { formatTime } from '@/lib/survive/storage'
import { toast } from '@/lib/toast'
import { useCallback, useState } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

export default function SurvivePageClient() {
  const { locale } = useLanguage()
  const en = locale === 'en'
  const { engineRef, hud, choices, bossChoices, actions } = useSurviveGame()
  const status = hud.status
  const [lbRefreshKey, setLbRefreshKey] = useState(0)
  const handleSurviveShare = useCallback(async () => {
    const text = en
      ? `Survive ${formatTime(hud.timeSec)} survived! kuuuma.com/survive`
      : `서바이브 ${formatTime(hud.timeSec)} 생존! kuuuma.com/survive`
    try {
      await navigator.clipboard.writeText(text)
      toast.success(en ? 'Copied!' : '복사됨!')
    } catch {
      toast.error(en ? 'Copy failed' : '복사 실패')
    }
  }, [hud.timeSec, en])

  return (
    <div className="min-h-screen bg-canvas pb-8 text-textPrimary">
      <header className="sticky top-0 z-30 glass-panel border-b border-border">
        <div
          className="page-shell flex max-w-4xl items-center gap-4 py-3"
          style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-textMuted transition hover:text-primary-600 dark:hover:text-accent"
          >
            <FiArrowLeft className="h-4 w-4" aria-hidden />
            {en ? 'Home' : '홈으로'}
          </Link>
          <span className="text-sm font-semibold text-textPrimary">{en ? 'Survive' : '서바이브'}</span>
          {status === 'playing' || status === 'paused' ? (
            <button
              type="button"
              onClick={actions.togglePause}
              className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-textMuted transition hover:text-primary-600 dark:hover:text-accent"
            >
              {status === 'paused' ? <FiPlay className="h-3.5 w-3.5" /> : <FiPause className="h-3.5 w-3.5" />}
              {status === 'paused' ? (en ? 'Resume' : '계속') : (en ? 'Pause' : '일시정지')}
            </button>
          ) : null}
        </div>
      </header>

      <main className="page-shell max-w-4xl pt-6">
        <div
          className="relative w-full overflow-hidden rounded-xl ring-1 ring-slate-700"
          style={{ height: 'min(64vh, 560px)' }}
        >
          <SurviveCanvas engineRef={engineRef} status={status} />

          {(status === 'playing' || status === 'paused' || status === 'levelup' || status === 'bossupgrade') && (
            <SurviveHud hud={hud} />
          )}

          {status === 'playing' && <SurviveJoystick onChange={actions.setJoystick} />}

          {status === 'levelup' && (
            <SurviveLevelUp choices={choices} onChoose={actions.chooseUpgrade} />
          )}

          {status === 'bossupgrade' && (
            <SurviveBossUpgrade choices={bossChoices} onChoose={actions.chooseBossUpgrade} />
          )}

          {/* Boss announcement overlay */}
          {(status === 'playing' || status === 'paused') && hud.bossAnnounceMs > 0 && (
            <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
              <div className="animate-pulse rounded-2xl bg-black/75 px-8 py-5 text-center ring-2 ring-red-500/70">
                <p className="text-2xl font-bold text-red-400">⚠️ BOSS WAVE</p>
                <p className="mt-1 text-sm text-amber-300">{en ? 'Get ready!' : '준비하세요!'}</p>
              </div>
            </div>
          )}

          {status === 'paused' && (
            <div className="absolute inset-0 z-30 flex items-center justify-center">
              <div className="rounded-xl bg-white/90 px-6 py-4 text-center shadow-lg dark:bg-slate-800/90">
                <p className="text-base font-semibold text-slate-800 dark:text-slate-100">{en ? 'Paused' : '일시정지'}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {en ? 'Resume with P · Esc · the button' : 'P · Esc · 버튼으로 재개'}
                </p>
              </div>
            </div>
          )}

          {status === 'ready' && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-5 bg-slate-950/85 px-6 text-center">
              <h2 className="font-display text-3xl font-bold text-white">{en ? 'Survive' : '서바이브'}</h2>
              <p className="max-w-sm text-sm leading-relaxed text-white/65">
                {en
                  ? 'Dodge the encroaching enemies and hold out as long as you can. Your weapon fires automatically, and you pick an upgrade every level up.'
                  : '몰려오는 적을 피하며 최대한 오래 버티세요. 무기는 자동으로 공격하고, 레벨업마다 강화를 고를 수 있습니다.'}
              </p>
              <p className="text-xs text-white/45">
                {en ? 'Move: WASD / Arrows · Mobile: drag the screen · Pause: P' : '이동: WASD / 방향키 · 모바일: 화면 드래그 · 일시정지: P'}
              </p>
              {hud.bestTimeSec > 0 && (
                <p className="font-mono text-xs text-cyan-300">
                  {en ? 'Best' : '최고 기록'} {formatTime(hud.bestTimeSec)}
                </p>
              )}
              <button
                type="button"
                onClick={actions.start}
                className="rounded-lg bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                {en ? 'Start' : '시작'}
              </button>
            </div>
          )}

          {status === 'gameover' && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-slate-950/85 px-6 text-center">
              <h2 className="font-display text-3xl font-bold text-white">{en ? 'Game Over' : '게임 오버'}</h2>
              <p className="text-sm text-white/75">
                {en ? 'Survived' : '생존'} {formatTime(hud.timeSec)} · Lv.{hud.level} · {en ? 'Kills' : '처치'} {hud.kills}
              </p>
              <p className="font-mono text-xs text-cyan-300">
                {en ? 'Best' : '최고 기록'} {formatTime(hud.bestTimeSec)}
              </p>
              <button
                type="button"
                onClick={() => { setLbRefreshKey(k => k + 1); actions.restart() }}
                className="mt-2 rounded-lg bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                {en ? 'Play Again' : '다시 하기'}
              </button>
              <button
                type="button"
                onClick={handleSurviveShare}
                className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
              >
                {en ? 'Share Result' : '결과 공유'}
              </button>
            </div>
          )}
        </div>

        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
          {en
            ? 'On desktop, move with WASD or the arrow keys; on mobile, drag the game screen to steer the joystick. Your weapon automatically attacks the nearest enemy.'
            : '데스크톱은 WASD 또는 방향키로 이동하고, 모바일은 게임 화면을 드래그해 조이스틱으로 조작합니다. 무기는 가장 가까운 적을 자동으로 공격합니다.'}
        </p>

        <div className="mt-8">
          <SurviveLeaderboard refreshKey={lbRefreshKey} />
        </div>
      </main>
    </div>
  )
}
