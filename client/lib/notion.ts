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

export type DevResourceCategory = '레퍼런스' | '프레임워크' | '도구'

export type DevResource = {
  id: string
  name: string
  description: string
  descriptionEn: string
  url: string
  category: DevResourceCategory
  icon: string
}

/**
 * Reads a database with columns: title (name), 설명/Description (rich_text,
 * Korean), 영문설명/DescriptionEn (rich_text, optional English), URL (url),
 * 카테고리/Category (select: 레퍼런스/프레임워크/도구). Unset or unrecognized
 * category values fall back to '도구' rather than being dropped, so a
 * miscategorized row still shows up (just possibly in the wrong filter tab).
 */
export async function getDevResources(): Promise<DevResource[]> {
  const databaseId = process.env.NOTION_DEV_RESOURCES_DB_ID
  if (!databaseId) return []

  const res = await notion.databases.query({
    database_id: databaseId,
    page_size: 100,
  })

  const KNOWN_CATEGORIES: DevResourceCategory[] = ['레퍼런스', '프레임워크', '도구']

  return res.results.map((page: any) => {
    const props = page.properties
    const entries = Object.entries(props) as [string, any][]

    const titleProp = entries.find(([, p]) => p.type === 'title')?.[1]
    const name = (titleProp?.title?.map((t: any) => t.plain_text).join('') ?? '').trim()

    const urlProp = entries.find(([, p]) => p.type === 'url')?.[1]
    const url = urlProp?.url ?? ''

    const descKeys = ['설명', 'Description', '한글설명']
    const descProp = entries.find(([k, p]) => p.type === 'rich_text' && descKeys.includes(k))?.[1]
      ?? entries.find(([, p]) => p.type === 'rich_text')?.[1]
    const description = getRichText(descProp)

    const descEnKeys = ['영문설명', 'DescriptionEn', 'Description (EN)', 'English']
    const descEnProp = entries.find(([k, p]) => p.type === 'rich_text' && descEnKeys.includes(k))?.[1]
    const descriptionEn = getRichText(descEnProp) || description

    const categoryProp = entries.find(([, p]) => p.type === 'select')?.[1]
    const rawCategory = getSelect(categoryProp)
    const category = (KNOWN_CATEGORIES as string[]).includes(rawCategory)
      ? (rawCategory as DevResourceCategory)
      : '도구'

    const icon = page.icon?.emoji ?? extractEmoji(name) ?? '🔗'

    return { id: page.id, name: stripEmoji(name), description, descriptionEn, url, category, icon }
  }).filter((r) => r.name && r.url)
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
  imageUrl?: string
  imageUrls?: string[]
}

