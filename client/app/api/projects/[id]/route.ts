export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { dbQuery } from '@/lib/neon-server'

type Ctx = { params: { id: string } }

export async function GET(_request: NextRequest, { params }: Ctx) {
  try {
    const { id } = params

    const result = await dbQuery('SELECT * FROM projects WHERE id = $1 LIMIT 1', [id])
    const project = result.rows[0]

    if (!project) {
      return NextResponse.json({ message: '프로젝트를 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json(project)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/projects/[id] GET]', msg)
    return NextResponse.json({ message: msg }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  try {
    const adminToken = process.env.ADMIN_API_TOKEN
    const auth = request.headers.get('authorization') ?? ''
    const provided = auth.startsWith('Bearer ') ? auth.slice(7).trim() : ''

    if (!adminToken || provided !== adminToken) {
      return NextResponse.json({ error: '관리자 인증이 필요합니다.' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()

    // Accept both camelCase and snake_case keys from the client
    const normalised: Record<string, unknown> = {}
    const camelToSnake: Record<string, string> = {
      githubUrl: 'github_url',
      liveUrl: 'live_url',
      startDate: 'start_date',
      endDate: 'end_date',
    }
    for (const [k, v] of Object.entries(body ?? {})) {
      normalised[camelToSnake[k] ?? k] = v
    }
    normalised['updated_at'] = new Date().toISOString()

    const entries = Object.entries(normalised)
    if (!entries.length) {
      return NextResponse.json({ message: '수정할 내용이 없습니다.' }, { status: 400 })
    }

    const setClause = entries.map(([k], i) => `${k} = $${i + 1}`).join(', ')
    const values = entries.map(([, v]) => v)
    values.push(id)

    const result = await dbQuery(
      `UPDATE projects SET ${setClause} WHERE id = $${values.length} RETURNING *`,
      values,
    )

    if (!result.rows[0]) {
      return NextResponse.json({ message: '프로젝트를 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json({ message: '프로젝트가 업데이트되었습니다.', project: result.rows[0] })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/projects/[id] PUT]', msg)
    return NextResponse.json({ message: msg }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  try {
    const adminToken = process.env.ADMIN_API_TOKEN
    const auth = request.headers.get('authorization') ?? ''
    const provided = auth.startsWith('Bearer ') ? auth.slice(7).trim() : ''

    if (!adminToken || provided !== adminToken) {
      return NextResponse.json({ error: '관리자 인증이 필요합니다.' }, { status: 401 })
    }

    const { id } = params
    await dbQuery('DELETE FROM projects WHERE id = $1', [id])

    return NextResponse.json({ message: '프로젝트가 삭제되었습니다.' })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/projects/[id] DELETE]', msg)
    return NextResponse.json({ message: msg }, { status: 500 })
  }
}
