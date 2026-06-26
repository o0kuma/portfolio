import { NextRequest, NextResponse } from 'next/server'

interface SectionStat {
  section: string
  views: number
  totalDuration: number
  avgDuration: number
}

interface SectionData {
  views: number
  totalDuration: number
}

// In-memory store
const sectionMap = new Map<string, SectionData>()

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { section, duration } = body as { section: string; duration: number }

    if (typeof section !== 'string' || !section.trim()) {
      return NextResponse.json({ error: 'Invalid section' }, { status: 400 })
    }
    if (typeof duration !== 'number' || duration < 0) {
      return NextResponse.json({ error: 'Invalid duration' }, { status: 400 })
    }

    const existing = sectionMap.get(section) ?? { views: 0, totalDuration: 0 }
    sectionMap.set(section, {
      views: existing.views + 1,
      totalDuration: existing.totalDuration + duration,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}

export async function GET() {
  const stats: SectionStat[] = Array.from(sectionMap.entries()).map(
    ([section, data]) => ({
      section,
      views: data.views,
      totalDuration: data.totalDuration,
      avgDuration: data.views > 0 ? Math.round(data.totalDuration / data.views) : 0,
    })
  )

  // Sort by views descending
  stats.sort((a, b) => b.views - a.views)

  return NextResponse.json(stats)
}
