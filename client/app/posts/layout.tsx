import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog',
  description: '개발, 기술, 일상에 대한 글을 씁니다.',
  openGraph: {
    title: 'Blog',
    description: '개발, 기술, 일상에 대한 글을 씁니다.',
  },
}

export default function PostsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
