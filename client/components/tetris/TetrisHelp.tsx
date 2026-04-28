'use client'

export default function TetrisHelp() {
  return (
    <aside className="max-w-md rounded-xl border border-slate-200 bg-white/90 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-300">
      <h2 className="mb-3 font-semibold text-slate-900 dark:text-white">조작</h2>
      <ul className="space-y-2">
        <li>
          <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">←</kbd>{' '}
          <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">→</kbd>{' '}
          이동 ·{' '}
          <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">↓</kbd>{' '}
          소프트 드롭 ·{' '}
          <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">Space</kbd>{' '}
          하드 드롭
        </li>
        <li>
          <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">↑</kbd>{' '}
          /{' '}
          <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">X</kbd>{' '}
          시계 회전 ·{' '}
          <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">Z</kbd>{' '}
          반시계 회전
        </li>
        <li>
          <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">C</kbd>{' '}
          /{' '}
          <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">Shift</kbd>{' '}
          홀드 ·{' '}
          <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">P</kbd>{' '}
          /{' '}
          <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">Esc</kbd>{' '}
          일시정지
        </li>
      </ul>
      <h3 className="mb-2 mt-4 font-semibold text-slate-900 dark:text-white">모바일</h3>
      <ul className="space-y-1 text-xs">
        <li>보드 위 스와이프: 좌·우·하 이동, 상으로 회전</li>
        <li>짧은 탭: 회전 · 길게 누르기: 하드 드롭</li>
        <li>하단 버튼으로도 동일 동작 가능</li>
      </ul>
    </aside>
  )
}
