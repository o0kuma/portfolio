export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

export async function GET() {
  const notion = new Client({ auth: process.env.NOTION_API_KEY })
  const res = await notion.blocks.children.list({
    block_id: process.env.NOTION_FOOD_PAGE_ID!,
    page_size: 100,
  })
  const summary = res.results.map((b: any) => ({
    id: b.id,
    type: b.type,
    title: b.child_page?.title ?? b.child_database?.title ?? null,
  }))
  return NextResponse.json(summary)
}
