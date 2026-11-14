import type { ReactNode } from 'react'
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'

/** Every renewed page: top menu → content → footer, on the one night background. */
export default function PageShell({ children, overlayHeader = false }: { children: ReactNode; overlayHeader?: boolean }) {
  return (
    <div className="flex min-h-screen flex-col bg-night text-fg">
      <SiteHeader overlay={overlayHeader} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}