export async function getRestaurantRegions(): Promise<RestaurantPage[]> {
  const foodPageId = process.env.NOTION_FOOD_PAGE_ID
  if (!foodPageId || !process.env.NOTION_API_KEY) {
    throw new Error('NOTION_FOOD_PAGE_ID / NOTION_API_KEY is not set')
  }
  const res = await notion.blocks.children.list({
    block_id: foodPageId,
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
    const entries = Object.entries(props) as [string, any][]

    // title — always one per database
    const titleProp = entries.find(([, p]) => p.type === 'title')?.[1]
    const name = titleProp?.title?.map((t: any) => t.plain_text).join('') ?? ''

    // checkbox — 방문/visited/checked
    const checkboxKeys = ['방문', '방문여부', 'visited', 'Visited', '체크', 'checked', 'Done']
    const checkboxProp =
      entries.find(([k, p]) => p.type === 'checkbox' && checkboxKeys.includes(k))?.[1]
      ?? entries.find(([, p]) => p.type === 'checkbox')?.[1]
    const checked = checkboxProp?.checkbox ?? false

    // select — 카테고리
    const categoryKeys = ['카테고리', 'Category', '종류', 'type', 'Type']
    const categoryProp =
      entries.find(([k, p]) => (p.type === 'select' || p.type === 'multi_select') && categoryKeys.includes(k))?.[1]
      ?? entries.find(([, p]) => p.type === 'select' || p.type === 'multi_select')?.[1]
    const category = getSelect(categoryProp)

    // rich_text — 주소
    const addressKeys = ['주소', 'Address', '위치', 'Location']
    const addressProp = entries.find(([k, p]) => p.type === 'rich_text' && addressKeys.includes(k))?.[1]
    const address = getRichText(addressProp)

    // rich_text — 추천 메뉴 (주소 외 나머지 rich_text)
    const menuKeys = ['추천 메뉴', '추천메뉴', 'Menu', '메뉴', '특이사항', '메모', 'Note']
    const menuProp = entries.find(([k, p]) => p.type === 'rich_text' && menuKeys.includes(k))?.[1]
      ?? entries.find(([k, p]) => p.type === 'rich_text' && !addressKeys.includes(k))?.[1]
    const menu = getRichText(menuProp)

    // location (select that isn't category)
    const locationKeys = ['위치', 'Location', '지역', 'Area']
    const locationProp = entries.find(([k, p]) => (p.type === 'select') && locationKeys.includes(k))?.[1]
    const location = getSelect(locationProp)

    // image — cover image or Files & media property
    const coverUrl: string | undefined =
      page.cover?.external?.url ?? page.cover?.file?.url
    const filesProp = entries.find(([, p]) => p.type === 'files')?.[1]
    const filesUrl: string | undefined =
      filesProp?.files?.[0]?.external?.url ?? filesProp?.files?.[0]?.file?.url
    const imageUrl: string | undefined = coverUrl ?? filesUrl

    // collect all images for carousel
    const allImages: string[] = []
    if (coverUrl) allImages.push(coverUrl)
    for (const f of filesProp?.files ?? []) {
      const url: string | undefined = f.external?.url ?? f.file?.url
      if (url) allImages.push(url)
    }
    const imageUrls: string[] = Array.from(new Set(allImages))

    return {
      id: page.id,
      name: name.trim(),
      emoji: extractEmoji(name),
      checked,
      category,
      location,
      menu,
      address,
      ...(imageUrl ? { imageUrl } : {}),
      imageUrls,
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

export type AboutInterest = { ko: string; en: string }
export type AboutTool = { name: string; icon: string }
export type SkillEntry = { category: string; name: string; level: number }

export type AboutSkillsData = {
  interests: AboutInterest[]
  tools: AboutTool[]
  skills: SkillEntry[]
}

/**
 * Reads the About/Skills database: one row per item, distinguished by a
 * `Group` select (관심사/도구/스킬). 관심사 rows use Name (Korean) + NameEn
 * (English); 도구 rows use Name + Icon (emoji); 스킬 rows use Name + Category
 * (matches the `id` of a SKILL_CATEGORIES entry in Skills.tsx) + Level
 * (0-100). Rows are sorted by `Order` within their group/category before
 * being bucketed, so callers don't need to re-sort.
 */
export async function getAboutSkills(): Promise<AboutSkillsData> {
  const databaseId = process.env.NOTION_ABOUT_SKILLS_DB_ID
  if (!databaseId) return { interests: [], tools: [], skills: [] }

  const res = await notion.databases.query({
    database_id: databaseId,
    page_size: 100,
  })

  const rows = res.results.map((page: any) => {
    const props = page.properties
    const entries = Object.entries(props) as [string, any][]

    const titleProp = entries.find(([, p]) => p.type === 'title')?.[1]
    const name = (titleProp?.title?.map((t: any) => t.plain_text).join('') ?? '').trim()

    const nameEnProp = entries.find(([k, p]) => p.type === 'rich_text' && k === 'NameEn')?.[1]
    const nameEn = getRichText(nameEnProp)

    const iconProp = entries.find(([k, p]) => p.type === 'rich_text' && k === 'Icon')?.[1]
    const icon = getRichText(iconProp)

    const groupProp = entries.find(([k, p]) => p.type === 'select' && k === 'Group')?.[1]
    const group = getSelect(groupProp)

    const categoryProp = entries.find(([k, p]) => p.type === 'select' && k === 'Category')?.[1]
    const category = getSelect(categoryProp)

    const levelProp = entries.find(([k, p]) => p.type === 'number' && k === 'Level')?.[1]
    const level = levelProp?.number ?? 0

    const orderProp = entries.find(([k, p]) => p.type === 'number' && k === 'Order')?.[1]
    const order = orderProp?.number ?? 0

    return { name, nameEn, icon, group, category, level, order }
  }).sort((a, b) => a.order - b.order)

  const interests: AboutInterest[] = []
  const tools: AboutTool[] = []
  const skills: SkillEntry[] = []

  for (const row of rows) {
    if (!row.name) continue
    if (row.group === '관심사') {
      interests.push({ ko: row.name, en: row.nameEn || row.name })
    } else if (row.group === '도구') {
      tools.push({ name: row.name, icon: row.icon || '' })
    } else if (row.group === '스킬' && row.category) {
      skills.push({ category: row.category, name: row.name, level: row.level })
    }
  }

  return { interests, tools, skills }
}

export type RecipeIngredientGroup = { title: string; items: string[] }

export type NotionRecipe = {
  slug: string
  title: string
  servings: string
  measurementNote: string
  ingredientGroups: RecipeIngredientGroup[]
  steps: string[]
  sourceUrl?: string
}

function parseIngredientGroups(raw: string): RecipeIngredientGroup[] {
  if (!raw) return []
  return raw
    .split(';;')
    .map((group) => {
      const [title, itemsStr] = group.split('::')
      return {
        title: (title ?? '').trim(),
        items: (itemsStr ?? '').split('|').map((s) => s.trim()).filter(Boolean),
      }
    })
    .filter((g) => g.title && g.items.length > 0)
}

function parseSteps(raw: string): string[] {
  if (!raw) return []
  return raw.split(';;').map((s) => s.trim()).filter(Boolean)
}

/**
 * Reads the Recipes database. Ingredient groups and steps are stored as
 * flattened rich_text so a single Notion property can hold nested data:
 * IngredientGroups = "title::item1|item2;;title2::item3|item4"
 * Steps = "step 1;;step 2;;step 3"
 */
export async function getRecipes(): Promise<NotionRecipe[]> {
  const databaseId = process.env.NOTION_RECIPES_DB_ID
  if (!databaseId) return []

  const res = await notion.databases.query({
    database_id: databaseId,
    page_size: 100,
  })

  return res.results
    .map((page: any) => {
      const props = page.properties
      const entries = Object.entries(props) as [string, any][]

      const titleProp = entries.find(([, p]) => p.type === 'title')?.[1]
      const title = (titleProp?.title?.map((t: any) => t.plain_text).join('') ?? '').trim()

      const getText = (key: string) => getRichText(entries.find(([k, p]) => p.type === 'rich_text' && k === key)?.[1])

      const slug = getText('Slug') || title
      const servings = getText('Servings')
      const measurementNote = getText('MeasurementNote')
      const ingredientGroups = parseIngredientGroups(getText('IngredientGroups'))
      const steps = parseSteps(getText('Steps'))

      const urlProp = entries.find(([, p]) => p.type === 'url')?.[1]
      const sourceUrl = urlProp?.url || undefined

      const orderProp = entries.find(([k, p]) => p.type === 'number' && k === 'Order')?.[1]
      const order = orderProp?.number ?? 0

      return { slug, title, servings, measurementNote, ingredientGroups, steps, sourceUrl, order }
    })
    .filter((r) => r.title && r.ingredientGroups.length > 0 && r.steps.length > 0)
    .sort((a, b) => a.order - b.order)
    .map(({ order, ...rest }) => rest)
}

export type Faq = {
  id: string
  question: string
  answer: string
  category: string
}

/**
 * Reads the FAQ database. A `Visible` checkbox lets rows be drafted/hidden
 * without deleting them; missing/unset checkboxes default to visible so a
 * freshly-added row shows up immediately.
 */
export async function getFaqs(): Promise<Faq[]> {
  const databaseId = process.env.NOTION_FAQ_DB_ID
  if (!databaseId) return []

  const res = await notion.databases.query({
    database_id: databaseId,
    page_size: 100,
  })

  return res.results
    .map((page: any) => {
      const props = page.properties
      const entries = Object.entries(props) as [string, any][]

      const titleProp = entries.find(([, p]) => p.type === 'title')?.[1]
      const question = (titleProp?.title?.map((t: any) => t.plain_text).join('') ?? '').trim()

      const answerProp = entries.find(([k, p]) => p.type === 'rich_text' && k === 'Answer')?.[1]
      const answer = getRichText(answerProp)

      const categoryProp = entries.find(([k, p]) => p.type === 'select' && k === 'Category')?.[1]
      const category = getSelect(categoryProp)

      const visibleProp = entries.find(([k, p]) => p.type === 'checkbox' && k === 'Visible')?.[1]
      const visible = visibleProp ? visibleProp.checkbox !== false : true

      const orderProp = entries.find(([k, p]) => p.type === 'number' && k === 'Order')?.[1]
      const order = orderProp?.number ?? 0

      return { id: page.id, question, answer, category, visible, order }
    })
    .filter((f) => f.question && f.answer && f.visible)
    .sort((a, b) => a.order - b.order)
    .map(({ order, visible, ...rest }) => rest)
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
