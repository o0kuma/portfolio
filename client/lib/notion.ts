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

    const name = getRichText(props['이름'] ?? props['Name'] ?? props['name'])
      || getTitle(props['이름'] ?? props['Name'] ?? props['name'])
      || Object.values(props).find((p: any) => p.type === 'title')
        ? getTitle(Object.values(props).find((p: any) => p.type === 'title') as any)
        : '(이름 없음)'

    const category = getSelect(props['카테고리'] ?? props['Category'])
    const location = getSelect(props['위치'] ?? props['Location'])
    const menu = getRichText(props['추천 메뉴'] ?? props['Menu'])
    const address = getRichText(props['주소'] ?? props['Address'])

    const emoji = extractEmoji(name as string)

    return {
      id: page.id,
      name: stripEmoji(name as string),
      emoji: emoji || '🍽️',
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
      emoji: extractEmoji(text) || '🍽️',
      checked,
    })
  }

  return items
}

// ── helpers ──────────────────────────────────────────────
function getTitle(prop: any): string {
  if (!prop) return ''
  if (prop.type === 'title') return prop.title?.map((t: any) => t.plain_text).join('') ?? ''
  return ''
}

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

function extractEmoji(str: string): string {
  if (!str) return ''
  const cp = str.codePointAt(0) ?? 0
  if (cp > 0x2600) return String.fromCodePoint(cp)
  return ''
}

function stripEmoji(str: string): string {
  if (!str) return ''
  const cp = str.codePointAt(0) ?? 0
  if (cp > 0x2600) {
    const skip = cp > 0xffff ? 2 : 1
    return str.slice(skip).trimLeft()
  }
  return str.trim()
}
