/**
 * Inserts several portfolio-themed posts (Next.js, R3F, API, UX, etc.).
 * Requires DATABASE_URL in server/.env (same as Neon pool used by the API).
 *
 * Usage (from repo root):
 *   node server/scripts/seed-portfolio-posts.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })

const supabaseService = require('../services/supabaseService')

const POSTS = [
  {
    title: '몰입형 포트폴리오: Next.js와 React Three Fiber로 히어로 씬 만들기',
    content: `# 몰입형 포트폴리오

이 사이트의 첫 화면은 **단순한 정적 배너가 아니라**, WebGL 기반의 작은 씬으로 구성했습니다.

## 왜 R3F인가

- React 컴포넌트 트리 안에서 Three.js를 선언적으로 다룰 수 있음
- 카메라·라이트·메시를 코드로 반복 조정하기 쉬움
- 스크롤/리사이즈에 맞춰 반응형으로 비율 유지

## 실무에서 신경 쓴 점

1. **번들 크기**: 히어로에만 쓰이도록 클라이언트 컴포넌트로 격리
2. **성능**: 불필요한 리렌더와 geometry 재생성 최소화
3. **접근성**: WebGL 위에 타이포·네비는 DOM 레이어로 유지

앞으로는 ScrollControls나 카메라 패스로 블로그 카드 전환까지 연결해 볼 계획입니다.`,
    author: 'iykyk',
    category: 'tech',
    tags: ['Next.js', 'React Three Fiber', 'Three.js', 'WebGL', '포트폴리오'],
    featured: true,
  },
  {
    title: 'Express + Neon(PostgreSQL): 블로그·프로젝트 API 한 레이어로',
    content: `# API 레이어

백엔드는 Express로 REST 엔드포인트를 제공하고, 데이터는 **Neon의 PostgreSQL**에 연결합니다.

## 구조

- \`/api/posts\` — 목록·상세·댓글·좋아요
- \`/api/projects\` — 프로젝트 쇼케이스
- 동일한 \`pg\` Pool을 서비스 클래스에서 재사용

## 왜 SQL인가

문서형 DB도 좋지만, 관계형 스키마로 **포스트·댓글·조회수**를 명확히 나누기 쉽고, 운영 쿼리·백업 패턴도 익숙합니다.

마이그레이션과 시드 스크립트는 \`server/scripts\`에서 관리합니다.`,
    author: 'iykyk',
    category: 'tech',
    tags: ['Express', 'PostgreSQL', 'Neon', 'REST API', 'Node.js'],
    featured: false,
  },
  {
    title: '글래스모피즘과 토큰: 다크 기본 테마에서 컴포넌트 통일하기',
    content: `# UI 일관성

홈의 블로그 리스트는 **어두운 시네마틱 톤**, 노이즈 그레인, 모노 레일 네비게이션을 맞췄습니다.

## CSS 변수

- 배경·테두리·글래스 패널을 CSS 변수로 정의
- Tailwind 유틸과 병행해 한 번에 테마 전환 가능하도록 설계

## 목표

Active Theory 같은 레퍼런스는 **과시가 아니라 읽기 피로를 줄이는 대비**에 가깝습니다. 카드 위 타이포와 메타 정보의 위계를 유지하는 것이 핵심입니다.`,
    author: 'iykyk',
    category: 'project',
    tags: ['Tailwind CSS', '디자인 시스템', '다크 모드', 'UX'],
    featured: true,
  },
  {
    title: '프런트와 백엔드 연결: 환경 변수와 CORS 체크리스트',
    content: `# 배포 전에 확인할 것

1. \`NEXT_PUBLIC_API_URL\` — 클라이언트가 바라보는 API 베이스 URL
2. 서버 \`CORS\` — 프로덕션 도메인 허용 목록
3. \`DATABASE_URL\` — SSL 옵션 포함 여부

로컬에서는 localhost 끼리 맞추고, 스테이징·프로덕션에서는 각각 분리된 값을 씁니다. 비밀키는 절대 클라이언트 번들에 넣지 않습니다.`,
    author: 'iykyk',
    category: 'update',
    tags: ['환경 변수', 'CORS', '배포', '보안'],
    featured: false,
  },
  {
    title: '블로그에 광고 슬롯 넣기: 본문 흐름을 해치지 않는 배치',
    content: `# 인아티클 광고

포스트 상세에서는 상·하 배너와 본문 단락 사이 삽입을 지원합니다.

## 원칙

- 카테고리·태그와 관련 있는 슬롯만 노출
- 레이아웃 시프트 줄이기
- 읽는 리듬을 끊지 않는 빈도

수익화와 사용자 경험 사이에서 **기본값은 보수적으로** 잡는 편이 좋습니다.`,
    author: 'iykyk',
    category: 'project',
    tags: ['광고', '레이아웃', '모네타이제이션'],
    featured: false,
  },
  {
    title: 'Stripe 구독 페이지와 서버 검증: 결제는 신뢰의 경계',
    content: `# 구독 플로

클라이언트에서는 Stripe Checkout으로 넘기고, 서버에서는 웹훅과 세션 검증으로 **권한을 확정**합니다.

## 교훈

- 결제 성공 여부를 클라이언트만 믿지 않음
- 사용량·플랜 상태는 서버가 단일 소스로 유지

포트폴리오 프로젝트에서도 실제 결제 대신 테스트 키로 동선을 검증해 두었습니다.`,
    author: 'iykyk',
    category: 'tech',
    tags: ['Stripe', '결제', '구독', '보안'],
    featured: false,
  },
]

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL이 설정되어 있지 않습니다. server/.env를 확인하세요.')
    process.exit(1)
  }

  console.log(`Seeding ${POSTS.length} posts…`)

  for (const post of POSTS) {
    try {
      const row = await supabaseService.createPost({
        ...post,
        status: 'published',
      })
      console.log('✓', row.title, `(${row.id})`)
    } catch (err) {
      console.error('✗', post.title, err.message)
    }
  }

  console.log('Done.')
  process.exit(0)
}

main()
