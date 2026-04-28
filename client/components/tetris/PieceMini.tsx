'use client'

import { getShapeCells } from '@/lib/tetris/tetrominoes'
import type { PieceId } from '@/lib/tetris/types'
import { pieceSolidClass } from './cellColors'

export default function PieceMini({
  id,
  label,
}: {
  id: PieceId | null
  label: string
}) {
  if (!id) {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {label}
        </span>
        <div
          className="grid h-16 w-16 place-items-center rounded border border-dashed border-slate-300 bg-slate-100/80 dark:border-slate-600 dark:bg-slate-800/50"
          aria-hidden
        >
          <span className="text-[10px] text-slate-400">—</span>
        </div>
      </div>
    )
  }
  const cells = getShapeCells(id, 0)
  const grid = Array.from({ length: 4 }, () => Array(4).fill(false))
  for (const [x, y] of cells) {
    if (y < 4 && x < 4) grid[y][x] = true
  }
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
        {label}
      </span>
      <div
        className="grid h-16 w-16 grid-cols-4 grid-rows-4 gap-px rounded border border-slate-200 bg-slate-200 p-0.5 dark:border-slate-600 dark:bg-slate-700"
        aria-hidden
      >
        {grid.map((row, ri) =>
          row.map((on, ci) => (
            <div
              key={`${ri}-${ci}`}
              className={
                on
                  ? `rounded-sm ${pieceSolidClass(id)}`
                  : 'rounded-sm bg-transparent'
              }
            />
          ))
        )}
      </div>
    </div>
  )
}
