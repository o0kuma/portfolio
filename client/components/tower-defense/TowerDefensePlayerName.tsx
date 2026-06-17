'use client'

import {
  readTowerDefensePlayerName,
  writeTowerDefensePlayerName,
} from '@/lib/tower-defense/leaderboardClient'
import { useLanguage } from '@/lib/LanguageContext'
import { useEffect, useState } from 'react'

export default function TowerDefensePlayerName() {
  const { t } = useLanguage()
  const pn = t.towerDefenseGame.playerName
  const [value, setValue] = useState('')

  useEffect(() => {
    setValue(readTowerDefensePlayerName())
  }, [])

  return (
    <div className="flex w-full max-w-xs flex-col gap-2 rounded-xl border border-slate-700 bg-slate-900/90 p-4">
      <label htmlFor="td-player-name" className="text-xs font-medium text-slate-400">
        {pn.label}
      </label>
      <input
        id="td-player-name"
        type="text"
        maxLength={20}
        placeholder={pn.placeholder}
        value={value}
        onChange={(e) => {
          const next = e.target.value
          setValue(next)
          writeTowerDefensePlayerName(next)
        }}
        className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        autoComplete="nickname"
      />
      <p className="text-[10px] text-slate-500">{pn.hint}</p>
    </div>
  )
}
