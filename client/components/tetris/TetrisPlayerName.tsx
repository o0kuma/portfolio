'use client'

import { readTetrisPlayerName, writeTetrisPlayerName } from '@/lib/tetris/leaderboardClient'
import { useLanguage } from '@/lib/LanguageContext'
import { useEffect, useState } from 'react'

export default function TetrisPlayerName() {
  const { t } = useLanguage()
  const [value, setValue] = useState('')

  useEffect(() => {
    setValue(readTetrisPlayerName())
  }, [])

  return (
    <div className="flex w-full max-w-xs flex-col gap-2 rounded-xl border border-slate-200 bg-white/90 p-4 dark:border-slate-700 dark:bg-slate-900/90">
      <label htmlFor="tetris-player-name" className="text-xs font-medium text-slate-500 dark:text-slate-400">
        {t.tetrisPlayerName.label}
      </label>
      <input
        id="tetris-player-name"
        type="text"
        maxLength={20}
        placeholder={t.tetrisPlayerName.placeholder}
        value={value}
        onChange={(e) => {
          const next = e.target.value
          setValue(next)
          writeTetrisPlayerName(next)
        }}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        autoComplete="nickname"
      />
      <p className="text-[10px] text-slate-500 dark:text-slate-500">
        {t.tetrisPlayerName.hint}
      </p>
    </div>
  )
}
