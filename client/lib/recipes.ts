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
  {
    slug: 'dak-gomtang',
    title: '닭봉으로 끓인 닭곰탕',
    servings: '2-3인분',
    measurementNote: '닭한마리나 닭볶음용 닭을 써도 됩니다',
    ingredientGroups: [
      {
        title: '재료 준비',
        items: [
          '닭봉 500g (또는 닭볶음용 닭 800g~1마리)',
          '양파 1개',
          '대파 1대',
          '마늘 10알',
          '소주 약간 (데치기용)',
          '소금, 후추 약간',
        ],
      },
    ],
    steps: [
      '냄비에 물과 닭봉, 소주를 넣고 3~5분간 끓인 뒤 물을 버리고 불순물을 씻어냅니다.',
      '깨끗한 물 1.5~2L를 붓고 데친 닭봉, 양파, 대파, 마늘을 넣습니다.',
      '센 불에서 끓이다가 끓어오르면 중약불로 줄여 40~50분간 거품을 걷어내며 푹 끓입니다.',
      '익은 닭고기를 건져 식힌 뒤 먹기 좋게 찢고, 채소 건더기는 건져냅니다.',
      '육수에 소금과 후추로 간을 하고, 찢은 닭살과 송송 썬 대파를 고명으로 올려 마무리합니다.',
    ],
    sourceUrl: 'https://blog.naver.com/teaser1/224250045192',
  },
  {
    slug: 'spam-gangdoenjang-ssambap',
    title: '스팸 강된장 쌈밥',
    servings: '2인분',
    measurementNote: '계량 기준: 밥숟가락',
    ingredientGroups: [
      {
        title: '재료 준비',
        items: [
          '스팸 1캔',
          '두부 1모',
          '된장 1숟가락',
          '고추장 1숟가락',
          '양파 1개',
          '표고버섯 적당량',
          '다진 마늘 1숟가락',
          '대파, 청양고추 (선택)',
          '설탕 약간',
          '쌈용 양배추 (선택)',
        ],
      },
    ],
    steps: [
      '스팸을 잘게 썰어 팬에 살짝 볶습니다.',
      '된장 1숟가락, 고추장 1숟가락, 다진 마늘 1숟가락을 넣고 함께 볶습니다.',
      '다진 양파와 표고버섯을 넣고 볶은 뒤 두부를 큼직하게 썰어 넣습니다.',
      '물을 자작하게 붓고 청양고추와 설탕 약간을 넣어 국물이 졸아들 때까지 끓입니다.',
      '쌈용 양배추를 곁들일 경우, 랩을 씌워 구멍을 낸 뒤 전자레인지에 7분 돌려 함께 냅니다.',
    ],
  },
  {
    slug: 'spam-egg-gimbap',
    title: '스팸 계란 김밥',
    servings: '2-3줄',
    measurementNote: '계량 기준: 밥숟가락(T)',
    ingredientGroups: [
      {
        title: '재료 준비',
        items: [
          '스팸 1캔',
          '계란 3개',
          '밥 1공기',
          '다진 양파',
          '고추 또는 쪽파',
          '김 (김밥용)',
          '간장 1큰술',
          '참기름 1큰술',
          '통깨, 후추 약간',
        ],
      },
    ],
    steps: [
      '스팸을 잘게 썰어 다진 양파, 후추와 함께 노릇하게 볶습니다.',
      '계란 3개를 스크램블한 뒤 볶은 스팸과 섞습니다.',
      '밥에 볶은 재료, 간장 1큰술, 참기름 1큰술, 통깨, 고추 또는 쪽파를 넣고 고루 비빕니다.',
      '김 위에 밥을 얇게 펴고 단단하게 말아 먹기 좋은 크기로 썰면 완성입니다.',
    ],
  },
  {
    slug: 'tuna-radish-stew',
    title: '참치 무조림',
    servings: '2-3인분',
    measurementNote: '계량 기준: 밥숟가락(T)',
    ingredientGroups: [
      {
        title: '재료 준비',
        items: [
          '무 (적당한 두께로 썬 것)',
          '물 500ml',
          '썬 양파 1/2개',
          '대파',
          '청양고추',
          '참치 1캔 (160g)',
        ],
      },
      {
        title: '양념장',
        items: [
          '진장 1T',
          '진간장 2T',
          '맛술 1T',
          '고춧가루 2T',
          '설탕 2T',
          '참치액 2T',
          '다진 마늘 1T',
          '후추 약간',
        ],
      },
    ],
    steps: [
      '냄비에 적당한 두께로 썬 무를 넣고 물 500ml를 부어 끓여주세요.',
      '진장 1T, 진간장 2T, 맛술 1T, 고춧가루 2T, 설탕 2T, 참치액 2T, 다진 마늘 1T, 후추 톡톡 넣고 5분간 끓여주세요.',
      '썬 양파 1/2개, 대파, 청양고추 넣고 20분간 더 끓여주세요.',
      '참치 1캔(160g) 넣어 5분간 더 끓이면 완성!',
    ],
    sourceUrl: 'https://www.instagram.com/enjini_cook/',
  },
  {
    slug: 'witch-soup',
    title: '마녀스프',
    servings: '10인분',
    measurementNote: '계량 기준: g',
    ingredientGroups: [
      {
        title: '재료 준비',
        items: [
          '냉동야채 1.5kg',
          '소 목심 큐브 1kg',
          '다이스 베이컨 250g',
          '토마토 퓨레 1개',
        ],
      },
      {
        title: '양념',
        items: [
          '치킨스톡 30g',
          '훈제 파프리카 파우더 5g',
          '크러쉬드 페퍼 5g',
          '소금, 후추 약간',
        ],
      },
      {
        title: '마무리',
        items: ['바질 40g'],
      },
    ],
    steps: [
      '바질만 빼고 모든 재료를 냄비에 넣고 끓입니다.',
      '중불에서 보글보글 끓어오르면 한 번 저어줍니다.',
      '인덕션 2~3단의 아주 약한 불로 2시간 정도 천천히 익힙니다.',
      '코팅 냄비가 아니면 바닥이 눌어붙을 수 있어 10분에 한 번씩 저어줍니다.',
      '불을 끄고 바질 잎을 따서 넣고 섞으면 완성입니다.',
    ],
  },
  {
    slug: 'gim-guksu',
    title: '김국수',
    servings: '소면 150g 기준',
    measurementNote: '계량 기준: 밥숟가락(T)',
    ingredientGroups: [
      {
        title: '육수',
        items: [
          '김 3봉지',
          '고춧가루 1T',
          '국간장 0.5T',
          '참치액 1T',
          '맛술 1T',
          '다진 마늘 0.5T',
          '대파 1/2대',
          '물 800ml',
        ],
      },
      {
        title: '면·마무리',
        items: ['소면 150g', '계란 2개', '참기름 1T', '깨'],
      },
    ],
    steps: [
      '냄비에 물 800ml, 김, 양념, 대파를 전부 넣고 끓입니다.',
      '팔팔 끓으면 소면 150g을 바로 넣습니다.',
      '면이 뭉치지 않게 풀어주며 약 3분 끓입니다.',
      '계란 2개를 풀어 넣고, 젓지 않은 채 40초~1분 익힙니다.',
      '참기름 1T와 깨를 뿌리면 완성입니다.',
    ],
    sourceUrl: 'https://www.instagram.com/cook_hoon_/',
  },
]
