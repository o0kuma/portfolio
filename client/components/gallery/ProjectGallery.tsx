'use client'

import { useRef, useState, useCallback, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import type { Project } from '@/app/gallery/GalleryClient'

const FRAME_Z_STEP = 14
const CORRIDOR_W = 16
const CORRIDOR_H = 7
const FRAME_X = 5.2

const CATEGORY_COLORS: Record<string, string> = {
  web: '#4f46e5',
  game: '#16a34a',
  mobile: '#0891b2',
  api: '#b45309',
  tool: '#7c3aed',
}

interface Station {
  project: Project
  index: number
  side: 'left' | 'right'
  framePos: THREE.Vector3
  cameraPos: THREE.Vector3
  lookAt: THREE.Vector3
}

function buildStations(projects: Project[]): Station[] {
  return projects.map((project, i) => {
    const z = -i * FRAME_Z_STEP
    const side: 'left' | 'right' = i % 2 === 0 ? 'left' : 'right'
    const fx = side === 'left' ? -FRAME_X : FRAME_X
    return {
      project, index: i, side,
      framePos: new THREE.Vector3(fx, 2.6, z),
      cameraPos: new THREE.Vector3(fx * 0.18, 1.75, z + 6),
      lookAt: new THREE.Vector3(fx, 2.6, z),
    }
  })
}

function CameraRig({ pos, look }: { pos: THREE.Vector3; look: THREE.Vector3 }) {
  const { camera } = useThree()
  const lookCur = useRef(look.clone())
  useFrame(() => {
    camera.position.lerp(pos, 0.055)
    lookCur.current.lerp(look, 0.055)
    camera.lookAt(lookCur.current)
  })
  return null
}

function Room({ length }: { length: number }) {
  const L = length + 24
  const dark = new THREE.MeshStandardMaterial({ color: '#0d0d0d', roughness: 0.95, metalness: 0.05 })
  const wall = new THREE.MeshStandardMaterial({ color: '#101010', roughness: 0.9, metalness: 0.05 })
  const ceil = new THREE.MeshStandardMaterial({ color: '#080808', roughness: 1, metalness: 0 })

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -length / 2]} material={dark}>
        <planeGeometry args={[CORRIDOR_W, L]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, CORRIDOR_H, -length / 2]} material={ceil}>
        <planeGeometry args={[CORRIDOR_W, L]} />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-CORRIDOR_W / 2, CORRIDOR_H / 2, -length / 2]} material={wall}>
        <planeGeometry args={[L, CORRIDOR_H]} />
      </mesh>
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[CORRIDOR_W / 2, CORRIDOR_H / 2, -length / 2]} material={wall}>
        <planeGeometry args={[L, CORRIDOR_H]} />
      </mesh>
      <mesh position={[0, CORRIDOR_H / 2, 8]} material={wall}>
        <planeGeometry args={[CORRIDOR_W, CORRIDOR_H]} />
      </mesh>
      <mesh rotation={[0, Math.PI, 0]} position={[0, CORRIDOR_H / 2, -length - 8]} material={wall}>
        <planeGeometry args={[CORRIDOR_W, CORRIDOR_H]} />
      </mesh>
      <mesh position={[0, CORRIDOR_H - 0.02, -length / 2]}>
        <planeGeometry args={[0.5, L]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.05} />
      </mesh>
      {[-1, 1].map((sx) => (
        <mesh key={sx} rotation={[-Math.PI / 2, 0, 0]} position={[sx * 0.7, 0.005, -length / 2]}>
          <planeGeometry args={[0.04, L]} />
          <meshBasicMaterial color="#1c1c1c" />
        </mesh>
      ))}
    </group>
  )
}

