'use client'

import TetrisBoard from '@/components/tetris/TetrisBoard'
import TetrisGestureOverlay from '@/components/tetris/TetrisGestureOverlay'
import TetrisHelp from '@/components/tetris/TetrisHelp'
import TetrisHud from '@/components/tetris/TetrisHud'
import TetrisLeaderboard from '@/components/tetris/TetrisLeaderboard'
import TetrisPlayerName from '@/components/tetris/TetrisPlayerName'
import TetrisTouchPad from '@/components/tetris/TetrisTouchPad'
import { useTetrisGame } from '@/hooks/useTetrisGame'
import { useLanguage } from '@/lib/LanguageContext'
import { interpolate } from '@/lib/i18n'
import { toast } from '@/lib/toast'
import Link from 'next/link'
import type { GameSnapshot } from '@/lib/tetris/types'
import { useCallback, useEffect, useRef } from 'react'
import { FiArrowLeft } from 'react-icons/fi'

function TetrisGameOverOverlay({
  snapshot,
  bestStage,
  t,
  onReset,
}: {
  snapshot: GameSnapshot
  bestStage: number
  t: ReturnType<typeof useLanguage>['t']
  onReset: () => void
}) {
  const { locale } = useLanguage()

  const handleShare = useCallback(async () => {
    const text = `테트리스 ${snapshot.score.toLocaleString()}점 달성! kuuuma.com/tetris`
    try {
      await navigator.clipboard.writeText(text)
      toast.success('복사됨!')
    } catch {
      toast.error('복사 실패')
    }
  }, [snapshot.score])

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 rounded-lg bg-slate-900/65 backdrop-blur-[2px]">
      <p className="text-lg font-semibold text-white">{t.tetrisPage.gameOver}</p>
      <p className="text-sm text-slate-200">
        {snapshot.stage}{t.tetrisPage.stageUnit} · {snapshot.lines}{t.tetrisPage.lineUnit} · {t.tetrisPage.scoreLabel}{' '}
        {snapshot.score.toLocaleString()}
      </p>
      <p className="text-xs text-slate-300">
        {interpolate(t.tetrisPage.bestStageLabel, { n: bestStage })}
      </p>
      <button
        type="button"
        onClick={onReset}
        className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
      >
        {t.tetrisPage.restart}
      </button>
      <button
        type="button"
        onClick={handleShare}
        className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
      >
        {locale === 'ko' ? '결과 공유' : 'Share Result'}
      </button>
    </div>
  )
}

export default function TetrisPageClient() {
  const {
    snapshot,
    highScore,
    bestStage,
    actions,
    leaderboardRefreshKey,
    submitError,
    clearSubmitError,
  } = useTetrisGame()
  const { t } = useLanguage()
  const surfaceRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    surfaceRef.current?.focus()
  }, [])

  const disabled = snapshot.paused || snapshot.gameOver

  const onSwipe = useCallback(
    (dir: 'left' | 'right' | 'down' | 'up') => {
      switch (dir) {
        case 'left':
          actions.moveLeft()
          break
        case 'right':
          actions.moveRight()
          break
        case 'down':
          actions.softDrop()
          break
        case 'up':
          actions.rotateCW()
          break
        default:
          break
      }
    },
    [actions]
  )

  return (
    <div className="min-h-screen bg-canvas pb-8 text-textPrimary">
      <header className="sticky top-0 z-30 glass-panel border-b border-border">
        <div
          className="page-shell flex max-w-6xl items-center gap-4 py-3"
          style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-textMuted transition hover:text-primary-600 dark:hover:text-accent"
          >
            <FiArrowLeft className="h-4 w-4" aria-hidden />
            {t.common.backHome}
          </Link>
          <span className="text-sm font-semibold text-textPrimary">{t.tetrisPage.title}</span>
        </div>
      </header>

      <main className="page-shell max-w-6xl pt-6">
        <div
          ref={surfaceRef}
          tabIndex={-1}
          onPointerDownCapture={() => surfaceRef.current?.focus()}
          className="outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-dark-900"
        >
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col items-center lg:items-start">
              <div className="relative inline-block">
                <TetrisBoard snapshot={snapshot} />
                <TetrisGestureOverlay
                  disabled={disabled}
                  onSwipe={onSwipe}
                  onTap={() => actions.rotateCW()}
                  onLongPress={() => actions.hardDrop()}
                />
                {snapshot.paused && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center rounded-lg bg-slate-900/55 backdrop-blur-[2px]">
                    <p className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow dark:bg-slate-800 dark:text-slate-100">
                      {t.tetrisPage.paused}
                    </p>
                  </div>
                )}
                {snapshot.gameOver && (
                  <TetrisGameOverOverlay
                    snapshot={snapshot}
                    bestStage={bestStage}
                    t={t}
                    onReset={actions.resetGame}
                  />
                )}
              </div>

              <TetrisTouchPad
                disabled={disabled}
                onLeft={actions.moveLeft}
                onRight={actions.moveRight}
                onSoftDrop={actions.softDrop}
                onHardDrop={actions.hardDrop}
                onRotateCW={actions.rotateCW}
                onRotateCCW={actions.rotateCCW}
                onHold={actions.hold}
                onPause={actions.pauseToggle}
              />
            </div>

            <div className="flex w-full flex-col gap-6 lg:max-w-sm">
              <TetrisHud snapshot={snapshot} highScore={highScore} bestStage={bestStage} />
              <TetrisPlayerName />
              <TetrisLeaderboard refreshKey={leaderboardRefreshKey} />
              {submitError && (
                <p
                  role="status"
                  className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200"
                >
                  {t.tetrisPage.submitErrorPrefix}{submitError}
                  <button
                    type="button"
                    className="ml-2 underline"
                    onClick={clearSubmitError}
                  >
                    {t.common.close}
                  </button>
                </p>
              )}
              <TetrisHelp />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.tetrisPage.keyboardHint}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
