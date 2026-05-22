/** Blog categories aligned with cron DAILY_SCHEDULE */
export const POST_CATEGORIES = [
  { id: 'tech', ko: '테크', en: 'Tech' },
  { id: 'economy', ko: '경제', en: 'Economy' },
  { id: 'coin', ko: '코인', en: 'Coin' },
  { id: 'travel', ko: '여행', en: 'Travel' },
  { id: 'food', ko: '푸드', en: 'Food' },
  { id: 'lottery', ko: '로또', en: 'Lottery' },
  { id: 'general', ko: '일반', en: 'General' },
] as const

export type PostCategoryId = (typeof POST_CATEGORIES)[number]['id']

export function getCategoryLabel(id: string, locale: 'ko' | 'en'): string {
  const row = POST_CATEGORIES.find((c) => c.id === id)
  if (!row) return locale === 'ko' ? '일반' : 'General'
  return locale === 'ko' ? row.ko : row.en
}
