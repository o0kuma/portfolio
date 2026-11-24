'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { FiArrowRight, FiExternalLink, FiGithub } from 'react-icons/fi'
import PageShell from '@/components/site/PageShell'
import {
  Container,
  HandNote,
  Tape,
  TabBar,
  buttonQuiet,
  buttonSecondary,
  cardClass,
  tabClass,
} from '@/components/site/layout'
import { useLanguage } from '@/lib/LanguageContext'
import { interpolate } from '@/lib/i18n'
import { toast } from '@/lib/toast'
import { SITE_EMAIL, SITE_GITHUB } from '@/lib/site'
import type { AboutInterest, AboutTool } from '@/lib/notion'
import {
  CONTACT_PHONE,
  DEFAULT_SKILL_CATEGORIES,
  FALLBACK_INTERESTS,
  FALLBACK_TOOLS,
  PROJECT_CATEGORIES,
  SAMPLE_PROJECTS,
  TIMELINE,
  formatProjectDate,
  getCaseStudySlug,
  localizeProject,
  type Project,
} from '@/lib/portfolio-data'

const AIInterviewer = dynamic(() => import('@/components/AIInterviewer'), {
  ssr: false,
  loading: () => <div className="min-h-[320px]" aria-hidden />,
})

const START_YEAR = 2019

type SkillEntry = { category: string; name: string; level: number }

function SectionTitle({ id, title, note }: { id?: string; title: ReactNode; note?: ReactNode }) {
  return (
    <div id={id} className="mb-8 flex scroll-mt-24 flex-wrap items-end justify-between gap-3">
      <h2 className="text-[36px] font-black leading-none tracking-[-0.045em] md:text-[48px]">{title}</h2>
      {note && <HandNote className="-rotate-2">{note}</HandNote>}
    </div>
  )
}

