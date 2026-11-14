'use client'

import { useEffect, useState } from 'react'
import { FiAward } from 'react-icons/fi'
import PageShell from '@/components/site/PageShell'
import { Container, PageHeader } from '@/components/site/layout'
import { ACHIEVEMENTS, getEarned, type EarnedEntry } from '@/lib/achievements'
import { useLanguage } from '@/lib/LanguageContext'

export default function AchievementsPage() {
  const { locale } = useLanguage()
  const en = locale === 'en'
  const [earned, setEarned] = useState<EarnedEntry[]>([])

  useEffect(() => {
    // Earned list lives in localStorage; read after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEarned(getEarned())
  }, [])

  const earnedMap = new Map(earned.map((e) => [e.id, e.earnedAt]))
  const count = earned.length
  const total = ACHIEVEMENTS.length

  return (
    <PageShell>
      <PageHeader
        eyebrow={en ? 'Games' : '게임'}
        title={en ? 'Achievements' : '업적'}
        description={en ? 'Unlocked by playing the games and exploring the site.' : '게임을 하고 사이트를 둘러보면 하나씩 열립니다.'}
        meta={en ? `${count} of ${total} unlocked` : `${total}개 중 ${count}개 달성`}
      />
      <Container>
        <div className="mb-10 h-4 w-full overflow-hidden rounded-full border-2 border-ink bg-white" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={count}>
          <div className="h-full bg-cat-game" style={{ width: `${total ? (count / total) * 100 : 0}%` }} />
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ACHIEVEMENTS.map((ach) => {
            const earnedAt = earnedMap.get(ach.id)
            return (
              <li
                key={ach.id}
                className={`rounded-xl border-2 border-ink p-5 ${earnedAt ? 'bg-cat-game shadow-ink' : 'border-dashed bg-white/60'}`}
              >
                <FiAward size={18} className={earnedAt ? 'text-ink' : 'text-ink-soft'} aria-hidden />
                <p className={`mt-3 text-base font-semibold ${earnedAt ? 'text-fg' : 'text-fg-muted'}`}>{ach.name}</p>
                <p className="mt-1 text-sm leading-[1.6] text-fg-subtle">{ach.description}</p>
                <p className="mt-3 text-xs text-fg-subtle">
                  {earnedAt
                    ? new Date(earnedAt).toLocaleDateString(en ? 'en-US' : 'ko-KR')
                    : en
                      ? 'Locked'
                      : '아직 잠김'}
                </p>
              </li>
            )
          })}
        </ul>
      </Container>
    </PageShell>
  )
}
