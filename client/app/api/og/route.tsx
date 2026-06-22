import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') ?? 'Portfolio'
  const sub = searchParams.get('sub') ?? ''
  // 'category' param takes precedence over 'sub' for backward-compat
  const category = searchParams.get('category') || sub

  // Pick a badge color based on category
  const categoryColors: Record<string, string> = {
    tech: '#06b6d4',
    technology: '#06b6d4',
    economy: '#10b981',
    경제: '#10b981',
    travel: '#f59e0b',
    여행: '#f59e0b',
    food: '#f97316',
    맛집: '#f97316',
    life: '#a78bfa',
    일상: '#a78bfa',
    dev: '#3b82f6',
    개발: '#3b82f6',
  }
  const badgeColor = categoryColors[category?.toLowerCase() ?? ''] ?? '#64748b'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0c0a09 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            padding: '60px',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '24px',
            background: 'rgba(255,255,255,0.03)',
            maxWidth: '900px',
            textAlign: 'center',
          }}
        >
          {category && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '6px 20px',
                borderRadius: '999px',
                background: `${badgeColor}22`,
                border: `1px solid ${badgeColor}66`,
                color: badgeColor,
                fontSize: '22px',
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              {category}
            </div>
          )}
          <div
            style={{
              fontSize: '52px',
              fontWeight: 'bold',
              color: 'white',
              lineHeight: 1.2,
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: '22px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>
            kuuuma.com
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
