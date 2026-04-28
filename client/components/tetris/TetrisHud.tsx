'use client'

import type { GameSnapshot } from '@/lib/tetris/types'
import PieceMini from './PieceMini'

export default function TetrisHud({
  snapshot,
  highScore,
}: {
  snapshot: GameSnapshot
  highScore: number
}) {
  const nextPrimary = snapshot.next[0] ?? null
  const nextQueue = snapshot.next.slice(1, 5)

  return (
    <div className="flex w-full max-w-xs flex-col gap-4 rounded-xl border border-slate-200 bg-white/90 p-4 dark:border-slate-700 dark:bg-slate-900/90">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <dt className="text-slate-500 dark:text-slate-400">점수</dt>
        <dd className="font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
          {snapshot.score.toLocaleString()}
        </dd>
        <dt className="text-slate-500 dark:text-slate-400">최고</dt>
        <dd className="font-mono tabular-nums text-primary-600 dark:text-primary-400">
          {highScore.toLocaleString()}
        </dd>
        <dt className="text-slate-500 dark:text-slate-400">레벨</dt>
        <dd className="font-mono tabular-nums">{snapshot.level}</dd>
        <dt className="text-slate-500 dark:text-slate-400">라인</dt>
        <dd className="font-mono tabular-nums">{snapshot.lines}</dd>
      </dl>

      <div className="flex flex-wrap gap-6 border-t border-slate-200 pt-4 dark:border-slate-700">
        <div className={snapshot.holdLocked ? 'opacity-50' : ''}>
          <PieceMini id={snapshot.hold} label="홀드" />
          {snapshot.holdLocked && (
            <p className="mt-1 text-[10px] text-slate-500">고정 후 교체</p>
          )}
        </div>
        <div>
          <PieceMini id={nextPrimary} label="다음" />
        </div>
      </div>

      {nextQueue.length > 0 && (
        <div className="border-t border-slate-200 pt-3 dark:border-slate-700">
          <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            대기열
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
