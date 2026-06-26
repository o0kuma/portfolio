import type { Metadata } from 'next'
import GalleryClient from './GalleryClient'

export const metadata: Metadata = {
  title: 'Gallery',
  description: '3D 프로젝트 갤러리',
}

export default function GalleryPage() {
  return <GalleryClient />
}
