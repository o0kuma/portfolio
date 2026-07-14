'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sparkles, Stars } from '@react-three/drei'
import { useEffect, useRef, type MutableRefObject } from 'react'
import * as THREE from 'three'
import type { Group } from 'three'

type Props = {
  /** 0 top → ~1 after first viewport+ of scroll — pulls camera back, deepens fog */
  scrollProgress?: number
  /** 0 until the last ~1.3vh of the page → 1 at the true bottom — shifts the scene toward a warm "atmosphere" palette near the footer */
  approach?: number
}

const SPACE_FOG_COLOR = new THREE.Color('#030014')
const ATMOSPHERE_FOG_COLOR = new THREE.Color('#2a4a7a')
const SPACE_BG_COLOR = new THREE.Color('#030014')
const ATMOSPHERE_BG_COLOR = new THREE.Color('#1a3a5c')
const SPACE_RIM_COLOR = new THREE.Color('#a5b4fc')
const ATMOSPHERE_RIM_COLOR = new THREE.Color('#fb923c')

/** Pointer parallax + scroll-driven base Z / fog (2 + 3) */
function CameraRig({ scrollRef, approachRef }: { scrollRef: MutableRefObject<number>; approachRef: MutableRefObject<number> }) {
  useFrame((state) => {
    const { pointer, camera, scene } = state
    const sp = scrollRef.current
    const ap = approachRef.current
    const tx = pointer.x * 1.75
    const ty = pointer.y * 0.92
    const targetZ = 6 + sp * 6.5 - ap * 2.2
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, tx, 0.048)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, ty, 0.048)
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.065)
    camera.lookAt(0, 0, 0)

    if (scene.fog instanceof THREE.Fog) {
      scene.fog.near = 7.2 + sp * 5 - ap * 3
      scene.fog.far = 24 + sp * 18 - ap * 10
      scene.fog.color.copy(SPACE_FOG_COLOR).lerp(ATMOSPHERE_FOG_COLOR, ap)
    }
    if (scene.background instanceof THREE.Color) {
      scene.background.copy(SPACE_BG_COLOR).lerp(ATMOSPHERE_BG_COLOR, ap)
    }
  })
  return null
}

/** Warm rim light that fades in as the scroll nears the footer — sells "sunlit horizon" instead of deep space. */
function ApproachLight({ approachRef }: { approachRef: MutableRefObject<number> }) {
  const light = useRef<THREE.PointLight>(null)
  useFrame(() => {
    const l = light.current
    if (!l) return
    const ap = approachRef.current
    l.color.copy(SPACE_RIM_COLOR).lerp(ATMOSPHERE_RIM_COLOR, ap)
    l.intensity = 1.15 + ap * 1.4
  })
  return <pointLight ref={light} position={[7, 5, 7]} intensity={1.15} color="#a5b4fc" />
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
      <Stars radius={90} depth={45} count={5000} factor={3.2} saturation={0} fade speed={0.35} />
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
            color="#4338ca"
            emissive="#1e1b4b"
            emissiveIntensity={0.38}
            roughness={0.12}
            metalness={0.88}
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
export default function HomeScene({ scrollProgress = 0, approach = 0 }: Props) {
  const scrollRef = useRef(0)
  const approachRef = useRef(0)
  useEffect(() => {
    scrollRef.current = scrollProgress
  }, [scrollProgress])
  useEffect(() => {
    approachRef.current = approach
  }, [approach])

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
      <color attach="background" args={['#030014']} />
      <fog attach="fog" args={['#030014', 7.5, 26]} />
      <ambientLight intensity={0.32} />
      <ApproachLight approachRef={approachRef} />
      <pointLight position={[-5, -3, -4]} intensity={0.55} color="#6d28d9" />
      <ScrollSyncedField scrollRef={scrollRef} />
      <Sparkles count={180} scale={11} size={1.8} speed={0.32} color="#818cf8" opacity={0.42} />
      <DistortedCore scrollRef={scrollRef} />
      <CameraRig scrollRef={scrollRef} approachRef={approachRef} />
    </Canvas>
  )
}
