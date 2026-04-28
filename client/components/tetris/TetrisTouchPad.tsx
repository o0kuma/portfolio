'use client'

export default function TetrisTouchPad({
  onLeft,
  onRight,
  onSoftDrop,
  onHardDrop,
  onRotateCW,
  onRotateCCW,
  onHold,
  onPause,
  disabled,
}: {
  onLeft: () => void
  onRight: () => void
  onSoftDrop: () => void
  onHardDrop: () => void
  onRotateCW: () => void
  onRotateCCW: () => void
  onHold: () => void
  onPause: () => void
  disabled: boolean
}) {
  const btn =
    'inline-flex min-h-[44px] min-w-[44px] select-none items-center justify-center rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-800 shadow-sm transition active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 disabled:opacity-40'

  return (
    <div
      className="mt-4 grid w-full max-w-[360px] grid-cols-3 gap-2 sm:max-w-none"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      <button type="button" className={btn} disabled={disabled} onClick={onHold}>
        홀드
      </button>
      <button type="button" className={btn} disabled={disabled} onClick={onPause}>
        일시정지
      </button>
      <button type="button" className={btn} disabled={disabled} onClick={onHardDrop}>
        하드
      </button>

      <button type="button" className={btn} disabled={disabled} onClick={onRotateCCW}>
        ↺
      </button>
      <button type="button" className={btn} disabled={disabled} onClick={onSoftDrop}>
        소프트
      </button>
      <button type="button" className={btn} disabled={disabled} onClick={onRotateCW}>
        ↻
      </button>

      <button type="button" className={btn} disabled={disabled} onClick={onLeft}>
        ←
      </button>
      <button type="button" className={btn} disabled={disabled} onClick={onSoftDrop}>
        ↓
      </button>
      <button type="button" className={btn} disabled={disabled} onClick={onRight}>
        →
      </button>
    </div>
  )
}
