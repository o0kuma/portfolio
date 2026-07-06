'use client'

import { useEffect, useMemo, useState } from 'react'
import { geoEqualEarth, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'
import type { FeatureCollection, Geometry } from 'geojson'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

const VIEW_W = 800
const VIEW_H = 400

interface MapPoint {
  lat: number
  lng: number
  city: string | null
  country: string | null
  count: number
}

interface VisitorMapProps {
  mapPoints: MapPoint[]
}

interface TooltipState {
  x: number
  y: number
  city: string | null
  country: string | null
  count: number
}

function getMarkerRadius(count: number): number {
  if (count >= 100) return 12
  if (count >= 50) return 9
  if (count >= 10) return 7
  if (count >= 5) return 6
  return 4
}

export default function VisitorMap({ mapPoints }: VisitorMapProps) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const [geographies, setGeographies] = useState<FeatureCollection | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch(GEO_URL)
      .then((res) => res.json())
      .then((topology) => {
        if (cancelled) return
        const obj = topology.objects.countries
        const fc = feature(topology, obj) as unknown as FeatureCollection
        setGeographies(fc)
      })
      .catch(() => setGeographies(null))
    return () => {
      cancelled = true
    }
  }, [])

  // geoEqualEarth with scale 147 matches the previous react-simple-maps default framing.
  const projection = useMemo(
    () => geoEqualEarth().scale(147).translate([VIEW_W / 2, VIEW_H / 2 + 20]),
    [],
  )
  const pathGen = useMemo(() => geoPath(projection), [projection])

  const countryPaths = useMemo(() => {
    if (!geographies) return []
    return geographies.features
      .map((f, i) => ({ key: i, d: pathGen(f as unknown as Geometry) }))
      .filter((p): p is { key: number; d: string } => !!p.d)
  }, [geographies, pathGen])

  const markers = useMemo(
    () =>
      mapPoints
        .map((point) => {
          const xy = projection([point.lng, point.lat])
          return xy ? { point, x: xy[0], y: xy[1] } : null
        })
        .filter((m): m is { point: MapPoint; x: number; y: number } => !!m),
    [mapPoints, projection],
  )

  return (
    <div className="relative w-full" style={{ background: '#0a0a0a', borderRadius: '0.75rem', overflow: 'hidden' }}>
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height: '384px' }}
      >
        <g>
          {countryPaths.map((c) => (
            <path key={c.key} d={c.d} fill="#262626" stroke="#404040" strokeWidth={0.5} />
          ))}
        </g>
        <g>
          {markers.map(({ point, x, y }, i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={getMarkerRadius(point.count)}
              fill="rgba(239, 68, 68, 0.75)"
              stroke="#ef4444"
              strokeWidth={1}
              style={{ cursor: 'pointer' }}
              onMouseEnter={(e) => {
                const rect = (e.currentTarget as SVGElement).closest('svg')?.getBoundingClientRect()
                setTooltip({
                  x: e.clientX - (rect?.left ?? 0),
                  y: e.clientY - (rect?.top ?? 0),
                  city: point.city,
                  country: point.country,
                  count: point.count,
                })
              }}
              onMouseLeave={() => setTooltip(null)}
            />
          ))}
        </g>
      </svg>

      {tooltip && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm shadow-xl"
          style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}
        >
          <p className="font-semibold text-white">
            {[tooltip.city, tooltip.country].filter(Boolean).join(', ') || '알 수 없음'}
          </p>
          <p className="text-neutral-400">방문자 {tooltip.count}명</p>
        </div>
      )}
    </div>
  )
}
