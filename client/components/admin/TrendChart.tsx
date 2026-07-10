'use client'

import { useState } from 'react'

export type TrendSeries = {
  key: string
  label: string
  color: string
  points: { day: string; count: number }[]
}

const WIDTH = 560
const HEIGHT = 180
const PAD_LEFT = 34
const PAD_RIGHT = 12
const PAD_TOP = 12
const PAD_BOTTOM = 24

function formatDay(day: string) {
  const [, m, d] = day.split('-')
  return `${Number(m)}/${Number(d)}`
}

/** Compact multi-series line chart for the admin trend widgets — plain SVG, no chart library. */
export default function TrendChart({ series, unit }: { series: TrendSeries[]; unit?: string }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

  const days = series[0]?.points.map((p) => p.day) ?? []
  const maxCount = Math.max(1, ...series.flatMap((s) => s.points.map((p) => p.count)))
  const plotW = WIDTH - PAD_LEFT - PAD_RIGHT
  const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM

  const xFor = (i: number) => PAD_LEFT + (days.length <= 1 ? plotW / 2 : (i / (days.length - 1)) * plotW)
  const yFor = (count: number) => PAD_TOP + plotH - (count / maxCount) * plotH

  const gridSteps = 4
  const gridValues = Array.from({ length: gridSteps + 1 }, (_, i) => Math.round((maxCount / gridSteps) * i))

  return (
    <div className="relative">
      {/* Legend — labels always visible, never color-alone identity */}
      {series.length > 1 && (
        <div className="mb-2 flex flex-wrap items-center gap-3">
          {series.map((s) => (
            <span key={s.key} className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
              <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
              {s.label}
            </span>
          ))}
        </div>
      )}

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label={series.map((s) => s.label).join(', ')}>
        {/* Gridlines */}
        {gridValues.map((v) => (
          <g key={v}>
            <line
              x1={PAD_LEFT}
              x2={WIDTH - PAD_RIGHT}
              y1={yFor(v)}
              y2={yFor(v)}
              className="stroke-gray-200 dark:stroke-gray-700"
              strokeWidth={1}
            />
            <text x={PAD_LEFT - 6} y={yFor(v)} textAnchor="end" dominantBaseline="middle" className="fill-gray-400 dark:fill-gray-500" fontSize={9}>
              {v}
            </text>
          </g>
        ))}

        {/* X axis day labels */}
        {days.map((day, i) => (
          <text
            key={day}
            x={xFor(i)}
            y={HEIGHT - 6}
            textAnchor="middle"
            className="fill-gray-400 dark:fill-gray-500"
            fontSize={9}
          >
            {formatDay(day)}
          </text>
        ))}

        {/* Lines */}
        {series.map((s) => {
          const d = s.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(p.count)}`).join(' ')
          return (
            <path
              key={s.key}
              d={d}
              fill="none"
              stroke={s.color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )
        })}

        {/* Dots + oversized invisible hit targets */}
        {series.map((s) =>
          s.points.map((p, i) => (
            <g key={`${s.key}-${i}`}>
              <circle
                cx={xFor(i)}
                cy={yFor(p.count)}
                r={4}
                fill={s.color}
                className="stroke-white dark:stroke-gray-900"
                strokeWidth={1.5}
              />
              <circle
                cx={xFor(i)}
                cy={yFor(p.count)}
                r={9}
                fill="transparent"
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx((cur) => (cur === i ? null : cur))}
                style={{ cursor: 'pointer' }}
              />
            </g>
          ))
        )}

        {/* Hover crosshair */}
        {hoverIdx !== null && (
          <line
            x1={xFor(hoverIdx)}
            x2={xFor(hoverIdx)}
            y1={PAD_TOP}
            y2={HEIGHT - PAD_BOTTOM}
            className="stroke-gray-300 dark:stroke-gray-600"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
        )}
      </svg>

      {/* Tooltip */}
      {hoverIdx !== null && (
        <div
          className="pointer-events-none absolute rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs shadow-lg dark:border-gray-700 dark:bg-gray-800"
          style={{
            left: `${(xFor(hoverIdx) / WIDTH) * 100}%`,
            top: 0,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="mb-0.5 font-medium text-gray-700 dark:text-gray-200">{formatDay(days[hoverIdx])}</div>
          {series.map((s) => (
            <div key={s.key} className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
              <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.color }} />
              {s.label}: <span className="font-semibold text-gray-700 dark:text-gray-200">{s.points[hoverIdx]?.count ?? 0}{unit ?? ''}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
