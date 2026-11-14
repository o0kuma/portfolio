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
      className={`inline-flex items-center gap-1.5 rounded-full border-2 border-ink px-3 py-1 text-xs font-extrabold transition-colors ${
        saved ? 'bg-cat-post text-ink' : 'bg-white text-ink hover:bg-paper'
      }`}
    >
      {saved ? (locale === 'ko' ? '저장됨' : 'Saved') : (locale === 'ko' ? '북마크' : 'Bookmark')}
    </button>
  )
}
