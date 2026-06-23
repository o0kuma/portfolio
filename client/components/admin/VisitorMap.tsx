'use client'

import { useState } from 'react'
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

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

  return (
    <div className="relative w-full" style={{ background: '#0a0a0a', borderRadius: '0.75rem', overflow: 'hidden' }}>
      <ComposableMap
        projectionConfig={{ scale: 147 }}
        style={{ width: '100%', height: '384px' }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }: { geographies: unknown[] }) =>
            geographies.map((geo: unknown) => {
              const g = geo as { rsmKey: string }
              return (
                <Geography
                  key={g.rsmKey}
                  geography={geo}
                  fill="#262626"
                  stroke="#404040"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: 'none' },
                    hover: { outline: 'none', fill: '#333' },
                    pressed: { outline: 'none' },
                  }}
                />
              )
            })
          }
        </Geographies>

        {mapPoints.map((point, i) => (
          <Marker
            key={i}
            coordinates={[point.lng, point.lat]}
            onMouseEnter={(e: React.MouseEvent) => {
              const rect = (e.currentTarget as SVGElement)
                .closest('svg')
                ?.getBoundingClientRect()
              setTooltip({
                x: e.clientX - (rect?.left ?? 0),
                y: e.clientY - (rect?.top ?? 0),
                city: point.city,
                country: point.country,
                count: point.count,
              })
            }}
            onMouseLeave={() => setTooltip(null)}
          >
            <circle
              r={getMarkerRadius(point.count)}
              fill="rgba(239, 68, 68, 0.75)"
              stroke="#ef4444"
              strokeWidth={1}
              style={{ cursor: 'pointer' }}
            />
          </Marker>
        ))}
      </ComposableMap>

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
