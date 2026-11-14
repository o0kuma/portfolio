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
      type="button"
      aria-pressed={saved}
      className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs transition-colors ${
        saved ? 'border-star/60 text-star' : 'border-line text-fg-muted hover:border-line-strong hover:text-fg'
      }`}
    >
      {saved ? (locale === 'ko' ? '저장됨' : 'Saved') : (locale === 'ko' ? '북마크' : 'Bookmark')}
    </button>
  )
}
