'use client'
import { useBookmarks } from '@/hooks/useBookmarks'
import { useLanguage } from '@/lib/LanguageContext'

export default function BookmarkButton({ postId }: { postId: string }) {
  const { toggle, isBookmarked } = useBookmarks()
  const { locale } = useLanguage()
  const saved = isBookmarked(postId)

  return (
    <button
      onClick={() => toggle(postId)}
      className={`inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg border transition-colors ${
        saved
          ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
          : 'border-neutral-700 bg-neutral-900 text-neutral-500 hover:text-neutral-300'
      }`}
    >
      🔖 {saved ? (locale === 'ko' ? '저장됨' : 'Saved') : (locale === 'ko' ? '북마크' : 'Bookmark')}
    </button>
  )
}
