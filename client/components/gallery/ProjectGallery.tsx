'use client'

import { useRef, useState, useCallback, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Text, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import type { Project } from '@/app/gallery/GalleryClient'

// ── Constants ─────────────────────────────────────────────────────────────────
const FRAME_Z_STEP = 12
const CORRIDOR_WIDTH = 14
const CORRIDOR_HEIGHT = 7
const WALL_X = 5.5

const CATEGORY_COLORS: Record<string, string> = {
  web: '#4f46e5',
  game: '#16a34a',
  mobile: '#0891b2',
  api: '#b45309',
  tool: '#7c3aed',
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface Station {
  project: Project
  index: number
  framePos: THREE.Vector3
  cameraPos: THREE.Vector3
  lookAt: THREE.Vector3
  side: 'left' | 'right'
}

// ── Build stations from projects ───────────────────────────────────────────────
function buildStations(projects: Project[]): Station[] {
  return projects.map((project, i) => {
    const z = -i * FRAME_Z_STEP
    const side: 'left' | 'right' = i % 2 === 0 ? 'left' : 'right'
    const frameX = side === 'left' ? -WALL_X : WALL_X

    return {
      project,
      index: i,
      framePos: new THREE.Vector3(frameX, 2.5, z),
      cameraPos: new THREE.Vector3(0, 1.75, z + 5),
      lookAt: new THREE.Vector3(frameX * 0.65, 2.5, z),
      side,
    }
  })
}

// ── Camera controller ──────────────────────────────────────────────────────────
function CameraController({
  target,
}: {
  target: { pos: THREE.Vector3; look: THREE.Vector3 }
}) {
  const { camera } = useThree()
  const lookRef = useRef(target.look.clone())

  useFrame(() => {
    camera.position.lerp(target.pos, 0.06)
    lookRef.current.lerp(target.look, 0.06)
    camera.lookAt(lookRef.current)
  })

  return null
}

// ── Corridor geometry ──────────────────────────────────────────────────────────
function Corridor({ length }: { length: number }) {
  const floorMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#0e0e0e',
    roughness: 0.95,
    metalness: 0.1,
  }), [])

  const wallMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#111111',
    roughness: 0.9,
    metalness: 0.05,
  }), [])

  const ceilMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#0a0a0a',
    roughness: 1,
    metalness: 0,
  }), [])

  const L = length + 20

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -length / 2]} receiveShadow material={floorMat}>
        <planeGeometry args={[CORRIDOR_WIDTH, L]} />
      </mesh>
      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, CORRIDOR_HEIGHT, -length / 2]} material={ceilMat}>
        <planeGeometry args={[CORRIDOR_WIDTH, L]} />
      </mesh>
      {/* Left wall */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-CORRIDOR_WIDTH / 2, CORRIDOR_HEIGHT / 2, -length / 2]} material={wallMat}>
        <planeGeometry args={[L, CORRIDOR_HEIGHT]} />
      </mesh>
      {/* Right wall */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[CORRIDOR_WIDTH / 2, CORRIDOR_HEIGHT / 2, -length / 2]} material={wallMat}>
        <planeGeometry args={[L, CORRIDOR_HEIGHT]} />
      </mesh>
      {/* Back wall */}
      <mesh position={[0, CORRIDOR_HEIGHT / 2, 5]} material={wallMat}>
        <planeGeometry args={[CORRIDOR_WIDTH, CORRIDOR_HEIGHT]} />
      </mesh>
      {/* Far end wall */}
      <mesh rotation={[0, Math.PI, 0]} position={[0, CORRIDOR_HEIGHT / 2, -length - 5]} material={wallMat}>
        <planeGeometry args={[CORRIDOR_WIDTH, CORRIDOR_HEIGHT]} />
      </mesh>

      {/* Floor edge strips (subtle) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-CORRIDOR_WIDTH / 2 + 0.05, 0.01, -length / 2]}>
        <planeGeometry args={[0.08, L]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[CORRIDOR_WIDTH / 2 - 0.05, 0.01, -length / 2]}>
        <planeGeometry args={[0.08, L]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>

      {/* Ceiling light strip (center) */}
      <mesh position={[0, CORRIDOR_HEIGHT - 0.05, -length / 2]}>
        <planeGeometry args={[0.4, L]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.04} />
      </mesh>
    </group>
  )
}

