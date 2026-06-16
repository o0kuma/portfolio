'use client'

import { useLanguage } from '@/lib/LanguageContext'

export default function TetrisHelp() {
  const { t } = useLanguage()
  return (
    <aside className="max-w-md rounded-xl border border-slate-200 bg-white/90 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-300">
      <h2 className="mb-3 font-semibold text-slate-900 dark:text-white">{t.tetrisHelp.controlsHeading}</h2>
      <ul className="space-y-2">
        <li>
          <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">←</kbd>{' '}
          <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">→</kbd>{' '}
          {t.tetrisHelp.moveLabel} ·{' '}
          <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">↓</kbd>{' '}
          {t.tetrisHelp.softDropLabel} ·{' '}
          <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">Space</kbd>{' '}
          {t.tetrisHelp.hardDropLabel}
        </li>
        <li>
          <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">↑</kbd>{' '}
          /{' '}
          <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">X</kbd>{' '}
          {t.tetrisHelp.cwLabel} ·{' '}
          <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">Z</kbd>{' '}
          {t.tetrisHelp.ccwLabel}
        </li>
        <li>
          <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">C</kbd>{' '}
          /{' '}
          <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">Shift</kbd>{' '}
          {t.tetrisHelp.holdLabel} ·{' '}
          <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">P</kbd>{' '}
          /{' '}
          <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">Esc</kbd>{' '}
          {t.tetrisHelp.pauseLabel}
        </li>
      </ul>
      <h3 className="mb-2 mt-4 font-semibold text-slate-900 dark:text-white">{t.tetrisHelp.mobileHeading}</h3>
      <ul className="space-y-1 text-xs">
        <li>{t.tetrisHelp.mobileSwipe}</li>
        <li>{t.tetrisHelp.mobileTap}</li>
        <li>{t.tetrisHelp.mobileButtons}</li>
      </ul>
    </aside>
  )
}
