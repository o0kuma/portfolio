export const runtime = 'nodejs'
export const revalidate = 3600

import { getRestaurantRegions, getRestaurantItems } from '@/lib/notion'
import FoodClient from './FoodClient'

export const metadata = {
  title: 'Food',
  description: '오승일의 맛집 리스트',
}

export default async function FoodPage() {
  try {
    const regions = await getRestaurantRegions()
    const regionData = await Promise.all(
      regions.map(async (region) => ({
        ...region,
        items: await getRestaurantItems(region),
      }))
    )
    return <FoodClient regions={regionData} />
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return <FoodClient regions={[]} error errorMessage={msg} />
  }
}
