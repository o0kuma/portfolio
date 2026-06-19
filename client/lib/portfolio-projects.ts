export interface PortfolioProject {
  slug: string
  title: string
  titleKo: string
  tagline: string
  taglineKo: string
  tags: string[]
  overview: string
  overviewKo: string
  problem: string
  problemKo: string
  solution: string
  solutionKo: string
  features: string[]
  featuresKo: string[]
  techStack: string[]
  metrics?: { label: string; labelKo: string; value: string }[]
  githubUrl?: string
  liveUrl?: string
}

export const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    slug: 'tower-defense',
    title: 'Tower Defense Game',
    titleKo: '타워 디펜스 게임',
    tagline: 'Pure Canvas 2D browser game with wave-based progression',
    taglineKo: '순수 Canvas 2D 브라우저 기반 웨이브 방어 게임',
    tags: ['TypeScript', 'Canvas 2D', 'Next.js', 'Web Audio API'],
    overview: 'A feature-rich tower defense game built entirely with HTML5 Canvas — no external game engines. Players place and upgrade towers to defend against waves of enemies, with a tower fusion system that creates powerful evolved towers.',
    overviewKo: 'HTML5 Canvas만으로 구현한 풀-피처 타워 디펜스 게임입니다. 외부 게임 엔진 없이 순수 TypeScript로 제작되었으며, 타워 합성 시스템으로 강력한 진화 타워를 만들 수 있습니다.',
    problem: 'Browser games typically depend on heavy engines like Phaser or Unity WebGL. I wanted to prove that a polished, feature-complete game is achievable with vanilla Canvas and React state management alone.',
    problemKo: '브라우저 게임은 대부분 Phaser나 Unity WebGL 같은 무거운 엔진에 의존합니다. 순수 Canvas와 React 상태 관리만으로도 완성도 높은 게임이 가능하다는 것을 증명하고 싶었습니다.',
    solution: 'Built a custom game loop using requestAnimationFrame with fixed 60fps timestep. Physics, collision, pathfinding (A*), particle systems, and Web Audio oscillator SFX are all handcrafted. State is managed via a React hook wrapping the engine module.',
    solutionKo: 'requestAnimationFrame으로 고정 60fps 게임 루프를 구현하고, A* 경로탐색, 파티클 시스템, Web Audio 오실레이터 효과음까지 모두 직접 제작했습니다. 상태는 엔진 모듈을 감싸는 React 훅으로 관리합니다.',
    features: [
      '6 unique tower types with upgrade paths and 6 evolved fusion towers',
      'Wave system with special events: rush, armored, swarm, elite',
      '6 enemy types including ghost (frost-only damage) and regen (HP regeneration)',
      'Tower fusion system: adjacent max-level towers combine into evolutions',
      'Daily challenge mode with seeded PRNG for reproducible maps',
      'Web Audio API oscillator SFX and particle-based visual effects',
      'Global leaderboard with PostgreSQL persistence',
      'Achievement system with 11 achievements tracked in localStorage',
    ],
    featuresKo: [
      '6종 타워 + 업그레이드 경로 + 합성 진화 타워 6종',
      '러시·장갑·스웜·엘리트 특수 이벤트 웨이브',
      '유령(냉기 전용), 재생(HP 회복) 포함 6종 적 유닛',
      '인접 최대 레벨 타워 합성 시스템',
      '시드 기반 PRNG 일일 챌린지 모드',
      'Web Audio API 효과음 및 파티클 시각 효과',
      'PostgreSQL 기반 글로벌 리더보드',
      'localStorage 기반 11개 업적 시스템',
    ],
    techStack: ['TypeScript', 'Next.js 15', 'Canvas 2D', 'Web Audio API', 'PostgreSQL', 'Neon', 'Framer Motion', 'Tailwind CSS'],
    metrics: [
      { label: 'Tower Types', labelKo: '타워 종류', value: '12' },
      { label: 'Wave Events', labelKo: '웨이브 이벤트', value: '4' },
      { label: 'Achievements', labelKo: '업적', value: '11' },
      { label: 'Zero Dependencies', labelKo: '게임 엔진 의존 없음', value: '0 engines' },
    ],
  },
  {
    slug: 'portfolio',
    title: 'Developer Portfolio',
    titleKo: '개발자 포트폴리오',
    tagline: 'Full-stack Next.js 15 portfolio with AI integration and mini-games',
    taglineKo: 'AI 통합 및 미니게임이 포함된 풀스택 Next.js 15 포트폴리오',
    tags: ['Next.js 15', 'React 19', 'TypeScript', 'AI', 'PostgreSQL'],
    overview: 'This very site — a modern developer portfolio built with Next.js 15 App Router. Features an AI assistant powered by Claude, interactive mini-games, a blog with markdown support, and bilingual (Korean/English) content throughout.',
    overviewKo: '바로 이 사이트입니다. Next.js 15 App Router로 구축한 현대적인 개발자 포트폴리오로, Claude AI 어시스턴트, 인터랙티브 미니게임, 마크다운 블로그, 한/영 이중 언어를 제공합니다.',
    problem: 'Most portfolios are static sites that showcase work without demonstrating technical capability. I wanted a portfolio that itself proves full-stack skills: server components, streaming AI, real-time games, and production infrastructure.',
    problemKo: '대부분의 포트폴리오는 역량을 보여주지 못하는 정적 사이트에 그칩니다. 서버 컴포넌트, AI 스트리밍, 실시간 게임, 프로덕션 인프라 등 풀스택 실력 자체를 증명하는 포트폴리오를 원했습니다.',
    solution: 'Built with Next.js 15 App Router using server components for data fetching, Streaming UI for AI responses, and Edge Runtime for OG images. PostgreSQL on Neon powers leaderboards. Games run in pure Canvas. CI/CD via GitHub Actions.',
    solutionKo: 'Next.js 15 App Router 서버 컴포넌트로 데이터 패칭, AI 응답 스트리밍 UI, OG 이미지 Edge Runtime을 구현했습니다. Neon PostgreSQL이 리더보드를 담당하고, 게임은 순수 Canvas로 동작합니다.',
    features: [
      'Claude AI assistant with streaming responses and usage quota',
      'Three browser games: Tower Defense, Survive, Tetris',
      'Markdown blog with syntax highlighting and auto-generated posts via cron',
      'Bilingual i18n system (Korean/English) throughout',
      'OG image generation at Edge Runtime for social sharing',
      'Global leaderboards backed by PostgreSQL (Neon)',
      'GitHub Actions CI: TypeScript check + build + Vitest',
      'Dark-themed design system with 12+ reusable UI components',
    ],
    featuresKo: [
      'Claude AI 어시스턴트 (스트리밍, 사용량 제한)',
      '타워 디펜스·서바이브·테트리스 3종 브라우저 게임',
      '마크다운 블로그 + 신택스 하이라이팅 + 크론 자동 포스팅',
      '전체 한/영 이중 언어 i18n',
      'Edge Runtime OG 이미지 생성',
      'Neon PostgreSQL 글로벌 리더보드',
      'GitHub Actions CI (tsc + build + Vitest)',
      '12+ 재사용 가능한 UI 컴포넌트 다크 디자인 시스템',
    ],
    techStack: ['Next.js 15', 'React 19', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Anthropic Claude', 'PostgreSQL', 'Neon', 'Vitest', 'GitHub Actions'],
    metrics: [
      { label: 'UI Components', labelKo: 'UI 컴포넌트', value: '12+' },
      { label: 'Mini-Games', labelKo: '미니게임', value: '3' },
      { label: 'Test Coverage', labelKo: '테스트', value: '18 tests' },
      { label: 'Languages', labelKo: '지원 언어', value: 'KO / EN' },
    ],
    liveUrl: '/',
  },
  {
    slug: 'survive-game',
    title: 'Survive — Arena Shooter',
    titleKo: '서바이브 — 아레나 슈터',
    tagline: 'Top-down bullet-hell survival game with wave-based enemy spawning',
    taglineKo: '웨이브 방식 적 스폰의 탑다운 불릿헬 생존 게임',
    tags: ['TypeScript', 'Canvas 2D', 'Web Audio API', 'Particle Systems'],
    overview: 'A top-down arena survival game where you dodge and shoot enemies across escalating waves. Features handcrafted particle effects, dynamic difficulty scaling, and Web Audio synthesized SFX — all in under 1000 lines of TypeScript.',
    overviewKo: '점점 강해지는 웨이브를 피하고 쏘아내는 탑다운 아레나 생존 게임입니다. 파티클 효과, 동적 난이도 조절, Web Audio 합성 효과음이 모두 1000줄 미만의 TypeScript로 구현되어 있습니다.',
    problem: 'Canvas game development often leads to spaghetti code as complexity grows. I wanted to explore how a clean, modular architecture could support a real-time arcade game without becoming unmaintainable.',
    problemKo: 'Canvas 게임 개발은 복잡해질수록 스파게티 코드가 되기 쉽습니다. 실시간 아케이드 게임을 깔끔하고 모듈화된 구조로 유지하는 방법을 탐구하고 싶었습니다.',
    solution: 'Separated concerns into update/render phases with immutable entity arrays. Each frame: process input → update physics → resolve collisions → spawn particles → render. Web Audio oscillators handle SFX without audio file loading.',
    solutionKo: '업데이트/렌더 단계를 불변 엔티티 배열로 분리했습니다. 매 프레임: 입력 처리 → 물리 업데이트 → 충돌 해결 → 파티클 생성 → 렌더. Web Audio 오실레이터로 파일 없이 효과음을 처리합니다.',
    features: [
      'Real-time top-down movement with WASD + mouse aim',
      'Escalating enemy waves with boss encounters',
      'Particle explosion and trail visual effects',
      'Web Audio API synthesized sound effects',
      'Global high-score leaderboard',
      'Responsive canvas scaling for all screen sizes',
    ],
    featuresKo: [
      'WASD + 마우스 조준 실시간 탑다운 이동',
      '보스 포함 점진적 적 웨이브',
      '파티클 폭발·궤적 시각 효과',
      'Web Audio API 합성 효과음',
      '글로벌 최고점수 리더보드',
      '모든 화면 크기 반응형 캔버스',
    ],
    techStack: ['TypeScript', 'Canvas 2D', 'Web Audio API', 'Next.js', 'PostgreSQL'],
    metrics: [
      { label: 'Enemy Types', labelKo: '적 유닛 종류', value: '5+' },
      { label: 'Bundle Size', labelKo: '번들 크기', value: '<5KB' },
      { label: 'Audio Files', labelKo: '오디오 파일', value: '0' },
    ],
  },
  {
    slug: 'tetris',
    title: 'Tetris — Classic Reimagined',
    titleKo: '테트리스 — 클래식 재현',
    tagline: 'Faithful Tetris implementation with ghost piece, hold queue, and leaderboard',
    taglineKo: '고스트 피스·홀드·리더보드를 갖춘 클래식 테트리스 구현',
    tags: ['TypeScript', 'Canvas 2D', 'Next.js', 'Game Logic'],
    overview: 'A faithful, feature-complete Tetris implementation rendered on HTML5 Canvas. Includes ghost piece preview, hold queue, next-piece preview, progressive speed increase, and a global leaderboard backed by PostgreSQL.',
    overviewKo: 'HTML5 Canvas로 구현한 완성도 높은 테트리스입니다. 고스트 피스, 홀드 큐, 다음 피스 미리보기, 점진적 속도 증가, PostgreSQL 글로벌 리더보드를 포함합니다.',
    problem: 'Tetris seems simple but has many subtle rules: wall kicks (SRS), T-spin detection, lock delay, and precise timing that makes it feel responsive. Implementing these correctly without a framework is a real challenge.',
    problemKo: '테트리스는 간단해 보이지만 Wall Kick(SRS), T-스핀 감지, 락 딜레이 등 섬세한 규칙이 많습니다. 프레임워크 없이 이를 정확히 구현하는 것은 상당한 도전입니다.',
    solution: 'Implemented the official Tetris Guideline rotation system (SRS) with wall kicks. Separate game-state machine handles phases: spawning, falling, locking, line-clearing animation, and game-over. Canvas layers for background, board, and active piece.',
    solutionKo: 'Wall Kick이 포함된 공식 테트리스 가이드라인 회전 시스템(SRS)을 구현했습니다. 스폰·낙하·락·라인 클리어·게임오버 단계를 별도의 상태 머신으로 처리하고, 배경·보드·활성 피스를 Canvas 레이어로 분리했습니다.',
    features: [
      'SRS rotation system with wall kicks',
      'Ghost piece, hold queue, next-piece preview',
      'Progressive speed scaling (level 1-20)',
      'Line-clear animation with flash effect',
      'Global leaderboard with name entry',
      'Keyboard and touch controls',
    ],
    featuresKo: [
      'Wall Kick 포함 SRS 회전 시스템',
      '고스트 피스·홀드 큐·다음 피스 미리보기',
      '레벨 1-20 점진적 속도 증가',
      '플래시 효과 라인 클리어 애니메이션',
      '이름 입력 글로벌 리더보드',
      '키보드 및 터치 컨트롤',
    ],
    techStack: ['TypeScript', 'Canvas 2D', 'Next.js', 'PostgreSQL', 'Tailwind CSS'],
    metrics: [
      { label: 'Tetromino Types', labelKo: '테트로미노 종류', value: '7' },
      { label: 'Max Level', labelKo: '최대 레벨', value: '20' },
      { label: 'Rotation States', labelKo: '회전 상태', value: '4×7' },
    ],
  },
]

export function getProject(slug: string): PortfolioProject | undefined {
  return PORTFOLIO_PROJECTS.find(p => p.slug === slug)
}
