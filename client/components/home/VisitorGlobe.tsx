'use client'

import { useRef, useEffect, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { GeoLocation } from '@/app/api/visitors/geo/route'

const GLOBE_R = 1.4

function latLngToVec3(lat: number, lng: number, r: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  )
}

function GlobeMesh({ locations }: { locations: GeoLocation[] }) {
  const groupRef = useRef<THREE.Group>(null)
  const hovered = useRef(false)

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * (hovered.current ? 0.05 : 0.18)
    }
  })

  // Instanced dots for visitor locations
  const dotPositions = useMemo(() => {
    return locations.map((loc) => latLngToVec3(loc.lat, loc.lng, GLOBE_R + 0.02))
  }, [locations])

  // Grid lines — latitude every 30°, longitude every 30°
  const gridLines = useMemo(() => {
    const lines: THREE.BufferGeometry[] = []

    // Latitude circles
    for (let lat = -60; lat <= 60; lat += 30) {
      const pts: THREE.Vector3[] = []
      for (let lng = 0; lng <= 360; lng += 4) {
        pts.push(latLngToVec3(lat, lng, GLOBE_R))
      }
      lines.push(new THREE.BufferGeometry().setFromPoints(pts))
    }

    // Longitude lines
    for (let lng = 0; lng < 360; lng += 30) {
      const pts: THREE.Vector3[] = []
      for (let lat = -90; lat <= 90; lat += 4) {
        pts.push(latLngToVec3(lat, lng, GLOBE_R))
      }
      lines.push(new THREE.BufferGeometry().setFromPoints(pts))
    }

    return lines
  }, [])

  return (
    <group
      ref={groupRef}
      onPointerEnter={() => { hovered.current = true }}
      onPointerLeave={() => { hovered.current = false }}
    >
      {/* Sphere body */}
      <mesh>
        <sphereGeometry args={[GLOBE_R, 48, 48]} />
        <meshStandardMaterial
          color="#0a0f2e"
          emissive="#0d1340"
          emissiveIntensity={0.4}
          roughness={0.9}
          metalness={0.1}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Grid lines */}
      {gridLines.map((geo, i) => (
        <line key={i}>
          <primitive object={geo} attach="geometry" />
          <lineBasicMaterial color="#1e2a5e" transparent opacity={0.4} />
        </line>
      ))}

      {/* Visitor dots */}
      {dotPositions.map((pos, i) => {
        const loc = locations[i]
        const size = Math.min(0.035 + loc.count * 0.005, 0.07)
        return (
          <mesh key={i} position={pos}>
            <sphereGeometry args={[size, 8, 8]} />
            <meshStandardMaterial
              color="#22d3ee"
              emissive="#06b6d4"
              emissiveIntensity={1.2}
              roughness={0}
              metalness={0}
            />
          </mesh>
        )
      })}

      {/* Glow ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[GLOBE_R + 0.08, GLOBE_R + 0.18, 64]} />
        <meshBasicMaterial color="#4f46e5" transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

export default function VisitorGlobe() {
  const [locations, setLocations] = useState<GeoLocation[]>([])
  const [total, setTotal] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/visitors/geo')
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d.locations)) setLocations(d.locations) })
      .catch(() => {})

    fetch('/api/visitors')
      .then((r) => r.json())
      .then((d) => { if (typeof d.count === 'number') setTotal(d.count) })
      .catch(() => {})
  }, [])

  const uniqueCountries = useMemo(
    () => new Set(locations.map((l) => l.countryCode).filter(Boolean)).size,
    [locations],
  )

  return (
    <div className="flex flex-col items-center gap-2 select-none pointer-events-auto">
      <div className="w-[180px] h-[180px] md:w-[200px] md:h-[200px]">
        <Canvas
          camera={{ position: [0, 0, 3.8], fov: 42 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={0.3} />
          <pointLight position={[4, 4, 4]} intensity={1.2} color="#c7d2fe" />
          <pointLight position={[-4, -2, -4]} intensity={0.4} color="#0ea5e9" />
          <GlobeMesh locations={locations} />
        </Canvas>
      </div>

      <div className="flex items-center gap-3 font-mono text-[11px] text-white/40">
        {total !== null && (
          <span>{total.toLocaleString()} visitors</span>
        )}
        {uniqueCountries > 0 && (
          <>
            <span className="text-white/20">·</span>
            <span>{uniqueCountries} countries</span>
          </>
        )}
      </div>
    </div>
  )
}
