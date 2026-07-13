'use client'

import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/LanguageContext'
import { portfolioViewport, staggerContainer, staggerItem, EASE_OUT } from '@/lib/portfolioMotion'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

type Axis = { label: string; labelKo: string; value: number }  // value 0-100

const AXES: Axis[] = [
  { label: 'Frontend',   labelKo: '프론트엔드', value: 95 },
  { label: 'Backend',    labelKo: '백엔드',     value: 75 },
  { label: 'UI/UX',      labelKo: 'UI/UX',     value: 80 },
  { label: 'DevOps',     labelKo: '데브옵스',   value: 60 },
  { label: 'Game Dev',   labelKo: '게임개발',   value: 70 },
  { label: 'Database',   labelKo: '데이터베이스', value: 72 },
]

const LEVELS = [20, 40, 60, 80, 100]
const SIZE = 280
const CX = SIZE / 2
const CY = SIZE / 2
const R = 110

function polarToCart(angle: number, r: number) {
  const rad = (angle - 90) * (Math.PI / 180)
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) }
}

function makePolygon(values: number[]): string {
  return values
    .map((v, i) => {
      const angle = (360 / values.length) * i
      const pt = polarToCart(angle, (v / 100) * R)
      return `${pt.x},${pt.y}`
    })
    .join(' ')
}

type Props = { animated?: boolean }

export default function SkillRadar({ animated = true }: Props) {
  const { locale } = useLanguage()
  const reduced = usePrefersReducedMotion()
  const n = AXES.length
  const angles = AXES.map((_, i) => (360 / n) * i)

  const dataPolygon = makePolygon(AXES.map(a => a.value))

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={portfolioViewport}
      className="flex flex-col items-center gap-8"
    >
      <motion.div variants={staggerItem}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="overflow-visible">
          {/* Grid rings */}
          {LEVELS.map(level => (
            <polygon
              key={level}
              points={makePolygon(Array(n).fill(level))}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />
          ))}

          {/* Axis spokes */}
          {angles.map((angle, i) => {
            const end = polarToCart(angle, R)
            return (
              <line
                key={i}
                x1={CX} y1={CY}
                x2={end.x} y2={end.y}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
              />
            )
          })}

          {/* Data polygon */}
          {(reduced || !animated) ? (
            <polygon
              points={dataPolygon}
              fill="rgba(99,102,241,0.25)"
              stroke="rgb(99,102,241)"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          ) : (
            <motion.polygon
              points={makePolygon(Array(n).fill(0))}
              animate={{ points: dataPolygon }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
              fill="rgba(99,102,241,0.25)"
              stroke="rgb(99,102,241)"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          )}

          {/* Axis dots */}
          {AXES.map((axis, i) => {
            const angle = angles[i]
            const pt = polarToCart(angle, (axis.value / 100) * R)
            return (
              <motion.circle
                key={i}
                cx={pt.x} cy={pt.y} r={4}
                fill="rgb(99,102,241)"
                initial={animated && !reduced ? { opacity: 0 } : { opacity: 1 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 1.2 + i * 0.05 }}
                viewport={{ once: true }}
              />
            )
          })}

          {/* Labels */}
          {AXES.map((axis, i) => {
            const angle = angles[i]
            const pt = polarToCart(angle, R + 28)
            const anchor = pt.x < CX - 5 ? 'end' : pt.x > CX + 5 ? 'start' : 'middle'
            return (
              <g key={i}>
                <text
                  x={pt.x} y={pt.y - 4}
                  textAnchor={anchor}
                  fill="rgb(163,163,163)"
                  fontSize="11"
                  fontFamily="ui-monospace,monospace"
                  fontWeight="600"
                >
                  {locale === 'ko' ? axis.labelKo : axis.label}
                </text>
                <text
                  x={pt.x} y={pt.y + 10}
                  textAnchor={anchor}
                  fill="rgb(82,82,82)"
                  fontSize="10"
                  fontFamily="ui-monospace,monospace"
                >
                  {axis.value}%
                </text>
              </g>
            )
          })}
        </svg>
      </motion.div>

      {/* Legend */}
      <motion.div variants={staggerItem} className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-sm">
        {AXES.map(axis => (
          <div key={axis.label} className="flex items-center gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-neutral-800 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-indigo-500"
                initial={{ width: reduced ? `${axis.value}%` : 0 }}
                whileInView={{ width: `${axis.value}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: reduced ? 0 : 0.5, ease: EASE_OUT }}
              />
            </div>
            <span className="text-[10px] font-mono text-neutral-600 shrink-0 w-6 text-right">{axis.value}</span>
          </div>
        ))}
      </motion.div>
    </motion.div>
  )
}