// ── Project frame on wall ──────────────────────────────────────────────────────
function ProjectFrame({
  station,
  isActive,
  onClick,
}: {
  station: Station
  isActive: boolean
  onClick: () => void
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const frameColor = CATEGORY_COLORS[station.project.category] ?? '#4f46e5'
  const side = station.side === 'left' ? 1 : -1
  const rotY = station.side === 'left' ? Math.PI / 2 : -Math.PI / 2

  useFrame(() => {
    if (!meshRef.current) return
    const target = isActive ? 1.15 : 1
    meshRef.current.scale.lerp(new THREE.Vector3(target, target, target), 0.08)
  })

  return (
    <group position={station.framePos.toArray()}>
      {/* Spotlight */}
      <spotLight
        position={[side * -1.5, 3.5, 0]}
        target-position={[0, 0, 0]}
        intensity={isActive ? 6 : 2.5}
        angle={0.38}
        penumbra={0.6}
        color={isActive ? '#fff5e0' : '#d4c5a0'}
        castShadow={false}
        distance={8}
      />

      <group rotation={[0, rotY, 0]}>
        {/* Outer frame border */}
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[3.4, 2.4]} />
          <meshStandardMaterial
            color={isActive ? frameColor : '#2a2a2a'}
            emissive={isActive ? frameColor : '#111111'}
            emissiveIntensity={isActive ? 0.3 : 0.05}
            roughness={0.4}
            metalness={0.6}
          />
        </mesh>

        {/* Inner canvas (artwork area) */}
        <mesh ref={meshRef} onClick={onClick} position={[0, 0, 0.01]}>
          <planeGeometry args={[3.0, 2.0]} />
          <meshStandardMaterial
            color="#000000"
            emissive={frameColor}
            emissiveIntensity={isActive ? 0.12 : 0.04}
            roughness={0.8}
            metalness={0}
          />
        </mesh>

        {/* Category label top */}
        <Text
          position={[0, 1.22, 0.02]}
          fontSize={0.1}
          color={frameColor}
          font={undefined}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.12}
        >
          {station.project.category.toUpperCase()}
        </Text>

        {/* Project title */}
        <Text
          position={[0, 0.55, 0.02]}
          fontSize={0.2}
          color={isActive ? '#ffffff' : '#aaaaaa'}
          font={undefined}
          anchorX="center"
          anchorY="middle"
          maxWidth={2.6}
        >
          {station.project.title}
        </Text>

        {/* Short description (2 lines) */}
        <Text
          position={[0, 0.1, 0.02]}
          fontSize={0.1}
          color={isActive ? '#cccccc' : '#666666'}
          font={undefined}
          anchorX="center"
          anchorY="middle"
          maxWidth={2.6}
          lineHeight={1.4}
        >
          {station.project.description.slice(0, 60) + (station.project.description.length > 60 ? '...' : '')}
        </Text>

        {/* Tech stack pills row */}
        {station.project.technologies.slice(0, 4).map((tech, ti) => (
          <Text
            key={tech}
            position={[-1.1 + ti * 0.62, -0.6, 0.02]}
            fontSize={0.09}
            color={isActive ? frameColor : '#444444'}
            font={undefined}
            anchorX="center"
            anchorY="middle"
          >
            {tech}
          </Text>
        ))}

        {/* Index number bottom-right */}
        <Text
          position={[1.3, -0.85, 0.02]}
          fontSize={0.14}
          color={isActive ? '#ffffff44' : '#33333388'}
          font={undefined}
          anchorX="right"
          anchorY="middle"
        >
          {String(station.index + 1).padStart(2, '0')}
        </Text>

        {/* Click hint */}
        {isActive && (
          <Text
            position={[0, -0.85, 0.02]}
            fontSize={0.09}
            color="#ffffff66"
            font={undefined}
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.08}
          >
            CLICK TO OPEN
          </Text>
        )}
      </group>

      {/* Glow plane on wall behind frame */}
      <mesh position={[0, 0, side * 0.02]} rotation={[0, rotY, 0]}>
        <planeGeometry args={[4, 3.2]} />
        <meshBasicMaterial
          color={frameColor}
          transparent
          opacity={isActive ? 0.04 : 0.01}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

