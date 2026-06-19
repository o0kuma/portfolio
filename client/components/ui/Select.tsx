import { forwardRef } from 'react'
import { FiChevronDown } from 'react-icons/fi'

type Option = { value: string; label: string }

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  error?: string
  hint?: string
  options: Option[]
  placeholder?: string
}

export default forwardRef<HTMLSelectElement, Props>(function Select(
  { label, error, hint, options, placeholder, className = '', id, ...rest },
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
      <div className="relative">
        <select
          ref={ref}
          id={inputId}
          className={[
            'w-full appearance-none rounded-lg border bg-neutral-900 px-3.5 py-2.5 pr-9 text-sm text-neutral-100',
            'transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 focus:ring-offset-neutral-950',
            error
              ? 'border-rose-500 focus:ring-rose-500'
              : 'border-neutral-700 hover:border-neutral-600',
            className,
          ].join(' ')}
          {...rest}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
      </div>
      {error && <p className="text-xs text-rose-400">{error}</p>}
      {hint && !error && <p className="text-xs text-neutral-600">{hint}</p>}
    </div>
  )
})
