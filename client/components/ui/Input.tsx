import { forwardRef } from 'react'

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
  hint?: string
  leftAddon?: React.ReactNode
  rightAddon?: React.ReactNode
}

export default forwardRef<HTMLInputElement, Props>(function Input(
  { label, error, hint, leftAddon, rightAddon, className = '', id, ...rest },
  ref,
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-neutral-300">
          {label}
          {rest.required && <span className="ml-1 text-rose-400">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {leftAddon && (
          <span className="absolute left-3 text-neutral-500 pointer-events-none">{leftAddon}</span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            'w-full rounded-lg border bg-neutral-900 px-3.5 py-2.5 text-sm text-neutral-100 placeholder-neutral-600',
            'transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 focus:ring-offset-neutral-950',
            error
              ? 'border-rose-500 focus:ring-rose-500'
              : 'border-neutral-700 hover:border-neutral-600',
            leftAddon ? 'pl-9' : '',
            rightAddon ? 'pr-9' : '',
            className,
          ].join(' ')}
          {...rest}
        />
        {rightAddon && (
          <span className="absolute right-3 text-neutral-500 pointer-events-none">{rightAddon}</span>
        )}
      </div>
      {error && <p className="text-xs text-rose-400">{error}</p>}
      {hint && !error && <p className="text-xs text-neutral-600">{hint}</p>}
    </div>
  )
})
