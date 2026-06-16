'use client'

import {
  LINES_PER_STAGE,
  MAX_STAGE,
  linesIntoCurrentStage,
  stageProgressRatio,
} from '@/lib/tetris/stages'
import type { GameSnapshot } from '@/lib/tetris/types'
import { useLanguage } from '@/lib/LanguageContext'
import { interpolate } from '@/lib/i18n'
import PieceMini from './PieceMini'

export default function TetrisHud({
  snapshot,
  highScore,
  bestStage,
}: {
  snapshot: GameSnapshot
  highScore: number
  bestStage: number
}) {
  const { t } = useLanguage()
  const nextPrimary = snapshot.next[0] ?? null
  const nextQueue = snapshot.next.slice(1, 5)
  const progress = stageProgressRatio(snapshot.lines)
  const intoStage = linesIntoCurrentStage(snapshot.lines)
  const atMax = snapshot.stage >= MAX_STAGE

  return (
    <div className="flex w-full max-w-xs flex-col gap-4 rounded-xl border border-slate-200 bg-white/90 p-4 dark:border-slate-700 dark:bg-slate-900/90">
      <div>
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            {interpolate(t.tetrisHud.stageLabel, { n: snapshot.stage })}
            {!atMax && (
              <span className="ml-1 text-xs font-normal text-slate-500 dark:text-slate-400">
                / {interpolate(t.tetrisHud.stageMax, { max: MAX_STAGE })}
              </span>
            )}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {interpolate(t.tetrisHud.bestStage, { n: bestStage })}
          </p>
        </div>
        {!atMax && (
          <div className="mt-2">
            <div
              className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
              role="progressbar"
              aria-valuenow={intoStage}
              aria-valuemin={0}
              aria-valuemax={LINES_PER_STAGE}
              aria-label={t.tetrisHud.progressAriaLabel}
            >
              <div
                className="h-full rounded-full bg-primary-500 transition-[width] duration-200"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
            <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
              {interpolate(t.tetrisHud.nextStageProgress, { into: intoStage, total: LINES_PER_STAGE })}
            </p>
          </div>
        )}
        {atMax && (
          <p className="mt-1 text-[10px] text-primary-600 dark:text-primary-400">
            {t.tetrisHud.maxStageReached}
          </p>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm border-t border-slate-200 pt-4 dark:border-slate-700">
        <dt className="text-slate-500 dark:text-slate-400">{t.tetrisHud.score}</dt>
        <dd className="font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
          {snapshot.score.toLocaleString()}
        </dd>
        <dt className="text-slate-500 dark:text-slate-400">{t.tetrisHud.highScore}</dt>
        <dd className="font-mono tabular-nums text-primary-600 dark:text-primary-400">
          {highScore.toLocaleString()}
        </dd>
        <dt className="text-slate-500 dark:text-slate-400">{t.tetrisHud.level}</dt>
        <dd className="font-mono tabular-nums">{snapshot.level}</dd>
        <dt className="text-slate-500 dark:text-slate-400">{t.tetrisHud.totalLines}</dt>
        <dd className="font-mono tabular-nums">{snapshot.lines}</dd>
      </dl>

      <div className="flex flex-wrap gap-6 border-t border-slate-200 pt-4 dark:border-slate-700">
        <div className={snapshot.holdLocked ? 'opacity-50' : ''}>
          <PieceMini id={snapshot.hold} label={t.tetrisHud.hold} />
          {snapshot.holdLocked && (
            <p className="mt-1 text-[10px] text-slate-500">{t.tetrisHud.holdLocked}</p>
          )}
        </div>
        <div>
          <PieceMini id={nextPrimary} label={t.tetrisHud.next} />
        </div>
      </div>

      {nextQueue.length > 0 && (
        <div className="border-t border-slate-200 pt-3 dark:border-slate-700">
          <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            {t.tetrisHud.queue}
          </p>
          <ul className="flex flex-wrap gap-2">
            {nextQueue.map((id, i) => (
              <li
                key={`${id}-${i}`}
                className="rounded border border-slate-200 px-2 py-1 font-mono text-xs dark:border-slate-600"
              >
                {id}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
