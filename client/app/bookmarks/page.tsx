'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiExternalLink } from 'react-icons/fi'
import PageShell from '@/components/site/PageShell'
import { Container, EmptyState, PageHeader, TabBar, tabClass, buttonQuiet } from '@/components/site/layout'
import { useBookmarks } from '@/hooks/useBookmarks'
import { useLanguage } from '@/lib/LanguageContext'
import { getApiBaseUrl } from '@/lib/api-base-url'

const API_BASE_URL = getApiBaseUrl()

interface Post {
  _id: string
  id: string
  title: string
  createdAt: string
  created_at?: string
  tags?: string[]
}

type ResourceCategory = '전체' | '레퍼런스' | '프레임워크' | '도구'

interface DevResource {
  name: string
  description: string
  descriptionEn: string
  url: string
  category: Exclude<ResourceCategory, '전체'>
  icon: string
}

// Fallback shown until /api/dev-resources resolves, and permanently if the
// Notion database isn't configured — so the tab never renders empty.
const FALLBACK_DEV_RESOURCES: DevResource[] = [
  {
    name: 'MDN Web Docs',
    description: 'HTML, CSS, JavaScript의 공식 웹 기술 레퍼런스',
    descriptionEn: 'The official web technology reference for HTML, CSS, and JavaScript',
    url: 'https://developer.mozilla.org',
    category: '레퍼런스',
    icon: '📖',
  },
  {
    name: 'Can I Use',
    description: '브라우저 호환성을 한눈에 확인하는 도구',
    descriptionEn: 'A tool to check browser compatibility at a glance',
    url: 'https://caniuse.com',
    category: '도구',
    icon: '🔍',
  },
  {
    name: 'Tailwind CSS Docs',
    description: 'Utility-first CSS 프레임워크 공식 문서',
    descriptionEn: 'Official docs for the utility-first CSS framework',
    url: 'https://tailwindcss.com/docs',
    category: '프레임워크',
    icon: '🎨',
  },
  {
    name: 'Vercel Docs',
    description: '배포, Edge Functions, Analytics 등 Vercel 공식 가이드',
    descriptionEn: 'The official Vercel guide covering deployment, Edge Functions, Analytics, and more',
    url: 'https://vercel.com/docs',
    category: '도구',
    icon: '▲',
  },
  {
    name: 'Three.js Docs',
    description: '웹 3D 그래픽을 위한 Three.js 공식 레퍼런스',
    descriptionEn: 'The official Three.js reference for 3D graphics on the web',
    url: 'https://threejs.org/docs',
    category: '레퍼런스',
    icon: '🌐',
  },
  {
    name: 'TypeScript Handbook',
    description: 'TypeScript 공식 핸드북 — 기초부터 고급 타입까지',
    descriptionEn: 'The official TypeScript handbook — from the basics to advanced types',
    url: 'https://www.typescriptlang.org/docs/handbook',
    category: '레퍼런스',
    icon: '📘',
  },
  {
    name: 'React Docs',
    description: '최신 React 공식 문서 (react.dev)',
    descriptionEn: 'The latest official React documentation (react.dev)',
    url: 'https://react.dev',
    category: '프레임워크',
    icon: '⚛️',
  },
  {
    name: 'Next.js Docs',
    description: 'App Router, Server Components, 배포까지 Next.js 가이드',
    descriptionEn: 'The Next.js guide covering App Router, Server Components, and deployment',
    url: 'https://nextjs.org/docs',
    category: '프레임워크',
    icon: '🔺',
  },
]

const CATEGORY_FILTERS: ResourceCategory[] = ['전체', '레퍼런스', '프레임워크', '도구']

const CATEGORY_LABELS: Record<ResourceCategory, { ko: string; en: string }> = {
  전체: { ko: '전체', en: 'All' },
  레퍼런스: { ko: '레퍼런스', en: 'Reference' },
  프레임워크: { ko: '프레임워크', en: 'Framework' },
  도구: { ko: '도구', en: 'Tools' },
}

type TabType = 'posts' | 'resources'