function ProjectFrame({
  station, isActive, onClick,
}: { station: Station; isActive: boolean; onClick: () => void }) {
  const outerRef = useRef<THREE.Mesh>(null)
  const frameColor = CATEGORY_COLORS[station.project.category] ?? '#4f46e5'
  const rotY = station.side === 'left' ? -Math.PI / 2 : Math.PI / 2
  const lightX = station.side === 'left' ? 1.5 : -1.5

  useFrame(() => {
    if (!outerRef.current) return
    const t = isActive ? 1.08 : 1
    outerRef.current.scale.lerp(new THREE.Vector3(t, t, t), 0.07)
  })

  return (
    <group position={station.framePos.toArray()}>
      <pointLight
        position={[lightX, 2.8, 0.3]}
        intensity={isActive ? 5 : 1.8}
        color={isActive ? '#fff8ec' : '#c8b89a'}
        distance={7}
        decay={2}
      />

      <group rotation={[0, rotY, 0]}>
        {/* Frame border */}
        <mesh ref={outerRef}>
          <planeGeometry args={[3.6, 2.55]} />
          <meshStandardMaterial
            color={isActive ? frameColor : '#1e1e1e'}
            emissive={isActive ? frameColor : '#0a0a0a'}
            emissiveIntensity={isActive ? 0.22 : 0.03}
            roughness={0.35}
            metalness={0.65}
          />
        </mesh>

        {/* Canvas surface — clickable */}
        <mesh onClick={onClick} position={[0, 0, 0.015]}>
          <planeGeometry args={[3.18, 2.18]} />
          <meshStandardMaterial
            color="#050505"
            emissive={frameColor}
            emissiveIntensity={isActive ? 0.1 : 0.03}
            roughness={0.85}
          />
        </mesh>

        {/* HTML label inside frame (avoids troika Text) */}
        <Html
          position={[0, 0, 0.04]}
          center
          style={{ pointerEvents: isActive ? 'auto' : 'none', width: 220 }}
          occlude={false}
        >
          <div
            onClick={onClick}
            style={{
              textAlign: 'center',
              color: isActive ? '#f0f0f0' : '#555',
              fontFamily: 'ui-monospace, monospace',
              cursor: isActive ? 'pointer' : 'default',
              userSelect: 'none',
            }}
          >
            <div style={{
              fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase',
              color: isActive ? frameColor : '#333', marginBottom: 4,
            }}>
              {station.project.category}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.3, marginBottom: 6 }}>
              {station.project.title}
            </div>
            <div style={{
              fontSize: 9, color: isActive ? '#888' : '#333',
              lineHeight: 1.5, marginBottom: 8,
              overflow: 'hidden', display: '-webkit-box',
              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            }}>
              {station.project.description}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center', marginBottom: 6 }}>
              {station.project.technologies.slice(0, 4).map((tech) => (
                <span key={tech} style={{
                  fontSize: 8, padding: '1px 5px',
                  border: `1px solid ${isActive ? frameColor + '55' : '#2a2a2a'}`,
                  borderRadius: 3, color: isActive ? frameColor : '#333',
                }}>
                  {tech}
                </span>
              ))}
            </div>
            {isActive && (
              <div style={{ fontSize: 8, color: '#ffffff40', letterSpacing: '0.12em' }}>
                CLICK TO OPEN
              </div>
            )}
          </div>
        </Html>
      </group>

      {/* Wall glow */}
      <mesh rotation={[0, rotY, 0]}>
        <planeGeometry args={[4.8, 3.8]} />
        <meshBasicMaterial
          color={frameColor}
          transparent
          opacity={isActive ? 0.045 : 0.008}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

function Scene({
  stations, activeIndex, onFrameClick,
}: { stations: Station[]; activeIndex: number; onFrameClick: (i: number) => void }) {
  const corridorLen = stations.length * FRAME_Z_STEP + 12
  const active = stations[activeIndex]

  const target = useMemo(() => ({
    pos: active?.cameraPos ?? new THREE.Vector3(0, 1.75, 8),
    look: active?.lookAt ?? new THREE.Vector3(0, 2.6, 0),
  }), [active])

  return (
    <>
      <color attach="background" args={['#050505']} />
      <fog attach="fog" args={['#050505', 12, 60]} />
      <ambientLight intensity={0.06} />
      <pointLight position={[0, 6, 6]} intensity={0.5} color="#d0d8ff" distance={18} />
      <CameraRig pos={target.pos} look={target.look} />
      <Room length={corridorLen} />
      <Sparkles
        count={60}
        scale={[CORRIDOR_W - 2, CORRIDOR_H - 1, corridorLen]}
        position={[0, CORRIDOR_H / 2, -corridorLen / 2]}
        size={0.5}
        speed={0.04}
        opacity={0.1}
        color="#c8b89a"
      />
      {stations.map((st, i) => (
        <ProjectFrame
          key={st.project.id}
          station={st}
          isActive={i === activeIndex}
          onClick={() => onFrameClick(i)}
        />
      ))}
    </>
  )
}

