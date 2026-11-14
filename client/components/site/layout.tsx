import type { ReactNode } from 'react'

export type PageWidth = 'reading' | 'list' | 'wide'

const WIDTH: Record<PageWidth, string> = {
  reading: 'max-w-reading',
  list: 'max-w-list',
  wide: 'max-w-wide',
}

/** Centred content column at one of the three design widths. */
export function Container({ width = 'list', className = '', children }: { width?: PageWidth; className?: string; children: ReactNode }) {
  return <div className={`mx-auto w-full ${WIDTH[width]} px-5 md:px-8 ${className}`}>{children}</div>
}

/** Page head: small section name, title, one-line intro, optional count and actions. */
export function PageHeader({
  eyebrow,
  title,
  description,
  meta,
  actions,
  width = 'list',
}: {
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  meta?: ReactNode
  actions?: ReactNode
  width?: PageWidth
}) {
  return (
    <Container width={width} className="pb-8 pt-14 md:pb-10 md:pt-20">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          {eyebrow && <p className="mb-3 text-xs text-fg-subtle">{eyebrow}</p>}
          <h1 className="text-[32px] font-bold leading-[1.3] tracking-[-0.02em] text-fg md:text-[40px]">{title}</h1>
          {description && <p className="mt-3 text-base leading-[1.7] text-fg-muted md:text-lg">{description}</p>}
          {meta && <p className="mt-2 text-xs text-fg-subtle">{meta}</p>}
        </div>
        {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
      </div>
    </Container>
  )
}

/** Text tabs with an underline on the selected one. Scrolls sideways on phones. */
export function TabBar({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div role="tablist" aria-label={label} className="-mx-5 flex gap-5 overflow-x-auto border-b border-line px-5 md:mx-0 md:px-0">
      {children}
    </div>
  )
}

export function tabClass(active: boolean): string {
  return `shrink-0 whitespace-nowrap border-b-2 pb-3 pt-1 text-sm transition-colors ${
    active ? 'border-star text-fg' : 'border-transparent text-fg-muted hover:text-fg'
  }`
}

/** Empty or error state: one sentence and at most one button. */
export function EmptyState({ message, action }: { message: ReactNode; action?: ReactNode }) {
  return (
    <div className="py-20 text-center">
      <p className="text-sm text-fg-muted">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export const buttonSecondary =
  'inline-flex items-center gap-2 rounded-md border border-line-strong px-4 py-2 text-sm text-fg transition-colors hover:bg-panel-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-star'

export const buttonQuiet =
  'inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-xs text-fg-muted transition-colors hover:border-line-strong hover:text-fg'
