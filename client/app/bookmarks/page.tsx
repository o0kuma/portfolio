'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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

const DEV_RESOURCES: DevResource[] = [
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

const CATEGORY_COLORS: Record<Exclude<ResourceCategory, '전체'>, string> = {
  레퍼런스: 'bg-blue-900/50 text-blue-300 border border-blue-800',
  프레임워크: 'bg-violet-900/50 text-violet-300 border border-violet-800',
  도구: 'bg-emerald-900/50 text-emerald-300 border border-emerald-800',
}

type TabType = 'posts' | 'resources'

export default function BookmarksPage() {
  const { bookmarks } = useBookmarks()
  const { locale } = useLanguage()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('posts')
  const [categoryFilter, setCategoryFilter] = useState<ResourceCategory>('전체')

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
  }, [bookmarks]) // eslint-disable-line react-hooks/exhaustive-deps

  const filteredResources =
    categoryFilter === '전체'
      ? DEV_RESOURCES
      : DEV_RESOURCES.filter(r => r.category === categoryFilter)

  return (
    <main className="min-h-screen bg-canvas text-textPrimary">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/posts" className="text-neutral-500 hover:text-neutral-300 text-sm font-mono transition-colors mb-8 inline-block">
          ← {locale === 'ko' ? '블로그로' : 'Back to Blog'}
        </Link>
        <h1 className="text-3xl font-black mb-8">
          {locale === 'ko' ? '북마크' : 'Bookmarks'}
        </h1>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-xl mb-8 w-fit">
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-2 text-sm font-mono rounded-lg transition-colors ${
              activeTab === 'posts'
                ? 'bg-neutral-700 text-neutral-100'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {locale === 'ko' ? '저장한 포스트' : 'Saved Posts'}
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-4 py-2 text-sm font-mono rounded-lg transition-colors ${
              activeTab === 'resources'
                ? 'bg-neutral-700 text-neutral-100'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {locale === 'ko' ? '개발 리소스' : 'Dev Resources'}
          </button>
        </div>

        {/* Saved Posts Tab */}
        {activeTab === 'posts' && (
          <div>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-neutral-900 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <span className="text-5xl">🔖</span>
                <p className="text-neutral-400 font-semibold">
                  {locale === 'ko' ? '북마크된 포스트가 없습니다.' : 'No bookmarked posts yet.'}
                </p>
                <p className="text-neutral-600 text-sm font-mono">
                  {locale === 'ko' ? '블로그에서 포스트를 북마크해보세요' : 'Bookmark posts from the blog'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map(post => {
                  const postId = String(post.id ?? post._id ?? '')
                  const dateStr = post.createdAt ?? post.created_at ?? ''
                  return (
                    <Link
                      key={postId}
                      href={`/posts/${postId}`}
                      className="block p-4 rounded-xl border border-neutral-800 hover:border-neutral-700 transition-colors"
                    >
                      <div className="text-neutral-200 font-semibold">{post.title}</div>
                      <div className="text-neutral-600 text-xs font-mono mt-1">
                        {dateStr ? new Date(dateStr).toLocaleDateString() : ''}
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Dev Resources Tab */}
        {activeTab === 'resources' && (
          <div>
            {/* Category filter */}
            <div className="flex gap-2 flex-wrap mb-6">
              {CATEGORY_FILTERS.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 text-xs font-mono rounded-full transition-colors ${
                    categoryFilter === cat
                      ? 'bg-neutral-200 text-neutral-900'
                      : 'bg-neutral-800 text-neutral-500 hover:text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  {locale === 'en' ? CATEGORY_LABELS[cat].en : CATEGORY_LABELS[cat].ko}
                </button>
              ))}
            </div>

            {/* Resource cards */}
            <div className="grid gap-3 sm:grid-cols-2">
              {filteredResources.map(resource => (
                <a
                  key={resource.name}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col gap-2 p-4 rounded-xl border border-neutral-800 hover:border-neutral-600 bg-neutral-900 hover:bg-neutral-800/80 transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{resource.icon}</span>
                      <span className="text-neutral-200 font-semibold text-sm group-hover:text-white transition-colors">
                        {resource.name}
                      </span>
                    </div>
                    <span className="text-neutral-600 text-xs group-hover:text-neutral-400 transition-colors">↗</span>
                  </div>
                  <p className="text-neutral-500 text-xs leading-relaxed">{locale === 'en' ? resource.descriptionEn : resource.description}</p>
                  <span className={`self-start px-2 py-0.5 rounded-full text-xs font-mono ${CATEGORY_COLORS[resource.category]}`}>
                    {locale === 'en' ? CATEGORY_LABELS[resource.category].en : CATEGORY_LABELS[resource.category].ko}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