function ProjectCard({ project, en }: { project: Project; en: boolean }) {
  const [open, setOpen] = useState(false)
  const slug = getCaseStudySlug(project.title)
  const period = `${formatProjectDate(project.startDate, en ? 'en' : 'ko')} – ${formatProjectDate(project.endDate, en ? 'en' : 'ko')}`

  return (
    <article className={`${cardClass} flex flex-col p-6 ${open ? 'md:col-span-2' : ''}`}>
      {project.featured && (
        <span className="absolute -top-3.5 right-5 rotate-[5deg] rounded-lg border-2 border-ink bg-cat-post px-2 py-0.5 text-xs font-black shadow-[2px_2px_0_#141414]">
          {en ? 'Featured' : '대표'}
        </span>
      )}
      <p className="text-xs font-bold text-ink-soft">{period}</p>
      <h3 className="mt-2 break-keep text-2xl font-black tracking-[-0.03em]">{project.title}</h3>
      <p className="mt-1 text-sm leading-[1.6] text-ink-soft">{project.description}</p>
      <ul className="mt-4 flex flex-wrap gap-1.5">
        {project.technologies.map((tech) => (
          <li key={tech} className="rounded-full border-2 border-ink bg-white px-2 py-0.5 text-[11px] font-extrabold">
            {tech}
          </li>
        ))}
      </ul>

      {open && (
        <div className="mt-5 border-t-2 border-dashed border-ink pt-4 text-[15px] leading-[1.75]">
          <p>{project.content}</p>
          {(project.role || project.participants) && (
            <p className="mt-3 text-sm text-ink-soft">
              {[project.participants, project.role].filter(Boolean).join(' · ')}
            </p>
          )}
          {project.retrospective && (
            <p className="mt-3 rounded-lg border-2 border-ink bg-paper p-3 text-sm">
              <span className="font-extrabold">{en ? 'Looking back · ' : '돌아보며 · '}</span>
              {project.retrospective}
            </p>
          )}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2 pt-1">
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className={buttonQuiet}>
          {open ? (en ? 'Less' : '접기') : en ? 'Details' : '자세히'}
        </button>
        {slug && (
          <Link href={`/portfolio/${slug}`} className={buttonQuiet}>
            {en ? 'Case study' : '사례 보기'} <FiArrowRight size={12} aria-hidden />
          </Link>
        )}
        {project.liveUrl && (
          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className={buttonQuiet}>
            {en ? 'Site' : '사이트'} <FiExternalLink size={12} aria-hidden />
          </a>
        )}
        {project.githubUrl && (
          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className={buttonQuiet}>
            <FiGithub size={12} aria-hidden /> GitHub
          </a>
        )}
      </div>
    </article>
  )
}

function ContactForm({ en }: { en: boolean }) {
  const { t } = useLanguage()
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState<null | { emailDelivered: boolean }>(null)

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const result = (await res.json()) as { emailSent?: boolean; message?: string }
      if (!res.ok) throw new Error(result.message || t.contact.sendError)
      setSent({ emailDelivered: !!result.emailSent })
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch {
      toast.error(t.contact.sendErrorRetry)
    } finally {
      setSending(false)
    }
  }

  const field = 'w-full rounded-xl border-2 border-ink bg-white px-4 py-2.5 text-[15px] text-ink placeholder:text-ink-soft focus:outline-none'

  if (sent) {
    return (
      <div className="rounded-xl border-2 border-ink bg-cat-recipe p-6">
        <p className="text-lg font-black">{t.contact.successTitle.replace('!', '')}</p>
        <p className="mt-1 text-sm">{sent.emailDelivered ? t.contact.successDesc : t.contact.emailWarning}</p>
        <button type="button" onClick={() => setSent(null)} className={`${buttonSecondary} mt-4`}>
          {t.contact.newMessage}
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="name" required value={form.name} onChange={onChange} placeholder={t.contact.namePlaceholder} aria-label={t.contact.namePlaceholder} className={field} />
        <input name="email" type="email" required value={form.email} onChange={onChange} placeholder={t.contact.emailPlaceholder} aria-label={t.contact.emailPlaceholder} className={field} />
      </div>
      <input name="subject" required value={form.subject} onChange={onChange} placeholder={t.contact.subjectPlaceholder} aria-label={t.contact.subjectPlaceholder} className={field} />
      <textarea name="message" required rows={5} value={form.message} onChange={onChange} placeholder={t.contact.messagePlaceholder} aria-label={t.contact.messagePlaceholder} className={`${field} resize-y`} />
      <div>
        <button type="submit" disabled={sending} className={`${buttonSecondary} disabled:opacity-50`}>
          {sending ? (en ? 'Sending…' : '보내는 중…') : t.contact.send}
        </button>
      </div>
    </form>
  )
}

/** /portfolio — the notebook's "about me" spread, in the scrapbook style. */
export default function PortfolioClient() {
  const { t, locale } = useLanguage()
  const en = locale === 'en'
  const years = new Date().getFullYear() - START_YEAR

  const [interests, setInterests] = useState<AboutInterest[]>(FALLBACK_INTERESTS)
  const [tools, setTools] = useState<AboutTool[]>(FALLBACK_TOOLS)
  const [remoteSkills, setRemoteSkills] = useState<SkillEntry[] | null>(null)
  const [category, setCategory] = useState('all')

  useEffect(() => {
    // Same Notion source the old about/skills sections used; falls back to
    // the built-in lists when it is unreachable.
    fetch('/api/about-skills')
      .then((r) => r.json())
      .then((data: { interests?: AboutInterest[]; tools?: AboutTool[]; skills?: SkillEntry[] }) => {
        if (Array.isArray(data.interests) && data.interests.length > 0) setInterests(data.interests)
        if (Array.isArray(data.tools) && data.tools.length > 0) setTools(data.tools)
        if (Array.isArray(data.skills) && data.skills.length > 0) setRemoteSkills(data.skills)
      })
      .catch(() => {})
  }, [])

  const skillCategories = useMemo(() => {
    if (!remoteSkills) return DEFAULT_SKILL_CATEGORIES
    return DEFAULT_SKILL_CATEGORIES.map((cat) => {
      const rows = remoteSkills.filter((s) => s.category === cat.id)
      return rows.length > 0 ? { ...cat, skills: rows.map((s) => ({ name: s.name, level: s.level })) } : cat
    })
  }, [remoteSkills])

  const projects = useMemo(() => SAMPLE_PROJECTS.map((p) => localizeProject(p, locale)), [locale])
  const shownProjects = category === 'all' ? projects : projects.filter((p) => p.category === category)
  const usedCategories = PROJECT_CATEGORIES.filter((c) => c.id === 'all' || projects.some((p) => p.category === c.id))
  const skillCount = skillCategories.reduce((n, c) => n + c.skills.length, 0)

  const stats = [
    { value: `${years}+`, label: t.about.statYearsSuffix },
    { value: String(projects.length), label: t.about.statProjectsSuffix },
    { value: String(skillCount), label: en ? 'tools & languages' : '다루는 기술' },
  ]

  return (
    <PageShell>
      {/* Cover */}
      <Container className="pt-12 md:pt-16">
        <section className="grid items-end gap-6 md:grid-cols-[1fr_auto]">
          <div>
            <p className="text-sm font-bold text-ink-soft">{t.about.role}</p>
            <h1 className="mt-3 text-[56px] font-black leading-[1.05] tracking-[-0.055em] md:text-[104px]">
              {en ? 'Developer ' : '개발자 '}
              <span className="inline-block -rotate-2 rounded-xl border-[3px] border-ink bg-cat-post px-[0.12em] shadow-ink">okuma</span>
            </h1>
            <p className="mt-6 max-w-[48ch] whitespace-pre-line text-lg leading-[1.7]">{interpolate(t.hero.description, { years })}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#projects" className={buttonSecondary}>
                {t.hero.viewProjects}
              </a>
              <a href="#contact" className={buttonSecondary}>
                {t.hero.contactMe}
              </a>
            </div>
          </div>
          <div className="hidden pb-4 md:block">
            <span className="grid h-[88px] w-[88px] rotate-[8deg] place-items-center rounded-full border-[2.5px] border-dashed border-ink text-center text-sm font-black leading-tight">
              since
              <br />
              {START_YEAR}
            </span>
          </div>
        </section>

        {/* Numbers */}
        <section className="mt-12 grid gap-4 sm:grid-cols-3" aria-label={en ? 'In numbers' : '숫자로 보기'}>
          {stats.map((s) => (
            <div key={s.label} className={`${cardClass} p-5`}>
              <p className="text-[40px] font-black leading-none tracking-[-0.04em]">{s.value}</p>
              <p className="mt-2 text-sm font-bold">{s.label}</p>
            </div>
          ))}
        </section>

        {/* About */}
        <section className="mt-20">
          <SectionTitle id="about" title={en ? 'About' : '소개'} />
          <div className="relative rounded-md border-2 border-ink bg-white px-6 py-8 pl-10 shadow-ink-lg md:px-12 md:py-10 md:pl-16">
            <span aria-hidden className="absolute bottom-0 left-[22px] top-0 border-l-2 border-cat-food/60 md:left-[30px]" />
            <p className="text-[26px] font-black leading-[1.3] tracking-[-0.03em] md:text-[32px]">
              {t.about.heading1} {t.about.heading2}
            </p>
            <div className="mt-5 max-w-[62ch] space-y-4 text-[17px] leading-[1.9]">
              <p>{t.about.p1}</p>
              <p>{interpolate(t.about.p2, { years })}</p>
              <p>{t.about.p3}</p>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-sm font-extrabold">{en ? 'Into lately' : '요즘 관심사'}</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {interests.map((it) => (
                    <li key={it.ko} className="rounded-full border-2 border-ink bg-cat-post px-3 py-1 text-xs font-extrabold">
                      {en ? it.en : it.ko}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-extrabold">{en ? 'Daily tools' : '자주 쓰는 도구'}</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {tools.map((tool) => (
                    <li key={tool.name} className="rounded-full border-2 border-ink bg-white px-3 py-1 text-xs font-extrabold">
                      {tool.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Skills */}
        <section className="mt-20">
          <SectionTitle id="skills" title={en ? 'Skills' : '기술'} note={en ? 'most used first' : '많이 쓰는 순서대로'} />
          <div className="grid gap-5 md:grid-cols-2">
            {skillCategories.map((cat) => (
              <div key={cat.id} className={`${cardClass} p-6`}>
                <p className="text-xl font-black">{en ? cat.label : cat.labelKo}</p>
                <p className="mt-0.5 text-sm text-ink-soft">{en ? cat.desc : cat.descKo}</p>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {[...cat.skills]
                    .sort((a, b) => b.level - a.level)
                    .map((s) => (
                      <li key={s.name} className="rounded-full border-2 border-ink bg-white px-2.5 py-0.5 text-xs font-extrabold">
                        {s.name}
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Career */}
        <section className="mt-20">
          <SectionTitle id="career" title={en ? 'Career' : '경력'} />
          <ol className="grid gap-5">
            {TIMELINE.map((item) => (
              <li key={`${item.company}-${item.period}`} className={`${cardClass} grid gap-4 p-6 md:grid-cols-[180px_1fr]`}>
                <div>
                  <p className="text-[28px] font-black leading-none tracking-[-0.04em]">{item.year}</p>
                  <p className="mt-2 text-xs font-bold text-ink-soft">{en ? item.periodEn : item.period}</p>
                </div>
                <div>
                  <p className="text-xl font-black">{en ? item.companyEn : item.company}</p>
                  <p className="text-sm font-bold text-ink-soft">{en ? item.roleEn : item.role}</p>
                  <ul className="mt-3 space-y-1.5 text-[15px] leading-[1.7]">
                    {(en ? item.highlightsEn : item.highlights).map((h) => (
                      <li key={h} className="flex gap-2">
                        <span aria-hidden>–</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                  {(en ? item.noteEn : item.note) && (
                    <p className="mt-3 rounded-lg border-2 border-ink bg-paper p-3 text-sm">{en ? item.noteEn : item.note}</p>
                  )}
                  {item.tech && item.tech.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {item.tech.map((tech) => (
                        <li key={tech} className="rounded-full border-2 border-ink bg-white px-2 py-0.5 text-[11px] font-extrabold">
                          {tech}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Projects */}
        <section className="mt-20">
          <SectionTitle id="projects" title={en ? 'Projects' : '프로젝트'} note={en ? `${projects.length} so far` : `지금까지 ${projects.length}개`} />
          <div className="mb-6">
            <TabBar label={en ? 'Project type' : '프로젝트 종류'}>
              {usedCategories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  role="tab"
                  aria-selected={category === c.id}
                  onClick={() => setCategory(c.id)}
                  className={tabClass(category === c.id)}
                >
                  {en ? c.nameEn : c.name}
                </button>
              ))}
            </TabBar>
          </div>
          <div className="grid items-start gap-6 md:grid-cols-2 lg:grid-cols-3">
            {shownProjects.map((p) => (
              <ProjectCard key={p.id} project={p} en={en} />
            ))}
          </div>
        </section>

        {/* AI interviewer: a chat screen placed on the page */}
        <section className="mt-20">
          <SectionTitle id="ai-interviewer" title={en ? 'Ask the AI' : 'AI에게 물어보기'} note={en ? 'for recruiters' : '채용 담당자용'} />
          <div className="dark theme-locked-dark overflow-hidden rounded-xl border-2 border-ink bg-[#06070d] text-white shadow-ink">
            <div className="flex h-8 items-center gap-1.5 border-b-2 border-ink bg-cat-post px-3" aria-hidden>
              <i className="h-2.5 w-2.5 rounded-full border-[1.5px] border-ink bg-white" />
              <i className="h-2.5 w-2.5 rounded-full border-[1.5px] border-ink bg-white" />
              <i className="h-2.5 w-2.5 rounded-full border-[1.5px] border-ink bg-white" />
            </div>
            <AIInterviewer />
          </div>
        </section>

        {/* Contact */}
        <section className="mt-20">
          <SectionTitle id="contact" title={en ? 'Contact' : '연락하기'} />
          <div className="grid items-start gap-6 md:grid-cols-[1fr_1.4fr]">
            <div className={`${cardClass} bg-cat-post p-6`}>
              <Tape className="left-8 -rotate-3" />
              <p className="whitespace-pre-line text-lg font-bold leading-[1.6]">{t.contact.intro}</p>
              <dl className="mt-5 space-y-3 text-[15px]">
                <div>
                  <dt className="text-xs font-extrabold">{en ? 'Email' : '이메일'}</dt>
                  <dd>
                    <a href={`mailto:${SITE_EMAIL}`} className="font-bold underline decoration-2 underline-offset-4">
                      {SITE_EMAIL}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-extrabold">{en ? 'Phone' : '전화'}</dt>
                  <dd>
                    <a href={`tel:${CONTACT_PHONE.tel}`} className="font-bold">
                      {CONTACT_PHONE.display}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-extrabold">{en ? 'Hours' : '연락 가능 시간'}</dt>
                  <dd className="font-bold">{t.contact.hours}</dd>
                </div>
              </dl>
              <a href={SITE_GITHUB} target="_blank" rel="noopener noreferrer" className={`${buttonSecondary} mt-6`}>
                <FiGithub size={14} aria-hidden /> GitHub
              </a>
            </div>
            <div className={`${cardClass} p-6`}>
              <ContactForm en={en} />
            </div>
          </div>
        </section>
      </Container>
    </PageShell>
  )
}
