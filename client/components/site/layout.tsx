import type { ReactNode } from 'react'

/**
 * Scrapbook design parts. Pages compose these instead of writing colours,
 * borders or shadows themselves (see the design doc's layer rule).
 */

export type PageWidth = 'reading' | 'list' | 'wide'

const WIDTH: Record<PageWidth, string> = {
  reading: 'max-w-reading',
  list: 'max-w-wide',
  wide: 'max-w-wide',
}

/** One colour per menu: 글 / 레시피 / 맛집 / 게임. */
export type Section = 'post' | 'recipe' | 'food' | 'game'

export const SECTION_BG: Record<Section, string> = {
  post: 'bg-cat-post',
  recipe: 'bg-cat-recipe',
  food: 'bg-cat-food',
  game: 'bg-cat-game',
}

/** Centred content column at one of the design widths. */
export function Container({ width = 'list', className = '', children }: { width?: PageWidth; className?: string; children: ReactNode }) {
  return <div className={`mx-auto w-full ${WIDTH[width]} px-5 md:px-8 ${className}`}>{children}</div>
}

/** Page head: very large title, one-line intro, optional count, actions and a handwritten label. */
export function PageHeader({
  eyebrow,
  title,
  description,
  meta,
  actions,
  note,
  width = 'list',
}: {
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  meta?: ReactNode
  actions?: ReactNode
  /** Short handwritten label shown at the right (design doc §8). */
  note?: ReactNode
  width?: PageWidth
}) {
  return (
    <Container width={width} className="pb-8 pt-12 md:pb-10 md:pt-16">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          {eyebrow && <p className="mb-3 text-sm font-bold text-ink-soft">{eyebrow}</p>}
          <h1 className="break-keep text-[44px] font-black leading-[1.05] tracking-[-0.05em] text-ink md:text-[72px]">{title}</h1>
          {description && <p className="mt-4 text-base leading-[1.7] text-ink-soft md:text-[17px]">{description}</p>}
          {meta && <p className="mt-2 text-xs font-bold text-ink-soft">{meta}</p>}
        </div>
        {(actions || note) && (
          <div className="flex shrink-0 flex-col items-start gap-3 md:items-end">
            {note && <HandNote className="-rotate-3">{note}</HandNote>}
            {actions && <div className="flex gap-2">{actions}</div>}
          </div>
        )}
      </div>
    </Container>
  )
}

/** Blue-pen handwritten label. Only for short labels or the owner's own notes. */
export function HandNote({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`inline-block font-hand text-[23px] leading-[1.1] text-pen ${className}`}>{children}</span>
}

/** Round filter buttons; the selected one is filled with ink. */
export function TabBar({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div role="tablist" aria-label={label} className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 md:mx-0 md:flex-wrap md:px-0">
      {children}
    </div>
  )
}

export function tabClass(active: boolean): string {
  return `shrink-0 whitespace-nowrap rounded-full border-2 border-ink px-4 py-1.5 text-sm font-extrabold transition-colors ${
    active ? 'bg-ink text-paper' : 'bg-white text-ink hover:bg-paper'
  }`
}

/** Section tag pill: `<span className={tagClass}><Dot section="post" />푸드</span>` */
export const tagClass =
  'inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-white px-2.5 py-0.5 text-xs font-extrabold text-ink'

export function Dot({ section }: { section: Section }) {
  return <i className={`inline-block h-2 w-2 rounded-full border-[1.5px] border-ink ${SECTION_BG[section]}`} aria-hidden />
}

/** White (or section-coloured) card with ink border and a flat ink shadow. */
export const cardClass = 'relative rounded-[14px] border-2 border-ink bg-white shadow-ink'
/** Card that lifts and tilts slightly on hover (links). */
export const cardLinkClass = `${cardClass} block transition-transform duration-200 hover:-translate-y-[3px] hover:-rotate-[0.6deg] motion-reduce:transform-none`

/** Masking tape strip on a card's top edge. Use at most two per screen. */
export function Tape({ className = '', color = 'post' }: { className?: string; color?: 'post' | 'recipe' }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute -top-[13px] h-[26px] w-24 ${className}`}
      style={{
        background: `repeating-linear-gradient(90deg, rgba(255,255,255,.35) 0 6px, transparent 6px 12px), ${
          color === 'post' ? 'rgba(255,210,63,.65)' : 'rgba(159,230,200,.8)'
        }`,
      }}
    />
  )
}

/** Empty or error state: one sentence and at most one button. */
export function EmptyState({ message, action }: { message: ReactNode; action?: ReactNode }) {
  return (
    <div className={`${cardClass} px-6 py-14 text-center`}>
      <p className="text-base text-ink-soft">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

/** Main button: presses into its shadow. */
export const buttonSecondary =
  'inline-flex items-center gap-2 rounded-xl border-2 border-ink bg-white px-4 py-2 text-sm font-extrabold text-ink shadow-ink-sm transition-[transform,box-shadow] duration-100 hover:-translate-x-px hover:-translate-y-px active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'

/** Small round button. */
export const buttonQuiet =
  'inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-white px-3 py-1 text-xs font-extrabold text-ink transition-colors hover:bg-paper'
