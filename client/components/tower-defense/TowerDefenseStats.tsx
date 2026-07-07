'use client'

import { motion } from 'framer-motion'
import { TOWER_DEFS } from '@/lib/tower-defense/towers'
import type { RunStats } from '@/lib/tower-defense/types'
import type { TowerKind } from '@/lib/tower-defense/types'

type Props = { stats: RunStats; wave: number }

export default function TowerDefenseStats({ stats, wave }: Props) {
  const entries = (Object.entries(stats.killsByKind) as [TowerKind, number][])
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])

  const totalKills = Object.values(stats.killsByKind).reduce((a, b) => a + b, 0)

  if (entries.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      className="pointer-events-none absolute right-3 top-16 z-10 w-36 rounded-xl border border-white/10 bg-black/60 p-3 backdrop-blur-sm"
    >
      <p className="mb-2 text-[9px] font-mono uppercase tracking-widest text-white/40">
        Kill Stats
      </p>
      <div className="space-y-1.5">
        {entries.slice(0, 6).map(([kind, count]) => {
          const pct = totalKills > 0 ? (count / totalKills) * 100 : 0
          return (
            <div key={kind}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[10px] text-white/70 flex items-center gap-1">
                  <span>{TOWER_DEFS[kind].emoji}</span>
                  <span className="font-mono">{count}</span>
                </span>
                <span className="text-[9px] text-white/30 font-mono">{Math.round(pct)}%</span>
              </div>
              <div className="h-0.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full bg-white/40 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-2 border-t border-white/10 pt-2 flex justify-between">
        <span className="text-[9px] text-white/30 font-mono">Total Kills</span>
        <span className="text-[10px] text-white/60 font-mono font-bold">{totalKills}</span>
      </div>
    </motion.div>
  )
}