export default function BookmarksPage() {
  const { bookmarks } = useBookmarks()
  const { locale } = useLanguage()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('posts')
  const [categoryFilter, setCategoryFilter] = useState<ResourceCategory>('전체')
  const [devResources, setDevResources] = useState<DevResource[]>(FALLBACK_DEV_RESOURCES)

  useEffect(() => {
    if (bookmarks.length === 0) { setLoading(false); return }
    fetch(`${API_BASE_URL}/api/posts?limit=50`)
      .then(r => r.json())
      .then((data: { posts?: Post[] }) => {
        const all = Array.isArray(data.posts) ? data.posts : []
        setPosts(all.filter(p => bookmarks.includes(String(p.id ?? p._id ?? ''))))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [bookmarks])

  useEffect(() => {
    fetch('/api/dev-resources')
      .then(r => r.json())
      .then((data: { resources?: DevResource[] }) => {
        if (Array.isArray(data.resources) && data.resources.length > 0) {
          setDevResources(data.resources)
        }
      })
      .catch(() => {})
  }, [])

  const filteredResources =
    categoryFilter === '전체'
      ? devResources
      : devResources.filter(r => r.category === categoryFilter)

  const en = locale === 'en'

  return (
    <PageShell>
      <PageHeader title={en ? 'Bookmarks' : '북마크'} description={en ? 'Saved posts and dev links I keep coming back to.' : '저장한 글과 자주 찾는 개발 링크입니다.'} />
      <Container>
        <TabBar label={en ? 'Bookmark type' : '북마크 종류'}>
          <button type="button" role="tab" aria-selected={activeTab === 'posts'} onClick={() => setActiveTab('posts')} className={tabClass(activeTab === 'posts')}>
            {en ? 'Saved posts' : '저장한 글'}
          </button>
          <button type="button" role="tab" aria-selected={activeTab === 'resources'} onClick={() => setActiveTab('resources')} className={tabClass(activeTab === 'resources')}>
            {en ? 'Dev resources' : '개발 리소스'}
          </button>
        </TabBar>

        {activeTab === 'posts' && (
          <div className="mt-2">
            {loading ? (
              <ul className="grid gap-3" aria-busy="true">
                {[1, 2, 3].map((i) => (
                  <li key={i} className="h-16 rounded-xl border-2 border-ink bg-white" />
                ))}
              </ul>
            ) : posts.length === 0 ? (
              <EmptyState
                message={en ? 'No saved posts yet. Use the bookmark button on any post.' : '저장한 글이 없습니다. 글 본문의 북마크 버튼으로 저장할 수 있습니다.'}
                action={<Link href="/posts" className={buttonQuiet}>{en ? 'Go to posts' : '글 보러 가기'}</Link>}
              />
            ) : (
              <ul className="grid gap-3">
                {posts.map((post) => {
                  const postId = String(post.id ?? post._id ?? '')
                  const dateStr = post.createdAt ?? post.created_at ?? ''
                  return (
                    <li key={postId}>
                      <Link href={`/posts/${postId}`} className="group block rounded-xl border-2 border-ink bg-white px-5 py-4 shadow-ink-sm transition-transform hover:-translate-y-0.5">
                        <p className="text-xs text-fg-subtle">{dateStr ? new Date(dateStr).toLocaleDateString(en ? 'en-US' : 'ko-KR') : ''}</p>
                        <p className="mt-1 text-base font-extrabold group-hover:underline">{post.title}</p>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="mt-6">
            <div className="mb-6 flex flex-wrap gap-2">
              {CATEGORY_FILTERS.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`rounded-full border-2 px-3 py-1 text-xs font-extrabold transition-colors ${
                    categoryFilter === cat ? 'border-ink bg-ink text-paper' : 'border-ink bg-white text-ink hover:bg-paper'
                  }`}
                >
                  {en ? CATEGORY_LABELS[cat].en : CATEGORY_LABELS[cat].ko}
                </button>
              ))}
            </div>
            <ul className="grid gap-4 sm:grid-cols-2">
              {filteredResources.map((resource) => (
                <li key={resource.name}>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex h-full flex-col gap-2 rounded-xl border-2 border-ink bg-white p-5 shadow-ink-sm transition-transform hover:-translate-y-0.5"
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-base font-semibold text-fg">{resource.name}</span>
                      <FiExternalLink size={14} className="text-fg-subtle group-hover:text-fg" aria-hidden />
                    </span>
                    <span className="text-sm leading-[1.6] text-fg-muted">{en ? resource.descriptionEn : resource.description}</span>
                    <span className="mt-auto pt-2 text-xs text-fg-subtle">
                      {en ? CATEGORY_LABELS[resource.category].en : CATEGORY_LABELS[resource.category].ko}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Container>
    </PageShell>
  )
}
