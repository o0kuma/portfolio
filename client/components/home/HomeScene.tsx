'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sparkles } from '@react-three/drei'
import { useEffect, useRef, type MutableRefObject } from 'react'
import * as THREE from 'three'
import type { Group } from 'three'

type Props = {
  /** 0 top → ~1 after first viewport+ of scroll — pulls camera back, deepens fog */
  scrollProgress?: number
}

/** Pointer parallax + scroll-driven base Z / fog (2 + 3) */
function CameraRig({ scrollRef }: { scrollRef: MutableRefObject<number> }) {
  useFrame((state) => {
    const { pointer, camera, scene } = state
    const sp = scrollRef.current
    const tx = pointer.x * 1.75
    const ty = pointer.y * 0.92
    const targetZ = 6 + sp * 6.5
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, tx, 0.048)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, ty, 0.048)
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.065)
    camera.lookAt(0, 0, 0)

    if (scene.fog instanceof THREE.Fog) {
      scene.fog.near = 7.2 + sp * 5
      scene.fog.far = 24 + sp * 18
    }
  })
  return null
}

function ScrollSyncedField({ scrollRef }: { scrollRef: MutableRefObject<number> }) {
  const group = useRef<Group>(null)
  useFrame((_, delta) => {
    const g = group.current
    if (!g) return
    const sp = scrollRef.current
    g.rotation.y += delta * (0.012 + sp * 0.045)
  })
  return (
    <group ref={group}>
      <Sparkles count={420} scale={42} size={1.4} speed={0.18} color="#d3cdc5" opacity={0.55} />
    </group>
  )
}

function DistortedCore({ scrollRef }: { scrollRef: MutableRefObject<number> }) {
  const group = useRef<Group>(null)

  useFrame((state) => {
    const g = group.current
    if (!g) return
    const t = state.clock.elapsedTime
    const sp = scrollRef.current
    g.rotation.y = t * (0.11 + sp * 0.04)
    g.rotation.x = Math.sin(t * 0.25) * 0.06
    g.position.z = -sp * 1.1
  })

  return (
    <group ref={group}>
      <Float speed={1.8} rotationIntensity={0.12} floatIntensity={0.35}>
        <mesh>
          <icosahedronGeometry args={[1.12, 7]} />
          <MeshDistortMaterial
            color="#d99b80"
            emissive="#c06a4d"
            emissiveIntensity={0.12}
            roughness={0.42}
            metalness={0.2}
            distort={0.42}
            speed={2}
          />
        </mesh>
      </Float>
    </group>
  )
}

/**
 * Full-viewport WebGL layer for the home route only.
 * Scroll progress deepens the scene; pointer drives lateral parallax.
 */
export default function HomeScene({ scrollProgress = 0 }: Props) {
  const scrollRef = useRef(0)
  useEffect(() => {
    scrollRef.current = scrollProgress
  }, [scrollProgress])

  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 42 }}
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      }}
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <color attach="background" args={['#faf9f7']} />
      <fog attach="fog" args={['#faf9f7', 7.5, 26]} />
      <ambientLight intensity={0.85} />
      <pointLight position={[7, 5, 7]} intensity={1.05} color="#ffffff" />
      <pointLight position={[-5, -3, -4]} intensity={0.45} color="#e3b8a3" />
      <ScrollSyncedField scrollRef={scrollRef} />
      <Sparkles count={160} scale={11} size={2.2} speed={0.28} color="#c06a4d" opacity={0.5} />
      <DistortedCore scrollRef={scrollRef} />
      <CameraRig scrollRef={scrollRef} />
    </Canvas>
  )
}
