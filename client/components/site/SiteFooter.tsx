'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { FiArrowUp } from 'react-icons/fi'
import { useLanguage } from '@/lib/LanguageContext'
import { useSiteSettings, type SiteSettingKey } from '@/lib/siteSettings'
import { SITE_AUTHOR, SITE_EMAIL, SITE_GITHUB } from '@/lib/site'
import { ExplorationStatus } from '@/components/ExplorationBadge'
import PushNotificationButton from '@/components/PushNotificationButton'
import { MORE_NAV, PRIMARY_NAV } from './nav'

const VisitorCounter = dynamic(() => import('@/components/VisitorCounter'), { ssr: false })
const VisitorGlobe = dynamic(() => import('@/components/home/VisitorGlobe'), {
  ssr: false,
  loading: () => <div className="h-16 w-16" aria-hidden />,
})

const SETTINGS: { key: SiteSettingKey; ko: string; en: string }[] = [
  { key: 'sound', ko: '배경음', en: 'Ambient sound' },
  { key: 'companion', ko: '쿠마 캐릭터', en: 'Kuuma companion' },
  { key: 'cursors', ko: '다른 방문자 커서', en: "Other visitors' cursors" },
]

const chip =
  'rounded-md border px-3 py-1.5 text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-star'

export default function SiteFooter() {
  const { locale, toggleLocale } = useLanguage()
  const en = locale === 'en'
  const { settings, toggle } = useSiteSettings()
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > window.innerHeight)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const year = new Date().getFullYear()

  return (
    <footer className="mt-24 border-t border-line bg-night text-fg">
      <div className="mx-auto max-w-wide px-5 py-14 md:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="font-logo text-2xl text-fg">
              kuuuma
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-fg-muted">
              {en
                ? 'Notes, recipes, places and small games, kept by one person.'
                : '한 사람이 꾸리는 글, 레시피, 맛집, 작은 게임 기록장입니다.'}
            </p>
          </div>

          <FooterColumn title={en ? 'Browse' : '둘러보기'}>
            {PRIMARY_NAV.map((item) => (
              <FooterLink key={item.href} href={item.href}>
                {en ? item.en : item.ko}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title={en ? 'More' : '더보기'}>
            {MORE_NAV.map((item) => (
              <FooterLink key={item.href} href={item.href}>
                {en ? item.en : item.ko}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title={en ? 'Contact' : '연락'}>
            <FooterLink href={SITE_GITHUB} external>
              GitHub
            </FooterLink>
            <FooterLink href={`mailto:${SITE_EMAIL}`} external>
              {en ? 'Email' : '이메일'}
            </FooterLink>
          </FooterColumn>
        </div>

        <div className="mt-12 border-t border-line pt-6">
          <p className="mb-3 text-xs text-fg-subtle">{en ? 'Site settings' : '사이트 설정'}</p>
          <div className="flex flex-wrap items-center gap-2">
            {SETTINGS.map((s) => {
              const on = settings[s.key]
              return (
                <button
                  key={s.key}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(s.key)}
                  className={`${chip} ${
                    on ? 'border-star/60 text-star' : 'border-line text-fg-muted hover:border-line-strong hover:text-fg'
                  }`}
                >
                  {en ? s.en : s.ko} {on ? (en ? 'on' : '켜짐') : en ? 'off' : '꺼짐'}
                </button>
              )
            })}
            <ExplorationStatus />
            <PushNotificationButton />
            <button
              type="button"
              onClick={toggleLocale}
              className={`${chip} border-line text-fg-muted hover:border-line-strong hover:text-fg`}
              aria-label={en ? 'Switch to Korean' : 'Switch to English'}
            >
              {en ? '한국어' : 'English'}
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 text-xs text-fg-subtle md:flex-row md:items-center md:justify-between">
          <p>
            © {year} kuuuma.com · {SITE_AUTHOR}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/privacy" className="hover:text-fg">
              {en ? 'Privacy' : '개인정보처리방침'}
            </Link>
            <Link href="/terms" className="hover:text-fg">
              {en ? 'Terms' : '이용약관'}
            </Link>
            <span className="flex items-center gap-2">
              <VisitorGlobe compact />
              <VisitorCounter />
            </span>
          </div>
        </div>
      </div>

      {showTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-24 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-line-strong bg-night/80 text-fg backdrop-blur transition-colors hover:bg-panel-2"
          aria-label={en ? 'Back to top' : '맨 위로'}
        >
          <FiArrowUp size={18} />
        </button>
      )}
    </footer>
  )
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-xs text-fg-subtle">{title}</p>
      <ul className="space-y-2">{children}</ul>
    </div>
  )
}

function FooterLink({ href, external, children }: { href: string; external?: boolean; children: React.ReactNode }) {
  const cls = 'text-sm text-fg-muted transition-colors hover:text-fg'
  return (
    <li>
      {external ? (
        <a href={href} className={cls} target={href.startsWith('mailto:') ? undefined : '_blank'} rel="noopener noreferrer">
          {children}
        </a>
      ) : (
        <Link href={href} className={cls}>
          {children}
        </Link>
      )}
    </li>
  )
}
