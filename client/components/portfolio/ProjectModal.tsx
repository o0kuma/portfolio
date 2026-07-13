'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiGithub, FiExternalLink, FiCalendar, FiUsers } from 'react-icons/fi'
import { EASE_OUT } from '@/lib/portfolioMotion'

interface Project {
  id: string
  title: string
  description: string
  content: string
  technologies: string[]
  images: string[]
  githubUrl: string
  liveUrl: string
  featured: boolean
  category: string
  startDate: string
  endDate: string
  status: string
  participants?: string
  role?: string
}

type Props = {
  project: Project
  onClose: () => void
}

export default function ProjectModal({ project, onClose }: Props) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: EASE_OUT }}
          className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-neutral-700 bg-neutral-900 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-neutral-800 bg-neutral-900 p-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {project.featured && (
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 border border-amber-400/30 px-1.5 py-0.5 rounded">Featured</span>
                )}
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  project.status === 'completed' ? 'text-emerald-400 border border-emerald-400/30' :
                  project.status === 'in-progress' ? 'text-cyan-400 border border-cyan-400/30' :
                  'text-neutral-500 border border-neutral-700'
                }`}>
                  {project.status}
                </span>
              </div>
              <h2 className="text-xl font-bold text-neutral-50">{project.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 p-2 rounded-lg text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Description */}
            <p className="text-neutral-300 leading-relaxed">{project.description}</p>

            {/* Meta grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              {project.startDate && (
                <div className="flex items-center gap-2 text-neutral-400">
                  <FiCalendar size={14} className="shrink-0" />
                  <span>{project.startDate}{project.endDate ? ` → ${project.endDate}` : ''}</span>
                </div>
              )}
              {project.participants && (
                <div className="flex items-center gap-2 text-neutral-400">
                  <FiUsers size={14} className="shrink-0" />
                  <span>{project.participants}</span>
                </div>
              )}
              {project.role && (
                <div className="col-span-2">
                  <p className="text-xs text-neutral-600 uppercase tracking-widest mb-1 font-mono">Role</p>
                  <p className="text-neutral-300">{project.role}</p>
                </div>
              )}
            </div>

            {/* Technologies */}
            {project.technologies?.length > 0 && (
              <div>
                <p className="text-xs text-neutral-600 uppercase tracking-widest mb-3 font-mono">Technologies</p>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech: string) => (
                    <span key={tech} className="px-3 py-1 rounded-md text-xs font-medium border border-neutral-700 bg-neutral-950/60 text-neutral-300">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Links */}
            <div className="flex flex-wrap gap-3 pt-2">
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-700 text-neutral-300 text-sm hover:border-neutral-500 hover:text-white transition-colors">
                  <FiGithub size={14} /> GitHub
                </a>
              )}
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-100 text-neutral-950 text-sm font-semibold hover:bg-white transition-colors">
                  <FiExternalLink size={14} /> Live Demo
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
