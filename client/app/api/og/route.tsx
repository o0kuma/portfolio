import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') ?? 'Portfolio'
  const sub = searchParams.get('sub') ?? ''

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
            gap: '16px',
            padding: '60px',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '24px',
            background: 'rgba(255,255,255,0.03)',
            maxWidth: '900px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '64px', lineHeight: 1 }}>🎮</div>
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
          {sub && (
            <div style={{ fontSize: '28px', color: 'rgba(255,255,255,0.6)' }}>{sub}</div>
          )}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
