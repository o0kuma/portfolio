'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getAllOfflinePosts, removeOfflinePost } from '@/lib/offlineStorage'

interface OfflinePost {
  id: string
  title: string
  content: string
  author: string
  createdAt: string
  savedAt: number
}

export default function OfflinePostsPage() {
  const [posts, setPosts] = useState<OfflinePost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllOfflinePosts().then((result) => {
      setPosts(result)
      setLoading(false)
    })
  }, [])

  const handleDelete = async (id: string) => {
    await removeOfflinePost(id)
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50">
      <div className="page-shell py-12">
        <h1 className="text-3xl font-bold text-neutral-50 mb-2">오프라인 저장된 글</h1>
        <p className="text-neutral-500 text-sm mb-8">인터넷 없이도 읽을 수 있도록 저장한 글 목록입니다.</p>

        {loading ? (
          <p className="text-neutral-500">불러오는 중...</p>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-neutral-500 text-lg mb-2">저장된 글이 없습니다.</p>
            <p className="text-neutral-600 text-sm">포스트 페이지에서 📥 버튼을 눌러 저장해보세요.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {posts.map((post) => (
              <li
                key={post.id}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <h2 className="text-neutral-100 font-semibold truncate mb-1">{post.title}</h2>
                  <p className="text-neutral-600 text-xs font-mono">
                    저장일: {new Date(post.savedAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/posts/${post.id}`}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm rounded-lg transition-colors"
                  >
                    읽기
                  </Link>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="px-3 py-1.5 bg-red-900/40 hover:bg-red-900/70 text-red-400 text-sm rounded-lg transition-colors"
                  >
                    삭제
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
