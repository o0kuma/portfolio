export type RecipeIngredientGroup = {
  title: string
  items: string[]
}

export type Recipe = {
  slug: string
  title: string
  servings: string
  measurementNote: string
  ingredientGroups: RecipeIngredientGroup[]
  /** Preparation order — a standard method for this ingredient set, not a
   *  verbatim transcription of the source blog post (which only listed
   *  ingredients). */
  steps: string[]
  sourceUrl?: string
}

export const RECIPES: Recipe[] = [
  {
    slug: 'budae-jjigae',
    title: '부대찌개',
    servings: '3-4인분',
    measurementNote: '계량 기준: 밥숟가락, 180ml컵',
    ingredientGroups: [
      {
        title: '재료 준비',
        items: [
          '물 1L',
          '다진 마늘 크게 1숟가락',
          '스팸 1캔 (200g)',
          '비엔나소시지 혹은 후랑크 소시지 3줄',
          '대파 1대',
          '양파 1/2개',
          '베이크드빈스 듬뿍 1숟가락',
          '케첩 2숟가락',
          '떡국떡 한 줌',
        ],
      },
      {
        title: '찌개 양념장',
        items: [
          '고추장 1숟가락',
          '고춧가루 1숟가락',
          '진간장 1숟가락',
          '멸치 액젓 1숟가락',
          '설탕 0.2숟가락',
          '후춧가루 약간',
        ],
      },
    ],
    steps: [
      '고추장, 고춧가루, 진간장, 멸치 액젓, 설탕, 후춧가루를 섞어 찌개 양념장을 만들어둡니다.',
      '스팸과 소시지는 한입 크기로 썰고, 대파와 양파도 먹기 좋게 채 썹니다.',
      '냄비에 물 1L를 붓고 다진 마늘과 양념장을 넣어 잘 풀어줍니다.',
      '스팸, 소시지, 양파, 베이크드빈스, 케첩을 넣고 센 불에서 끓입니다.',
      '한 번 끓어오르면 대파와 떡국떡을 넣고, 떡이 부드러워질 때까지 한 번 더 끓입니다.',
      '간을 보고 부족하면 소금이나 후춧가루로 마무리합니다.',
    ],
    sourceUrl: 'https://blog.naver.com/peace8012/224118164934',
  },
]