function ProjectDetail({ project, onClose }: { project: Project; onClose: () => void }) {
  const color = CATEGORY_COLORS[project.category] ?? '#4f46e5'
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 10, opacity: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-lg rounded-2xl border overflow-hidden"
        style={{ borderColor: color + '44', background: '#0c0c0c' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
        <div className="p-6 md:p-7">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <span className="text-[10px] font-mono tracking-[0.22em] uppercase block mb-1.5" style={{ color }}>
                {project.category}
              </span>
              <h2 className="text-xl font-bold text-white">{project.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 w-7 h-7 rounded-full border border-neutral-700 text-neutral-500 hover:text-white hover:border-neutral-400 transition-all flex items-center justify-center text-xs"
            >
              ✕
            </button>
          </div>
          <p className="text-neutral-400 text-sm leading-relaxed mb-5">{project.description}</p>
          <div className="flex flex-wrap gap-1.5 mb-6">
            {project.technologies.map((t) => (
              <span key={t} className="text-[11px] font-mono px-2 py-0.5 rounded border"
                style={{ borderColor: color + '33', color, background: color + '0f' }}>
                {t}
              </span>
            ))}
          </div>
          <div className="flex gap-2.5">
            {project.live_url && (
              <a href={project.live_url}
                target={project.live_url.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ background: color, color: '#fff' }}>
                라이브 보기 →
              </a>
            )}
            {project.github_url && (
              <a href={project.github_url} target="_blank" rel="noopener noreferrer"
                className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold border border-neutral-700 text-neutral-300 hover:border-neutral-500 transition-all">
                GitHub
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function ProjectGallery({ projects }: { projects: Project[] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [detail, setDetail] = useState<Project | null>(null)

  const stations = useMemo(() => buildStations(projects), [projects])
  const active = stations[activeIndex]

  const prev = useCallback(() => setActiveIndex((i) => Math.max(0, i - 1)), [])
  const next = useCallback(() => setActiveIndex((i) => Math.min(stations.length - 1, i + 1)), [stations.length])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (detail) { if (e.key === 'Escape') setDetail(null); return }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') prev()
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [prev, next, detail])

  const handleFrameClick = useCallback((i: number) => {
    if (i === activeIndex) setDetail(stations[i].project)
    else setActiveIndex(i)
  }, [activeIndex, stations])

  return (
    <div className="w-full h-screen bg-[#050505] relative overflow-hidden select-none">
      <Canvas
        shadows={false}
        camera={{ fov: 62, near: 0.1, far: 130, position: [0, 1.75, 8] }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.15 }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <Scene stations={stations} activeIndex={activeIndex} onFrameClick={handleFrameClick} />
      </Canvas>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-4 z-10 pointer-events-none">
        <Link href="/" className="pointer-events-auto text-neutral-600 hover:text-neutral-300 font-mono text-xs tracking-widest uppercase transition-colors">
          ← 홈
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-neutral-700 font-mono text-[10px] tracking-widest uppercase">Gallery</span>
          <span className="text-neutral-800 font-mono text-[10px]">
            {String(activeIndex + 1).padStart(2, '0')} / {String(stations.length).padStart(2, '0')}
          </span>
        </div>
        <Link href="/portfolio" className="pointer-events-auto text-neutral-600 hover:text-neutral-300 font-mono text-xs tracking-widest uppercase transition-colors">
          포트폴리오 →
        </Link>
      </div>

      {/* Active project info */}
      <div className="absolute bottom-24 left-0 right-0 flex flex-col items-center gap-1 z-10 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
            className="text-center"
          >
            <p className="text-[10px] font-mono tracking-[0.25em] uppercase mb-1"
              style={{ color: CATEGORY_COLORS[active?.project.category] ?? '#4f46e5' }}>
              {active?.project.category}
            </p>
            <h2 className="text-white text-lg font-semibold tracking-tight">{active?.project.title}</h2>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Nav controls */}
      <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-4 z-10">
        <button onClick={prev} disabled={activeIndex === 0}
          className="w-10 h-10 rounded-full border border-neutral-700 text-neutral-400 hover:border-neutral-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all flex items-center justify-center">
          ←
        </button>
        <div className="flex items-center gap-1.5">
          {stations.map((st, i) => (
            <button key={i} onClick={() => setActiveIndex(i)}
              className="transition-all duration-300 rounded-full"
              style={{
                width: i === activeIndex ? 20 : 6, height: 6,
                background: i === activeIndex
                  ? (CATEGORY_COLORS[st.project.category] ?? '#4f46e5')
                  : '#2a2a2a',
              }}
            />
          ))}
        </div>
        <button onClick={next} disabled={activeIndex === stations.length - 1}
          className="w-10 h-10 rounded-full border border-neutral-700 text-neutral-400 hover:border-neutral-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all flex items-center justify-center">
          →
        </button>
      </div>

      <div className="absolute bottom-8 right-6 z-10">
        <button onClick={() => setDetail(active?.project ?? null)}
          className="text-[11px] font-mono tracking-widest uppercase text-neutral-600 hover:text-neutral-300 border border-neutral-800 hover:border-neutral-600 px-4 py-2 rounded-full transition-all">
          열기
        </button>
      </div>

      <div className="absolute top-16 right-5 z-10">
        <p className="text-neutral-800 font-mono text-[9px] tracking-widest">← → 탐색 &nbsp; CLICK 열기</p>
      </div>

      <AnimatePresence>
        {detail && <ProjectDetail project={detail} onClose={() => setDetail(null)} />}
      </AnimatePresence>
    </div>
  )
}
