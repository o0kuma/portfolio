import { Client } from '@notionhq/client'
import type {
  BlockObjectResponse,
  ChildPageBlockObjectResponse,
  PageObjectResponse,
} from '@notionhq/client/build/src/api-endpoints'

const notion = new Client({ auth: process.env.NOTION_API_KEY })

export type RestaurantPage = {
  id: string
  title: string
  emoji: string
}

export type RestaurantItem = {
  id: string
  name: string
  emoji: string
  checked: boolean
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
      const emoji = extractEmoji(title)
      pages.push({
        id: b.id,
        title: stripEmoji(title),
        emoji,
      })
    }
  }

  return pages
}

export async function getRestaurantItems(pageId: string): Promise<RestaurantItem[]> {
  const res = await notion.blocks.children.list({ block_id: pageId, page_size: 100 })
  const items: RestaurantItem[] = []

  for (const block of res.results) {
    const b = block as BlockObjectResponse
    if (b.type === 'to_do') {
      const td = (b as any).to_do
      const text = td.rich_text.map((t: any) => t.plain_text).join('')
      const emoji = extractEmoji(text)
      items.push({
        id: b.id,
        name: stripEmoji(text),
        emoji: emoji || '🍽️',
        checked: td.checked,
      })
    } else if (b.type === 'bulleted_list_item') {
      const li = (b as any).bulleted_list_item
      const text = li.rich_text.map((t: any) => t.plain_text).join('')
      const emoji = extractEmoji(text)
      items.push({
        id: b.id,
        name: stripEmoji(text),
        emoji: emoji || '🍽️',
        checked: false,
      })
    }
  }

  return items
}

// strips leading emoji-like character (codepoint > U+2600)
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
    // skip the surrogate pair (2 chars) or single char
    const skip = cp > 0xffff ? 2 : 1
    return str.slice(skip).trimLeft()
  }
  return str.trim()
}
