'use client'

import TetrisBoard from '@/components/tetris/TetrisBoard'
import TetrisGestureOverlay from '@/components/tetris/TetrisGestureOverlay'
import TetrisHelp from '@/components/tetris/TetrisHelp'
import TetrisHud from '@/components/tetris/TetrisHud'
import TetrisTouchPad from '@/components/tetris/TetrisTouchPad'
import { useTetrisGame } from '@/hooks/useTetrisGame'
import Link from 'next/link'
import { useCallback, useEffect, useRef } from 'react'
import { FiArrowLeft } from 'react-icons/fi'

export default function TetrisPageClient() {
  const { snapshot, highScore, actions } = useTetrisGame()
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-8 dark:from-dark-900 dark:to-dark-900">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur dark:border-slate-700/80 dark:bg-dark-900/90">
        <div
          className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3"
          style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
        >
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 transition hover:text-primary-600 dark:text-slate-200 dark:hover:text-primary-400"
          >
            <FiArrowLeft className="h-4 w-4" aria-hidden />
            포트폴리오로
          </Link>
          <span className="text-sm font-semibold text-slate-900 dark:text-white">
            테트리스
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-6">
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
                      일시정지 · P 또는 Esc
                    </p>
                  </div>
                )}
                {snapshot.gameOver && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 rounded-lg bg-slate-900/65 backdrop-blur-[2px]">
                    <p className="text-lg font-semibold text-white">게임 오버</p>
                    <p className="text-sm text-slate-200">
                      점수 {snapshot.score.toLocaleString()}
                    </p>
                    <button
                      type="button"
                      onClick={actions.resetGame}
                      className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                    >
                      다시 하기
                    </button>
                  </div>
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
              <TetrisHud snapshot={snapshot} highScore={highScore} />
              <TetrisHelp />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                키보드 포커스가 이 영역에 있을 때 단축키가 동작합니다. 첫 로드 후
                보드를 한 번 탭하거나 Tab으로 포커스를 주세요.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
