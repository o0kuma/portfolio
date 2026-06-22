import { Client } from '@notionhq/client'
import type {
  BlockObjectResponse,
  ChildPageBlockObjectResponse,
} from '@notionhq/client/build/src/api-endpoints'

const notion = new Client({ auth: process.env.NOTION_API_KEY })

export type RestaurantPage = {
  id: string
  title: string
  emoji: string
  isDatabase: boolean
}

export type RestaurantItem = {
  id: string
  name: string
  emoji: string
  checked: boolean
  category?: string
  location?: string
  address?: string
  menu?: string
}

export async function getRestaurantRegions(): Promise<RestaurantPage[]> {
  const res = await notion.blocks.children.list({
    block_id: process.env.NOTION_FOOD_PAGE_ID!,
    page_size: 100,
  })

  const pages: RestaurantPage[] = []

  for (const block of res.results) {
    const b = block as BlockObjectResponse
    if (b.type === 'child_page') {
      const cp = b as ChildPageBlockObjectResponse
      const title = cp.child_page.title
      pages.push({
        id: b.id,
        title: stripEmoji(title),
        emoji: extractEmoji(title),
        isDatabase: false,
      })
    } else if (b.type === 'child_database') {
      const title = (b as any).child_database.title as string
      pages.push({
        id: b.id,
        title: stripEmoji(title),
        emoji: extractEmoji(title),
        isDatabase: true,
      })
    }
  }

  return pages
}

export async function getRestaurantItems(region: RestaurantPage): Promise<RestaurantItem[]> {
  if (region.isDatabase) {
    return getItemsFromDatabase(region.id)
  }
  return getItemsFromPage(region.id)
}

async function getItemsFromDatabase(databaseId: string): Promise<RestaurantItem[]> {
  const res = await notion.databases.query({
    database_id: databaseId,
    page_size: 100,
  })

  return res.results.map((page: any) => {
    const props = page.properties

    // find title property
    const titleProp = Object.values(props).find((p: any) => p.type === 'title') as any
    const name = titleProp?.title?.map((t: any) => t.plain_text).join('') ?? ''

    const category = getSelect(props['카테고리'] ?? props['Category'])
    const location = getSelect(props['위치'] ?? props['Location'])
    const menu = getRichText(props['추천 메뉴'] ?? props['Menu'] ?? props['추천메뉴'])
    const address = getRichText(props['주소'] ?? props['Address'])

    return {
      id: page.id,
      name: name.trim(),
      emoji: extractEmoji(name),
      checked: false,
      category,
      location,
      menu,
      address,
    }
  })
}

async function getItemsFromPage(pageId: string): Promise<RestaurantItem[]> {
  const res = await notion.blocks.children.list({ block_id: pageId, page_size: 100 })
  const items: RestaurantItem[] = []

  for (const block of res.results) {
    const b = block as BlockObjectResponse
    let text = ''
    let checked = false

    if (b.type === 'to_do') {
      text = (b as any).to_do.rich_text.map((t: any) => t.plain_text).join('')
      checked = (b as any).to_do.checked
    } else if (b.type === 'bulleted_list_item') {
      text = (b as any).bulleted_list_item.rich_text.map((t: any) => t.plain_text).join('')
    } else if (b.type === 'numbered_list_item') {
      text = (b as any).numbered_list_item.rich_text.map((t: any) => t.plain_text).join('')
    } else if (b.type === 'paragraph') {
      text = (b as any).paragraph.rich_text.map((t: any) => t.plain_text).join('')
    }

    text = text.trim()
    if (!text) continue

    items.push({
      id: b.id,
      name: stripEmoji(text),
      emoji: extractEmoji(text),
      checked,
    })
  }

  return items
}

// ── helpers ──────────────────────────────────────────────
function getRichText(prop: any): string {
  if (!prop) return ''
  if (prop.type === 'rich_text') return prop.rich_text?.map((t: any) => t.plain_text).join('') ?? ''
  return ''
}

function getSelect(prop: any): string {
  if (!prop) return ''
  if (prop.type === 'select') return prop.select?.name ?? ''
  if (prop.type === 'multi_select') return prop.multi_select?.map((s: any) => s.name).join(', ') ?? ''
  return ''
}

// only match actual emoji codepoints (U+1F300 and above, plus U+2600–U+27BF symbols)
function extractEmoji(str: string): string {
  if (!str) return ''
  const cp = str.codePointAt(0) ?? 0
  if (cp >= 0x1f300 || (cp >= 0x2600 && cp <= 0x27bf)) return String.fromCodePoint(cp)
  return ''
}

function stripEmoji(str: string): string {
  if (!str) return ''
  const cp = str.codePointAt(0) ?? 0
  if (cp >= 0x1f300 || (cp >= 0x2600 && cp <= 0x27bf)) {
    const skip = cp > 0xffff ? 2 : 1
    return str.slice(skip).trimStart()
  }
  return str.trim()
}
