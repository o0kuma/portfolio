export type RecipeIngredientGroup = {
  title: string
  titleEn: string
  items: string[]
  itemsEn: string[]
}

export type Recipe = {
  slug: string
  title: string
  titleEn: string
  servings: string
  servingsEn: string
  measurementNote: string
  measurementNoteEn: string
  ingredientGroups: RecipeIngredientGroup[]
  /** Preparation order — a standard method for this ingredient set, not a
   *  verbatim transcription of the source blog post (which only listed
   *  ingredients). */
  steps: string[]
  stepsEn: string[]
  sourceUrl?: string
}

export const RECIPES: Recipe[] = [
  {
    slug: 'budae-jjigae',
    title: '부대찌개',
    titleEn: 'Budae-jjigae (Army Stew)',
    servings: '3-4인분',
    servingsEn: 'Serves 3-4',
    measurementNote: '계량 기준: 밥숟가락, 180ml컵',
    measurementNoteEn: 'Measurements: rice spoon, 180ml cup',
    ingredientGroups: [
      {
        title: '재료 준비',
        titleEn: 'Ingredients',
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
        itemsEn: [
          'Water 1L',
          '1 heaping spoon minced garlic',
          '1 can Spam (200g)',
          '3 Vienna or frankfurter sausages',
          '1 stalk green onion',
          '1/2 onion',
          '1 heaping spoon baked beans',
          '2 spoons ketchup',
          'A handful of sliced rice cake (tteok)',
        ],
      },
      {
        title: '찌개 양념장',
        titleEn: 'Stew sauce',
        items: [
          '고추장 1숟가락',
          '고춧가루 1숟가락',
          '진간장 1숟가락',
          '멸치 액젓 1숟가락',
          '설탕 0.2숟가락',
          '후춧가루 약간',
        ],
        itemsEn: [
          '1 spoon gochujang (red chili paste)',
          '1 spoon gochugaru (red chili flakes)',
          '1 spoon soy sauce',
          '1 spoon anchovy fish sauce',
          '0.2 spoon sugar',
          'A pinch of ground pepper',
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
    stepsEn: [
      'Mix the gochujang, gochugaru, soy sauce, anchovy fish sauce, sugar, and pepper to make the stew sauce.',
      'Cut the Spam and sausages into bite-sized pieces; slice the green onion and onion.',
      'Pour 1L of water into a pot, add the minced garlic and the stew sauce, and stir well.',
      'Add the Spam, sausages, onion, baked beans, and ketchup, then bring to a boil over high heat.',
      'Once it boils, add the green onion and rice cake, and simmer until the rice cake softens.',
      'Taste and finish with a little salt or pepper if needed.',
    ],
    sourceUrl: 'https://blog.naver.com/peace8012/224118164934',
  },
]