// ── Floor number markers ───────────────────────────────────────────────────────
function FloorMarker({ z, index }: { z: number; index: number }) {
  return (
    <Text
      position={[0, 0.01, z]}
      rotation={[-Math.PI / 2, 0, 0]}
      fontSize={0.22}
      color="#222222"
      font={undefined}
      anchorX="center"
      anchorY="middle"
      letterSpacing={0.05}
    >
      {String(index + 1).padStart(2, '0')}
    </Text>
  )
}

// ── Ambient dust particles ─────────────────────────────────────────────────────
function GalleryDust({ length }: { length: number }) {
  return (
    <Sparkles
      count={80}
      scale={[CORRIDOR_WIDTH - 2, CORRIDOR_HEIGHT - 1, length]}
      position={[0, CORRIDOR_HEIGHT / 2, -length / 2]}
      size={0.6}
      speed={0.05}
      opacity={0.12}
      color="#c8b89a"
    />
  )
}

// ── Detail overlay (HUD) ───────────────────────────────────────────────────────
function ProjectDetail({
  project,
  onClose,
}: {
  project: Project
  onClose: () => void
}) {
  const color = CATEGORY_COLORS[project.category] ?? '#4f46e5'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 24, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 12, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-xl rounded-2xl overflow-hidden border"
        style={{ borderColor: color + '44', background: '#0f0f0f' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Color accent bar */}
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />

        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <span
                className="text-[10px] font-mono tracking-[0.2em] uppercase mb-2 block"
                style={{ color }}
              >
                {project.category}
              </span>
              <h2 className="text-2xl font-bold text-white leading-tight">{project.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 w-8 h-8 rounded-full border border-neutral-700 text-neutral-500 hover:text-white hover:border-neutral-500 transition-all flex items-center justify-center text-sm"
            >
              ✕
            </button>
          </div>

          {/* Description */}
          <p className="text-neutral-400 text-sm leading-relaxed mb-5">{project.description}</p>

          {/* Tech stack */}
          <div className="flex flex-wrap gap-2 mb-6">
            {project.technologies.map((t) => (
              <span
                key={t}
                className="text-[11px] font-mono px-2.5 py-1 rounded border"
                style={{ borderColor: color + '33', color, background: color + '11' }}
              >
                {t}
              </span>
            ))}
          </div>

          {/* Links */}
          <div className="flex gap-3">
            {project.live_url && (
              <a
                href={project.live_url}
                target={project.live_url.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ background: color, color: '#fff' }}
              >
                라이브 보기 →
              </a>
            )}
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold border border-neutral-700 text-neutral-300 hover:border-neutral-500 transition-all"
              >
                GitHub
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Main scene ─────────────────────────────────────────────────────────────────
function Scene({
  stations,
  activeIndex,
  onFrameClick,
}: {
  stations: Station[]
  activeIndex: number
  onFrameClick: (i: number) => void
}) {
  const corridorLength = (stations.length) * FRAME_Z_STEP + 10
  const activeStation = stations[activeIndex]

  const camTarget = useMemo(() => ({
    pos: activeStation?.cameraPos ?? new THREE.Vector3(0, 1.75, 5),
    look: activeStation?.lookAt ?? new THREE.Vector3(0, 2, 0),
  }), [activeStation])

  return (
    <>
      <color attach="background" args={['#060606']} />
      <fog attach="fog" args={['#060606', 10, 55]} />

      {/* Ambient */}
      <ambientLight intensity={0.04} />
      <pointLight position={[0, 6, 5]} intensity={0.3} color="#ffffff" distance={15} />

      <CameraController target={camTarget} />
      <Corridor length={corridorLength} />
      <GalleryDust length={corridorLength} />

      {stations.map((st, i) => (
        <ProjectFrame
          key={st.project.id}
          station={st}
          isActive={i === activeIndex}
          onClick={() => onFrameClick(i)}
        />
      ))}

      {stations.map((st, i) => (
        <FloorMarker key={`m-${i}`} z={-i * FRAME_Z_STEP} index={i} />
      ))}
    </>
  )
}

// ── Root component ─────────────────────────────────────────────────────────────
export default function ProjectGallery({ projects }: { projects: Project[] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [detailProject, setDetailProject] = useState<Project | null>(null)

  const stations = useMemo(() => buildStations(projects), [projects])
  const active = stations[activeIndex]

  const prev = useCallback(() => setActiveIndex((i) => Math.max(0, i - 1)), [])
  const next = useCallback(() => setActiveIndex((i) => Math.min(stations.length - 1, i + 1)), [stations.length])

  const handleFrameClick = useCallback((i: number) => {
    if (i === activeIndex) {
      setDetailProject(stations[i].project)
    } else {
      setActiveIndex(i)
    }
  }, [activeIndex, stations])

  // Keyboard navigation
  useState(() => {
    if (typeof window === 'undefined') return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') prev()
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') next()
      if (e.key === 'Escape') setDetailProject(null)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  return (
    <div className="w-full h-screen bg-[#060606] relative overflow-hidden select-none">
      {/* Canvas */}
      <Canvas
        shadows={false}
        camera={{ fov: 65, near: 0.1, far: 120, position: [0, 1.75, 8] }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <Scene
          stations={stations}
          activeIndex={activeIndex}
          onFrameClick={handleFrameClick}
        />
      </Canvas>

      {/* ── UI overlay ── */}

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-4 z-10">
        <Link
          href="/"
          className="text-neutral-600 hover:text-neutral-300 font-mono text-xs tracking-widest uppercase transition-colors"
        >
          ← 홈
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-neutral-700 font-mono text-[10px] tracking-widest uppercase">Gallery</span>
          <span className="text-neutral-800 font-mono text-[10px]">
            {String(activeIndex + 1).padStart(2, '0')} / {String(stations.length).padStart(2, '0')}
          </span>
        </div>
        <Link
          href="/portfolio"
          className="text-neutral-600 hover:text-neutral-300 font-mono text-xs tracking-widest uppercase transition-colors"
        >
          포트폴리오 →
        </Link>
      </div>

      {/* Project name HUD */}
      <div className="absolute bottom-24 left-0 right-0 flex flex-col items-center gap-1 z-10 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="text-center"
          >
            <p
              className="text-[10px] font-mono tracking-[0.25em] uppercase mb-1"
              style={{ color: CATEGORY_COLORS[active?.project.category] ?? '#4f46e5' }}
            >
              {active?.project.category}
            </p>
            <h2 className="text-white text-lg font-semibold tracking-tight">
              {active?.project.title}
            </h2>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation controls */}
      <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-4 z-10">
        <button
          onClick={prev}
          disabled={activeIndex === 0}
          className="w-10 h-10 rounded-full border border-neutral-700 text-neutral-400 hover:border-neutral-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all flex items-center justify-center text-lg"
        >
          ←
        </button>

        {/* Dot indicators */}
        <div className="flex items-center gap-1.5">
          {stations.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className="transition-all duration-300 rounded-full"
              style={{
                width: i === activeIndex ? 20 : 6,
                height: 6,
                background: i === activeIndex
                  ? (CATEGORY_COLORS[stations[i].project.category] ?? '#4f46e5')
                  : '#333333',
              }}
            />
          ))}
        </div>

        <button
          onClick={next}
          disabled={activeIndex === stations.length - 1}
          className="w-10 h-10 rounded-full border border-neutral-700 text-neutral-400 hover:border-neutral-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all flex items-center justify-center text-lg"
        >
          →
        </button>
      </div>

      {/* Open detail button */}
      <div className="absolute bottom-8 right-6 z-10">
        <button
          onClick={() => setDetailProject(active?.project ?? null)}
          className="text-[11px] font-mono tracking-widest uppercase text-neutral-600 hover:text-neutral-300 border border-neutral-800 hover:border-neutral-600 px-4 py-2 rounded-full transition-all"
        >
          열기
        </button>
      </div>

      {/* Keyboard hint */}
      <div className="absolute top-16 right-5 z-10">
        <p className="text-neutral-800 font-mono text-[9px] tracking-widest">← → 탐색 &nbsp; CLICK 열기</p>
      </div>

      {/* Detail overlay */}
      <AnimatePresence>
        {detailProject && (
          <ProjectDetail project={detailProject} onClose={() => setDetailProject(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}
