/**
 * seed-blog-posts.js
 * Inserts rich, diverse blog posts into the Neon PostgreSQL database.
 * Reads DATABASE_URL from server/.env
 *
 * Usage (from repo root):
 *   node server/scripts/seed-blog-posts.js
 *
 * Safe to re-run: uses ON CONFLICT DO NOTHING based on unique title.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL이 설정되지 않았습니다. server/.env를 확인하세요.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ---------------------------------------------------------------------------
// Post data — 15+ posts across 5 categories
// ---------------------------------------------------------------------------
const POSTS = [
  // ──────────────────────────────────────────────────────────── TECH (7개)
  {
    title: 'Next.js 14 App Router 완전 정복: 서버 컴포넌트부터 스트리밍까지',
    category: 'tech',
    featured: true,
    tags: ['Next.js', 'App Router', 'React Server Components', 'Streaming', 'TypeScript'],
    content: `# Next.js 14 App Router 완전 정복

Next.js 14가 출시되면서 **App Router**가 Pages Router를 완전히 대체하는 기본 라우팅 방식으로 자리잡았습니다. 이 글에서는 실무에서 직접 겪은 경험을 바탕으로 App Router의 핵심 개념과 실전 팁을 정리합니다.

## 서버 컴포넌트(RSC)란 무엇인가

React Server Components는 **서버에서만 렌더링되고 클라이언트로 JS 번들이 전송되지 않는** 컴포넌트입니다. 데이터베이스 쿼리, 파일 시스템 접근, 서드파티 API 호출을 컴포넌트 내부에서 직접 할 수 있어 네트워크 폭포(waterfall)를 대폭 줄일 수 있습니다.

\`\`\`tsx
// app/blog/page.tsx — 서버 컴포넌트 (기본값)
async function BlogPage() {
  const posts = await db.query('SELECT * FROM posts ORDER BY created_at DESC');
  
  return (
    <ul>
      {posts.rows.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
\`\`\`

## 클라이언트 컴포넌트가 필요한 경우

- \`useState\`, \`useEffect\` 등 React 훅 사용
- 브라우저 API (window, localStorage) 접근
- 이벤트 핸들러 등록

\`\`\`tsx
'use client'; // 이 지시어가 있어야 클라이언트 컴포넌트

import { useState } from 'react';

export function LikeButton({ postId }: { postId: string }) {
  const [liked, setLiked] = useState(false);
  return (
    <button onClick={() => setLiked(!liked)}>
      {liked ? '❤️' : '🤍'} 좋아요
    </button>
  );
}
\`\`\`

## Streaming과 Suspense

\`\`\`tsx
import { Suspense } from 'react';
import { PostList } from './PostList';

export default function Page() {
  return (
    <main>
      <h1>블로그</h1>
      <Suspense fallback={<p>포스트 불러오는 중...</p>}>
        <PostList />
      </Suspense>
    </main>
  );
}
\`\`\`

Suspense를 사용하면 느린 데이터 fetch가 있는 컴포넌트를 기다리는 동안 **나머지 UI를 먼저 전송**할 수 있어 체감 성능이 크게 개선됩니다.

## 레이아웃과 중첩 라우팅

\`app\` 디렉토리 구조 자체가 라우트 세그먼트를 나타냅니다. \`layout.tsx\`는 해당 세그먼트와 모든 하위 세그먼트에 공유되어, **탐색 시 리렌더 없이 레이아웃을 유지**합니다.

\`\`\`
app/
├── layout.tsx         ← 루트 레이아웃
├── (marketing)/       ← 라우트 그룹 (URL에 영향 없음)
│   ├── about/page.tsx
│   └── contact/page.tsx
└── blog/
    ├── layout.tsx     ← 블로그 레이아웃
    ├── page.tsx       ← /blog
    └── [slug]/
        └── page.tsx   ← /blog/:slug
\`\`\`

## 실무에서 주의할 점

1. **직렬화 가능한 props만** 서버→클라이언트로 전달 가능 (함수 불가)
2. \`'use client'\` 경계 최대한 리프(leaf) 컴포넌트로 밀어내기
3. Route Handler(\`route.ts\`)는 API Routes를 대체하지만, 기존 Express 백엔드가 있다면 프록시 레이어로 활용 가능
4. \`next/cache\`의 \`revalidate\` 태그 기반 캐시 무효화 적극 활용

App Router는 처음에는 낯설지만, 익숙해지면 데이터 페칭 로직이 훨씬 깔끔해집니다.`,
  },
  {
    title: 'TypeScript 5.x 실전 패턴: 제네릭, 조건부 타입, satisfies 연산자',
    category: 'tech',
    featured: false,
    tags: ['TypeScript', '제네릭', '타입스크립트', '타입 시스템', '실무'],
    content: `# TypeScript 5.x 실전 패턴

TypeScript는 매 버전마다 타입 시스템을 강화하고 있습니다. 5.x 시리즈에서 특히 유용한 기능들을 실무 코드와 함께 살펴봅니다.

## satisfies 연산자

\`satisfies\`는 타입 검사를 수행하면서도 **추론된 타입을 유지**합니다. \`as\`와 달리 타입 안전성을 잃지 않습니다.

\`\`\`typescript
type Config = {
  [key: string]: string | number;
};

// ❌ 이전 방식 — palette.red의 타입이 string | number
const palette: Config = {
  red: '#ff0000',
  blue: '#0000ff',
  green: 3,
};

// ✅ satisfies — 각 값의 실제 타입 유지
const palette = {
  red: '#ff0000',
  blue: '#0000ff',
  green: 3,
} satisfies Config;

palette.red.toUpperCase(); // OK — string으로 추론됨
\`\`\`

## 제네릭 제약과 조건부 타입 조합

\`\`\`typescript
type IsArray<T> = T extends any[] ? true : false;
type Flatten<T> = T extends (infer U)[] ? U : T;

// API 응답을 타입 안전하게 처리
type ApiResponse<T> = {
  data: T;
  meta: {
    total: IsArray<T> extends true ? number : never;
    page:  IsArray<T> extends true ? number : never;
  };
};

async function fetchList<T>(): Promise<ApiResponse<T[]>> {
  // ...
}
\`\`\`

## Template Literal Types

\`\`\`typescript
type EventName = 'click' | 'focus' | 'blur';
type Handler = \`on\${Capitalize<EventName>}\`; // "onClick" | "onFocus" | "onBlur"

type CSSProperty = 'margin' | 'padding';
type Direction = 'Top' | 'Right' | 'Bottom' | 'Left';
type CSSShorthand = \`\${CSSProperty}\${Direction}\`; // "marginTop" | "marginRight" | ...
\`\`\`

## infer와 재귀 타입

\`\`\`typescript
// 중첩 Promise 펼치기
type Awaited<T> = T extends Promise<infer U> ? Awaited<U> : T;

// 튜플의 마지막 원소
type Last<T extends any[]> = T extends [...any[], infer L] ? L : never;
type Result = Last<[1, 2, 3]>; // 3
\`\`\`

## 실무 팁

1. **\`unknown\` vs \`any\`**: 외부 데이터는 항상 \`unknown\`으로 받고 타입 가드로 좁히기
2. **브랜드 타입**: \`UserId\`와 \`PostId\`처럼 동형 타입을 구분해 실수 방지
3. **strict 모드 필수**: \`tsconfig.json\`에서 \`"strict": true\` 반드시 켜기
4. **타입 유틸리티 라이브러리**: \`type-fest\`, \`ts-reset\` 같은 라이브러리 적극 활용

TypeScript를 잘 사용하면 런타임 에러의 상당 부분을 컴파일 타임에 잡을 수 있습니다.`,
  },
  {
    title: 'Node.js 퍼포먼스 튜닝: 이벤트 루프 블로킹부터 클러스터링까지',
    category: 'tech',
    featured: false,
    tags: ['Node.js', '성능 최적화', '이벤트 루프', 'Cluster', 'Worker Threads'],
    content: `# Node.js 퍼포먼스 튜닝

Node.js 서버가 느려졌을 때 어디서부터 시작해야 할지 막막한 경험, 다들 있으실 겁니다. 이 글에서는 실제로 효과가 있었던 성능 개선 방법들을 체계적으로 정리합니다.

## 이벤트 루프를 이해하라

Node.js는 **단일 스레드**에서 이벤트 루프로 비동기 I/O를 처리합니다. 이벤트 루프가 블로킹되면 전체 서버가 멈춥니다.

\`\`\`javascript
// ❌ 이벤트 루프 블로킹 예시
app.get('/slow', (req, res) => {
  // 동기적으로 100만 번 반복 — 이 동안 다른 요청 처리 불가
  let sum = 0;
  for (let i = 0; i < 1_000_000; i++) sum += i;
  res.json({ sum });
});

// ✅ Worker Thread로 CPU 집약적 작업 분리
const { Worker } = require('worker_threads');

app.get('/fast', (req, res) => {
  const worker = new Worker('./heavy-calc.js');
  worker.on('message', result => res.json(result));
  worker.postMessage({ n: 1_000_000 });
});
\`\`\`

## async/await 함정

\`\`\`javascript
// ❌ 순차 실행 — 총 300ms 소요
async function fetchUserData(userId) {
  const user    = await getUser(userId);      // 100ms
  const posts   = await getUserPosts(userId); // 100ms
  const friends = await getFriends(userId);   // 100ms
  return { user, posts, friends };
}

// ✅ 병렬 실행 — 총 100ms 소요
async function fetchUserData(userId) {
  const [user, posts, friends] = await Promise.all([
    getUser(userId),
    getUserPosts(userId),
    getFriends(userId),
  ]);
  return { user, posts, friends };
}
\`\`\`

## 클러스터링으로 멀티코어 활용

\`\`\`javascript
const cluster = require('cluster');
const os = require('os');

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  console.log(\`Primary \${process.pid}: spawning \${numCPUs} workers\`);
  
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker, code) => {
    console.log(\`Worker \${worker.process.pid} died — forking replacement\`);
    cluster.fork();
  });
} else {
  require('./app'); // Express 앱 시작
  console.log(\`Worker \${process.pid} started\`);
}
\`\`\`

## 메모리 누수 찾기

\`\`\`bash
# V8 힙 스냅샷 수집
node --inspect app.js
# Chrome DevTools → Memory → Take Heap Snapshot
\`\`\`

흔한 메모리 누수 패턴:
- 전역 배열/맵에 계속 추가만 하고 삭제하지 않음
- 이벤트 리스너를 등록 후 제거하지 않음 (\`removeListener\` 누락)
- 클로저가 큰 객체를 캡처한 채 오래 살아있음

## 실전 성능 체크리스트

- [ ] HTTP 응답 압축 (\`compression\` 미들웨어)
- [ ] 정적 파일 캐시 헤더 설정
- [ ] DB 커넥션 풀 크기 적절히 설정 (기본값 10은 대부분 부족)
- [ ] slow query 로깅으로 N+1 문제 감지
- [ ] \`clinic.js\` 또는 \`0x\`로 플레임그래프 분석`,
  },
  {
    title: 'WebGL과 Three.js로 인터랙티브 포트폴리오 만들기',
    category: 'tech',
    featured: false,
    tags: ['WebGL', 'Three.js', 'React Three Fiber', '3D 그래픽', '포트폴리오'],
    content: `# WebGL과 Three.js로 인터랙티브 포트폴리오 만들기

요즘 개발자 포트폴리오는 단순한 정적 페이지를 넘어 몰입감 있는 3D 경험을 제공하는 방향으로 진화하고 있습니다. Three.js와 React Three Fiber를 사용해서 실제로 구현한 경험을 공유합니다.

## Three.js 기본 구조

\`\`\`javascript
import * as THREE from 'three';

// 씬, 카메라, 렌더러 — 3D 세계의 3요소
const scene    = new THREE.Scene();
const camera   = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 기본 메시 생성
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x6366f1 });
const cube     = new THREE.Mesh(geometry, material);
scene.add(cube);

// 조명 추가
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

camera.position.z = 3;

// 애니메이션 루프
function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();
\`\`\`

## React Three Fiber로 선언적 3D

\`\`\`tsx
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';

function RotatingCube() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta;
      meshRef.current.rotation.y += delta * 0.5;
    }
  });
  
  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#6366f1" />
    </mesh>
  );
}

export function HeroScene() {
  return (
    <Canvas camera={{ position: [0, 0, 3] }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} />
      <RotatingCube />
    </Canvas>
  );
}
\`\`\`

## 파티클 시스템으로 배경 연출

\`\`\`tsx
import { useMemo } from 'react';
import * as THREE from 'three';

function StarField({ count = 5000 }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      arr[i] = (Math.random() - 0.5) * 100;
    }
    return arr;
  }, [count]);
  
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.1} color="#ffffff" />
    </points>
  );
}
\`\`\`

## 성능 최적화 포인트

1. **geometry 재사용**: 같은 형태의 객체는 하나의 geometry 인스턴스 공유
2. **instanced mesh**: 수백 개 이상의 동일 객체는 \`InstancedMesh\` 사용
3. **텍스처 압축**: KTX2/Basis Universal 포맷 사용
4. **LOD(Level of Detail)**: 거리에 따라 폴리곤 수 줄이기
5. **frustum culling**: Three.js 기본 제공, 카메라 밖 객체 자동 제외

3D 포트폴리오는 처음에는 복잡해 보이지만, R3F 덕분에 React 개발자라면 비교적 빠르게 진입할 수 있습니다.`,
  },
  {
    title: 'GitHub Actions로 풀스택 앱 CI/CD 파이프라인 구축하기',
    category: 'tech',
    featured: false,
    tags: ['GitHub Actions', 'CI/CD', 'Docker', '배포 자동화', 'DevOps'],
    content: `# GitHub Actions로 풀스택 앱 CI/CD 파이프라인 구축하기

코드를 push할 때마다 자동으로 테스트, 빌드, 배포가 이루어지는 파이프라인은 더 이상 대기업만의 전유물이 아닙니다. GitHub Actions를 활용해 개인 프로젝트에도 프로덕션급 CI/CD를 구현하는 방법을 소개합니다.

## 기본 워크플로우 구조

\`\`\`yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: testdb
        ports: ['5432:5432']
        options: --health-cmd pg_isready --health-interval 10s
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/testdb
        run: npm test
      
      - name: Build
        run: npm run build
\`\`\`

## 환경별 배포 전략

\`\`\`yaml
  deploy-staging:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    
    steps:
      - name: Deploy to Staging
        uses: appleboy/ssh-action@v1
        with:
          host: \${{ secrets.STAGING_HOST }}
          username: \${{ secrets.STAGING_USER }}
          key: \${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /app
            git pull origin develop
            npm ci --production
            pm2 restart app

  deploy-prod:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production   # 수동 승인 게이트
    
    steps:
      - name: Deploy to Production
        run: echo "프로덕션 배포 실행"
\`\`\`

## Docker 빌드 & 레지스트리 푸시

\`\`\`yaml
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Login to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}
      
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          push: true
          tags: ghcr.io/\${{ github.repository }}:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max
\`\`\`

## 알림 연동

\`\`\`yaml
      - name: Notify Slack on failure
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "❌ 배포 실패: \${{ github.repository }} @ \${{ github.sha }}"
            }
        env:
          SLACK_WEBHOOK_URL: \${{ secrets.SLACK_WEBHOOK }}
\`\`\`

## 팁: 캐시로 속도 높이기

- **Node modules**: \`actions/cache\`로 \`node_modules\` 캐시
- **Docker 레이어**: BuildKit + \`type=gha\` 캐시로 빌드 시간 70% 단축
- **테스트 병렬화**: \`matrix\` 전략으로 여러 Node 버전 동시 테스트

파이프라인을 갖추면 "내 로컬에서는 되는데?" 문제가 현저히 줄어들고, 배포에 대한 심리적 부담도 훨씬 낮아집니다.`,
  },
  {
    title: 'PostgreSQL 쿼리 최적화: 인덱스 전략부터 EXPLAIN ANALYZE까지',
    category: 'tech',
    featured: false,
    tags: ['PostgreSQL', 'SQL 최적화', '인덱스', 'EXPLAIN', '데이터베이스'],
    content: `# PostgreSQL 쿼리 최적화

"쿼리가 느리다"는 말을 들었을 때 어떻게 대응하시나요? 단순히 인덱스를 추가하거나 캐시를 끼워 넣기 전에, 먼저 PostgreSQL이 실제로 어떻게 쿼리를 실행하는지 이해해야 합니다.

## EXPLAIN ANALYZE로 실행 계획 읽기

\`\`\`sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT p.title, COUNT(c.id) AS comment_count
FROM posts p
LEFT JOIN comments c ON c.post_id = p.id
WHERE p.category = 'tech'
  AND p.created_at > NOW() - INTERVAL '30 days'
GROUP BY p.id
ORDER BY comment_count DESC
LIMIT 20;
\`\`\`

결과에서 주목할 것들:
- **Seq Scan vs Index Scan**: Seq Scan이 나오면 인덱스 후보
- **actual rows vs estimated rows**: 차이가 크면 \`ANALYZE\` 실행 필요
- **Buffers**: hit vs read 비율 — hit가 높을수록 캐시 효율적

## 인덱스 전략

\`\`\`sql
-- 단일 컬럼 인덱스
CREATE INDEX idx_posts_category ON posts(category);

-- 복합 인덱스 — 컬럼 순서가 중요!
-- category로 먼저 필터링하고 created_at으로 정렬하는 쿼리에 최적
CREATE INDEX idx_posts_category_date ON posts(category, created_at DESC);

-- 부분 인덱스 — published 포스트만 인덱싱
CREATE INDEX idx_posts_published ON posts(created_at DESC)
WHERE status = 'published';

-- GIN 인덱스 — 배열/JSON/전문 검색
CREATE INDEX idx_posts_tags ON posts USING GIN(tags);
-- 태그 검색: WHERE 'TypeScript' = ANY(tags)
\`\`\`

## N+1 문제 해결

\`\`\`sql
-- ❌ N+1: 포스트마다 댓글 수를 따로 쿼리
-- ✅ 한 번의 쿼리로 해결

SELECT
  p.*,
  COALESCE(c.count, 0) AS comment_count
FROM posts p
LEFT JOIN (
  SELECT post_id, COUNT(*) AS count
  FROM comments
  GROUP BY post_id
) c ON c.post_id = p.id;
\`\`\`

## 커넥션 풀 설정

\`\`\`javascript
// pg Pool 설정 — 기본값(10)은 대부분 부족
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,              // 최대 커넥션
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 2_000,
});
\`\`\`

## 자주 쓰는 진단 쿼리

\`\`\`sql
-- 슬로우 쿼리 TOP 10
SELECT query, calls, mean_exec_time, total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- 사용되지 않는 인덱스 찾기
SELECT indexrelname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0;

-- 테이블 크기
SELECT relname, pg_size_pretty(pg_total_relation_size(relid))
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(relid) DESC;
\`\`\`

최적화는 항상 **측정 → 분석 → 개선 → 재측정** 순서로 진행하세요. 감으로 인덱스를 추가하면 오히려 쓰기 성능이 저하될 수 있습니다.`,
  },
  {
    title: '알고리즘 문제 풀이 전략: 코딩 테스트부터 시스템 설계까지',
    category: 'tech',
    featured: false,
    tags: ['알고리즘', '코딩테스트', '자료구조', '시스템 설계', '취업준비'],
    content: `# 알고리즘 문제 풀이 전략

코딩 테스트와 기술 면접을 준비하면서 쌓은 전략을 공유합니다. 단순히 문제를 많이 푸는 것보다 **올바른 사고 프레임**을 갖추는 것이 훨씬 중요합니다.

## 문제 접근 프레임워크

1. **문제 이해** (5분): 입출력 예제를 직접 손으로 따라가보기
2. **엣지 케이스** 파악: 빈 배열, 음수, 중복, 최대값
3. **브루트포스** 먼저 설계: O(n²)이라도 일단 동작하는 것부터
4. **최적화**: 병목 찾기 → 적절한 자료구조 선택
5. **구현 및 테스트**: 복잡한 로직은 헬퍼 함수로 분리

## 슬라이딩 윈도우 패턴

\`\`\`javascript
// 길이 k인 연속 부분배열의 최대 합
function maxSubarraySum(arr, k) {
  let windowSum = arr.slice(0, k).reduce((a, b) => a + b, 0);
  let maxSum = windowSum;
  
  for (let i = k; i < arr.length; i++) {
    windowSum += arr[i] - arr[i - k];
    maxSum = Math.max(maxSum, windowSum);
  }
  
  return maxSum;
}
\`\`\`

## 투 포인터 패턴

\`\`\`javascript
// 정렬된 배열에서 합이 target인 두 수 찾기
function twoSum(nums, target) {
  let left = 0, right = nums.length - 1;
  
  while (left < right) {
    const sum = nums[left] + nums[right];
    if (sum === target)  return [left, right];
    if (sum < target)    left++;
    else                 right--;
  }
  
  return [];
}
\`\`\`

## BFS vs DFS 선택 기준

| 상황 | 추천 |
|------|------|
| 최단 경로 | BFS |
| 연결 컴포넌트 탐색 | DFS |
| 위상 정렬 | DFS |
| 레벨 순서 순회 | BFS |

\`\`\`javascript
// BFS 템플릿
function bfs(graph, start) {
  const visited = new Set([start]);
  const queue = [start];
  
  while (queue.length) {
    const node = queue.shift();
    
    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
}
\`\`\`

## 동적 프로그래밍 접근법

\`\`\`javascript
// 피보나치 — 메모이제이션
function fib(n, memo = {}) {
  if (n <= 1) return n;
  if (memo[n]) return memo[n];
  return memo[n] = fib(n - 1, memo) + fib(n - 2, memo);
}

// LCS(최장 공통 부분수열)
function lcs(s1, s2) {
  const m = s1.length, n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = s1[i-1] === s2[j-1]
        ? dp[i-1][j-1] + 1
        : Math.max(dp[i-1][j], dp[i][j-1]);
    }
  }
  
  return dp[m][n];
}
\`\`\`

## 시간 복잡도 암기 카드

| 자료구조 | 검색 | 삽입 | 삭제 |
|---------|------|------|------|
| 배열 | O(n) | O(n) | O(n) |
| 해시맵 | O(1) | O(1) | O(1) |
| BST | O(log n) | O(log n) | O(log n) |
| 힙 | O(n) | O(log n) | O(log n) |

꾸준한 연습이 중요하지만, 같은 문제 유형이 반복된다는 것을 알면 훨씬 효율적으로 준비할 수 있습니다.`,
  },

  // ──────────────────────────────────────────────────────── PROJECT (4개)
  {
    title: '포트폴리오 웹사이트 제작기: 기획부터 배포까지 3주의 여정',
    category: 'project',
    featured: true,
    tags: ['포트폴리오', 'Next.js', 'Express', '개발기', '풀스택'],
    content: `# 포트폴리오 웹사이트 제작기

"포트폴리오 사이트 하나쯤은 있어야지"라고 생각한 지 오래됐지만, 번번이 미뤘습니다. 이번에는 작정하고 3주를 투자해 직접 구축했습니다. 기획부터 배포까지 전 과정을 공유합니다.

## 1주차: 기획과 기술 스택 결정

처음엔 단순한 정적 사이트를 생각했지만, 블로그와 프로젝트 관리까지 하려면 CMS나 DB가 필요했습니다.

**최종 스택 결정:**
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express (REST API)
- **Database**: Neon PostgreSQL (서버리스)
- **3D**: React Three Fiber + Three.js
- **배포**: Vercel (클라이언트) + Railway (서버)

기술 스택을 고를 때 가장 중요하게 생각한 것은 **내가 실무에서 쓰는 기술을 보여줄 수 있어야 한다**는 것이었습니다.

## 2주차: 핵심 기능 구현

### DB 스키마 설계

\`\`\`sql
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author VARCHAR(100) NOT NULL,
  category VARCHAR(20),
  tags TEXT[],
  featured BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`

### 하이라이트 기능들
- **WebGL 히어로 씬**: 파티클이 흐르는 3D 배경
- **다크 모드 기본**: 영화적 톤의 UI
- **AI 챗봇**: Gemini API 연동
- **구독/결제**: Stripe 통합

## 3주차: 완성도 높이기

가장 시간이 많이 걸린 건 의외로 **반응형 레이아웃**이었습니다. 3D 캔버스를 모바일에서도 자연스럽게 보이도록 하는 것이 예상보다 까다로웠습니다.

### 성능 최적화
- 이미지 Next.js \`Image\` 컴포넌트로 자동 최적화
- Three.js 코드 lazy import로 초기 번들 분리
- 폰트 \`next/font\`로 FOUC 방지

## 배운 점

1. **완벽주의는 적**: 80% 완성도에서 배포하고 iterate하는 게 낫다
2. **도메인 구매 타이밍**: 사이트 완성 후가 아니라 처음부터 정해두는 것이 동기부여에 도움
3. **모바일 우선**: 데스크탑에서만 테스트하다가 마지막에 모바일 버그를 한꺼번에 잡느라 고생

혹시 포트폴리오 사이트 만들기를 고민 중이라면, 지금 당장 시작하세요. 완벽한 설계를 기다리는 시간이 가장 아깝습니다.`,
  },
  {
    title: '브라우저에서 테트리스 구현하기: 게임 루프, 충돌 감지, 점수 시스템',
    category: 'project',
    featured: false,
    tags: ['테트리스', 'Canvas API', '게임 개발', 'JavaScript', '알고리즘'],
    content: `# 브라우저에서 테트리스 구현하기

"테트리스를 직접 만들어보자"는 생각은 개발자라면 한 번쯤 해봤을 겁니다. Canvas API와 순수 JavaScript로 테트리스를 구현하면서 게임 개발의 핵심 개념들을 배울 수 있었습니다.

## 게임 보드 표현

\`\`\`javascript
const ROWS = 20;
const COLS = 10;

// 2D 배열로 보드 표현 (0: 빈칸, 1+: 블록 색상 인덱스)
function createBoard() {
  return Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
}
\`\`\`

## 테트로미노 정의

\`\`\`javascript
const TETROMINOES = {
  I: { shape: [[1,1,1,1]], color: '#00f0f0' },
  O: { shape: [[1,1],[1,1]], color: '#f0f000' },
  T: { shape: [[0,1,0],[1,1,1]], color: '#a000f0' },
  S: { shape: [[0,1,1],[1,1,0]], color: '#00f000' },
  Z: { shape: [[1,1,0],[0,1,1]], color: '#f00000' },
  J: { shape: [[1,0,0],[1,1,1]], color: '#0000f0' },
  L: { shape: [[0,0,1],[1,1,1]], color: '#f0a000' },
};
\`\`\`

## 게임 루프

\`\`\`javascript
class TetrisGame {
  constructor(canvas) {
    this.ctx = canvas.getContext('2d');
    this.board = createBoard();
    this.dropInterval = 1000; // 1초마다 블록 낙하
    this.lastTime = 0;
    this.dropCounter = 0;
  }
  
  update(timestamp) {
    const delta = timestamp - this.lastTime;
    this.lastTime = timestamp;
    this.dropCounter += delta;
    
    if (this.dropCounter >= this.dropInterval) {
      this.drop();
      this.dropCounter = 0;
    }
    
    this.draw();
    requestAnimationFrame(ts => this.update(ts));
  }
  
  drop() {
    this.piece.y++;
    if (this.hasCollision()) {
      this.piece.y--;
      this.lockPiece();
      this.clearLines();
      this.spawnPiece();
    }
  }
}
\`\`\`

## 충돌 감지

\`\`\`javascript
hasCollision() {
  const { shape, x, y } = this.piece;
  
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (!shape[row][col]) continue;
      
      const boardX = x + col;
      const boardY = y + row;
      
      if (
        boardX < 0 || boardX >= COLS ||     // 좌우 벽
        boardY >= ROWS ||                    // 바닥
        (boardY >= 0 && this.board[boardY][boardX]) // 다른 블록
      ) {
        return true;
      }
    }
  }
  return false;
}
\`\`\`

## 라인 클리어와 점수

\`\`\`javascript
clearLines() {
  let linesCleared = 0;
  
  for (let row = ROWS - 1; row >= 0; row--) {
    if (this.board[row].every(cell => cell !== 0)) {
      this.board.splice(row, 1);
      this.board.unshift(new Array(COLS).fill(0));
      linesCleared++;
      row++; // 같은 row 재검사
    }
  }
  
  const POINTS = [0, 100, 300, 500, 800]; // 0~4라인
  this.score += POINTS[linesCleared] * this.level;
  this.lines += linesCleared;
  this.level = Math.floor(this.lines / 10) + 1;
  this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
}
\`\`\`

## 블록 회전

회전은 행렬 전치 + 반전으로 구현합니다:

\`\`\`javascript
function rotate(matrix) {
  // 전치(transpose)
  const transposed = matrix[0].map((_, i) => matrix.map(row => row[i]));
  // 각 행 반전
  return transposed.map(row => row.reverse());
}
\`\`\`

테트리스를 직접 구현하면서 **게임 루프, 충돌 감지, 상태 관리** 등 많은 개념을 배울 수 있었습니다. 단순해 보이는 게임도 내부에는 꽤 흥미로운 로직이 담겨 있습니다.`,
  },
  {
    title: 'Gemini API로 AI 챗봇 구현하기: 대화 컨텍스트와 스트리밍 응답',
    category: 'project',
    featured: false,
    tags: ['AI 챗봇', 'Gemini API', 'LLM', '스트리밍', 'Next.js'],
    content: `# Gemini API로 AI 챗봇 구현하기

포트폴리오 사이트에 AI 챗봇을 붙이면서 얻은 경험을 공유합니다. 단순한 FAQ 봇을 넘어, 실제로 대화가 자연스럽게 이어지는 챗봇을 만들기 위해 고민한 것들을 정리했습니다.

## 왜 Gemini인가

- OpenAI GPT-4 대비 **비용이 저렴**하고 무료 티어가 충분히 넉넉
- OpenAI 호환 REST 엔드포인트 제공 — 기존 코드를 거의 수정 없이 사용 가능
- Gemini 2.5 Flash는 속도/비용/성능 균형이 뛰어남

## 기본 연동

\`\`\`typescript
// app/api/ai/chat/route.ts
export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${process.env.GEMINI_API_KEY}\`,
      },
      body: JSON.stringify({
        model: 'gemini-2.5-flash-preview-05-20',
        messages: [
          {
            role: 'system',
            content: '당신은 iykyk의 포트폴리오 웹사이트 AI 어시스턴트입니다...',
          },
          ...messages,
        ],
        stream: true,
      }),
    }
  );
  
  // 스트리밍 응답을 클라이언트로 그대로 전달
  return new Response(response.body, {
    headers: { 'Content-Type': 'text/event-stream' },
  });
}
\`\`\`

## 클라이언트 스트리밍 처리

\`\`\`typescript
async function sendMessage(userMessage: string) {
  setIsStreaming(true);
  const botMessage = { role: 'assistant', content: '' };
  setMessages(prev => [...prev, botMessage]);
  
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ messages: [...history, { role: 'user', content: userMessage }] }),
  });
  
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\\n').filter(line => line.startsWith('data: '));
    
    for (const line of lines) {
      const data = line.slice(6);
      if (data === '[DONE]') break;
      
      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices[0]?.delta?.content || '';
        setMessages(prev => {
          const last = prev[prev.length - 1];
          return [...prev.slice(0, -1), { ...last, content: last.content + delta }];
        });
      } catch {}
    }
  }
  
  setIsStreaming(false);
}
\`\`\`

## 시스템 프롬프트 설계

챗봇의 품질은 시스템 프롬프트에 크게 좌우됩니다:

\`\`\`
당신은 iykyk(풀스택 개발자)의 포트폴리오 웹사이트 AI 어시스턴트입니다.

역할:
- 방문자에게 포트폴리오 프로젝트, 기술 스택, 경력에 대해 안내
- 개발 관련 질문에 친절하고 전문적으로 응답
- 한국어로 기본 응답, 영어 질문은 영어로 응답

제한:
- 개인정보(전화번호, 주소 등)는 공개하지 않음
- 포트폴리오 범위를 벗어난 정치적 주제 등은 정중히 거절
\`\`\`

## 대화 맥락 관리

무한정 대화 히스토리를 API로 보내면 비용이 폭발합니다. 최근 N개 메시지만 유지하는 전략을 사용합니다:

\`\`\`typescript
const MAX_CONTEXT = 20; // 최근 20개 메시지만 유지

const contextMessages = messages.slice(-MAX_CONTEXT);
\`\`\`

## API 키 없을 때 폴백

\`\`\`typescript
if (!process.env.GEMINI_API_KEY) {
  return Response.json({
    message: keywordFallback(userMessage), // 키워드 기반 응답
  });
}
\`\`\`

AI 챗봇은 생각보다 훨씬 빠르게 구현할 수 있고, 포트폴리오의 차별화 포인트가 됩니다. 스트리밍 응답을 구현하면 GPT처럼 타이핑 효과가 나와서 UX가 눈에 띄게 좋아집니다.`,
  },
  {
    title: 'Neon PostgreSQL 마이그레이션기: Supabase에서 pg 드라이버로',
    category: 'project',
    featured: false,
    tags: ['Neon', 'PostgreSQL', 'Supabase', '마이그레이션', '데이터베이스'],
    content: `# Neon PostgreSQL 마이그레이션기

처음에는 Supabase SDK를 사용했다가, 점점 복잡해지는 쿼리와 비용 문제로 순수 \`pg\` 드라이버 + Neon PostgreSQL로 마이그레이션한 경험을 공유합니다.

## 왜 Supabase에서 벗어났나

Supabase 자체는 훌륭한 서비스입니다. 다만 이 프로젝트에서는:

1. **JS SDK 오버헤드**: \`supabase.from('posts').select()\` 형태가 복잡한 JOIN 쿼리에서 불편
2. **비용 예측 어려움**: Row-level security + Realtime 기능은 필요 없는데 포함됨
3. **Neon의 서버리스 확장**: cold start 없는 연결 풀링이 매력적
4. **직접 SQL 제어**: 복잡한 집계 쿼리를 원하는 대로 작성하고 싶었음

## 마이그레이션 전략

\`\`\`javascript
// Before: Supabase SDK
const { data, error } = await supabase
  .from('posts')
  .select('*, comments(count)')
  .eq('category', 'tech')
  .order('created_at', { ascending: false })
  .limit(10);

// After: pg 드라이버 직접 사용
const result = await pool.query(\`
  SELECT p.*, COUNT(c.id) AS comment_count
  FROM posts p
  LEFT JOIN comments c ON c.post_id = p.id
  WHERE p.category = $1
  ORDER BY p.created_at DESC
  LIMIT $2
\`, ['tech', 10]);
\`\`\`

## DB 커넥션 모듈 설계

\`\`\`javascript
// config/db.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: connectionString.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : undefined,
  max: 20,
  idleTimeoutMillis: 30_000,
});

// 편의 래퍼
async function query(text, params = []) {
  return pool.query(text, params);
}

module.exports = { pool, query };
\`\`\`

## Neon 연결 설정 주의사항

Neon은 서버리스 PostgreSQL이라 몇 가지 특이사항이 있습니다:

\`\`\`bash
# 연결 문자열 형태
postgresql://user:pass@ep-xxx-pooler.neon.tech/neondb?sslmode=require&channel_binding=require

# channel_binding=require — Neon 보안 요구사항
# sslmode=require — 암호화 필수
# -pooler — 서버리스 풀러 엔드포인트 (연결 수 최적화)
\`\`\`

## 데이터 이전 스크립트

\`\`\`javascript
async function migrateData() {
  // Supabase에서 읽기
  const { data: posts } = await supabase.from('posts').select('*');
  
  // Neon에 삽입
  for (const post of posts) {
    await neonPool.query(
      'INSERT INTO posts (id, title, content, ...) VALUES ($1, $2, $3, ...) ON CONFLICT (id) DO NOTHING',
      [post.id, post.title, post.content, ...]
    );
  }
}
\`\`\`

마이그레이션 후 코드가 확실히 깔끔해졌고, 복잡한 집계 쿼리를 자유롭게 작성할 수 있게 되어 만족스럽습니다.`,
  },

  // ──────────────────────────────────────────────────────── ECONOMY (3개)
  {
    title: 'AI 시대의 개발자 취업 시장: 살아남는 개발자의 조건',
    category: 'economy',
    featured: false,
    tags: ['AI', '취업시장', '개발자커리어', 'ChatGPT', '미래직업'],
    content: `# AI 시대의 개발자 취업 시장

ChatGPT가 등장한 이후 "개발자 직업이 사라질까?"라는 질문이 끊이지 않습니다. 2026년 현재 실제 채용 시장을 보면서 느낀 점을 솔직하게 정리합니다.

## 채용 시장의 변화

2023~2024년은 빅테크발 대규모 감원으로 개발자 시장이 얼어붙은 시기였습니다. 하지만 2025년을 기점으로 **AI 관련 직군과 풀스택 개발자** 수요가 다시 올라오는 양상을 보이고 있습니다.

주목할 만한 트렌드:

1. **AI 통합 능력 우대**: GPT API, Claude API, Gemini API 등을 실제 프로덕트에 통합한 경험이 있는 개발자를 선호
2. **인원 감소 but 생산성 향상**: 팀 규모는 작아졌지만 1인당 기대 산출물이 늘었음
3. **시니어 쏠림 심화**: 주니어 채용 문이 좁아지고 있음

## 여전히 수요가 높은 기술 스택

채용 공고를 분석한 결과:

| 기술 | 수요 변화 |
|------|---------|
| TypeScript + React | ↑ 강세 유지 |
| Node.js / Python 백엔드 | → 안정적 |
| AWS / GCP / Azure | ↑ 증가 |
| LLM/AI 통합 경험 | ↑↑ 폭발적 증가 |
| 모바일(iOS/Android) | → 안정적 |
| Web3/블록체인 | ↓ 하락 |

## AI가 대체하는 것 vs 대체하지 못하는 것

**AI가 잘 하는 것:**
- 보일러플레이트 코드 생성
- 단순 CRUD API 작성
- 테스트 코드 작성
- 문서화

**AI가 못 하는 것:**
- 비즈니스 요구사항을 기술 설계로 변환
- 레거시 코드베이스의 맥락 파악
- 복잡한 트레이드오프 판단
- 팀 커뮤니케이션과 리더십

## 살아남는 개발자의 조건

1. **AI 도구를 레버리지로 활용**: AI를 두려워하지 말고, AI로 10배 생산적이 되는 연습
2. **도메인 전문성**: 단순 코딩 능력보다 특정 산업/분야의 깊은 이해
3. **시스템 사고**: 개별 기능이 아니라 전체 아키텍처를 설계하는 능력
4. **커뮤니케이션**: 비기술 팀원에게 기술 개념을 설명하는 능력

## 현실적인 취업 전략

- **오픈소스 기여**: 공개된 코드로 실력 증명
- **사이드 프로젝트 배포**: 작동하는 프로덕트가 가장 강력한 포트폴리오
- **네트워킹**: 기술 커뮤니티, 밋업, 해커톤 참여
- **글쓰기**: 기술 블로그, LinkedIn 활동으로 personal brand 구축

AI가 코딩의 상당 부분을 자동화하더라도, **무엇을 만들지 결정하고 시스템을 설계하는 사람**은 여전히 필요합니다.`,
  },
  {
    title: '개발자를 위한 재테크: 개발 외 수입원 만들기',
    category: 'economy',
    featured: false,
    tags: ['재테크', '부수입', 'SaaS', '개발자수입', '사이드프로젝트'],
    content: `# 개발자를 위한 재테크: 개발 외 수입원 만들기

개발자라는 직업의 큰 장점은 **코드로 직접 제품을 만들 수 있다**는 것입니다. 이 능력을 활용해서 부수입을 만드는 방법들을 실제 경험을 바탕으로 정리합니다.

## 수입원의 종류

### 1. 프리랜싱 & 외주

가장 직접적인 방법입니다. 플랫폼:
- **크몽, 탈잉**: 국내 소규모 프로젝트
- **Upwork, Toptal**: 해외 클라이언트, 단가 높음
- **원티드 프리랜서**: IT 특화

**현실적인 시간당 단가:**
- 주니어: 3~5만원/시간
- 미드: 7~12만원/시간
- 시니어: 15만원+/시간

### 2. 테크 블로그 + 광고

블로그 수익은 느리지만 **시간이 지날수록 복리처럼 쌓입니다**.

수익 경로:
- Google AdSense: 월 방문자 1만 명 기준 월 5~20만원
- 스폰서십: 기업 기고, 제품 리뷰
- 유료 뉴스레터: Substack, Revue

### 3. 인디 해커 / 마이크로 SaaS

가장 잠재력이 크지만 시간과 노력이 많이 필요합니다.

성공 사례들의 공통점:
- **작은 문제 해결**: 틈새 시장의 특정 페인포인트
- **간단한 기능**: 복잡도 낮게 유지
- **반복 구독 모델**: MRR(월간 반복 수익) 중요

\`\`\`
예시 아이디어:
- 개발자용 이력서 생성기 ($9/월)
- GitHub 통계 대시보드 ($5/월)
- 코드 리뷰 도우미 ($19/월)
\`\`\`

### 4. 강의 & 교육 콘텐츠

- **인프런, 유데미**: 강의 한 번 만들면 수년간 수익
- **유튜브**: 구독자 1천 명부터 수익화, 장기전

**현실적인 수익:**
- 인프런 좋은 강의: 월 50~200만원 (처음에는 10~20만원)

## 투자 병행 전략

개발자 급여 자체도 꽤 좋은 편이니, 꾸준한 투자가 중요합니다:

1. **ISA + 연금저축**: 세금 혜택 최대한 활용
2. **인덱스 ETF**: 개별 주식보다 S&P500 ETF 장기 적립
3. **달러 자산 분산**: 환율 리스크 헤징

## 시작하기 좋은 순서

1. 먼저 **블로그 시작** — 비용 없이 시작 가능, 글쓰기 능력도 향상
2. **프리랜싱 1~2건** — 시장 단가 파악, 실무 경험 쌓기
3. **사이드 프로젝트 배포** — 실제 사용자 피드백으로 제품 개발 능력 향상
4. **강의 콘텐츠 기획** — 블로그 인기 포스트를 강의로 확장

중요한 것은 **완벽한 계획보다 시작**입니다. 처음엔 월 10만원도 안 나오지만, 3년 후에는 완전히 다른 그림이 될 수 있습니다.`,
  },
  {
    title: '2026년 테크 트렌드 전망: AI 에이전트, 엣지 컴퓨팅, 그리고 웹 개발의 미래',
    category: 'economy',
    featured: false,
    tags: ['테크트렌드', 'AI 에이전트', '엣지컴퓨팅', '웹개발', '2026'],
    content: `# 2026년 테크 트렌드 전망

매년 초 나오는 트렌드 전망이 얼마나 맞았는지 되돌아보면서, 2026년에 실질적으로 주목해야 할 것들을 정리합니다.

## 1. AI 에이전트의 실용화

2023~2024년이 "AI로 텍스트 생성"의 시대였다면, 2025~2026년은 **AI 에이전트가 실제 업무를 수행**하는 시대입니다.

변화의 조짐:
- 코딩 에이전트(Cursor, GitHub Copilot Workspace)가 단순 자동완성을 넘어 전체 PR 작성
- 고객 지원 자동화에서 AI가 전화, 이메일, 채팅을 종합 처리
- 데이터 분석 에이전트가 SQL 작성부터 인사이트 리포트 생성까지 처리

개발자에게 의미하는 바:
- "AI를 어떻게 오케스트레이션하는가"가 핵심 스킬
- LangChain, LlamaIndex 같은 프레임워크 학습 가치 상승

## 2. 엣지 컴퓨팅 본격화

Cloudflare Workers, Vercel Edge, Deno Deploy 등 **엣지 런타임**이 주류로 자리잡고 있습니다.

\`\`\`javascript
// Cloudflare Worker — 전 세계 300+ 도시에서 실행
export default {
  async fetch(request: Request) {
    const country = request.headers.get('cf-ipcountry');
    const lang = country === 'KR' ? 'ko' : 'en';
    return new Response(\`Hello from the edge! Lang: \${lang}\`);
  }
};
\`\`\`

장점:
- 글로벌 사용자에게 낮은 레이턴시 (< 50ms)
- 서버 관리 없음
- 콜드 스타트 거의 없음 (V8 isolate 재사용)

## 3. WebAssembly의 부상

WASM이 서버사이드로 확장되고 있습니다. \`wasmtime\`, \`WasmEdge\` 등이 컨테이너 대안으로 거론됩니다.

\`\`\`rust
// Rust → WASM 컴파일 후 브라우저에서 실행
#[no_mangle]
pub fn fibonacci(n: u32) -> u32 {
    match n {
        0 | 1 => n,
        _ => fibonacci(n - 1) + fibonacci(n - 2),
    }
}
\`\`\`

## 4. React의 지속적 진화

Next.js를 중심으로 React 에코시스템이 서버 컴포넌트 방향으로 수렴하고 있습니다. 동시에 Astro, SvelteKit 같은 대안이 특정 use case에서 두각을 나타내고 있습니다.

**2026년 주목할 것들:**
- React Compiler (자동 메모이제이션)
- Partial Prerendering
- Turbopack 완전 전환

## 5. 오픈소스 AI 모델의 성장

Meta LLaMA, Mistral 등 오픈소스 모델이 GPT-4에 근접하면서, **로컬/온프레미스 AI** 구축이 가능해졌습니다.

기업들이 주목하는 이유:
- 데이터 프라이버시 (외부 API 미사용)
- 비용 절감 (API 호출 비용 없음)
- 커스터마이징 (파인튜닝 가능)

## 어디에 투자할 것인가

기술 스택 관점에서 추천 우선순위:

1. TypeScript + React (기본 유지)
2. AI 통합 개발 (LLM API, 에이전트 프레임워크)
3. 클라우드 네이티브 (K8s, Terraform, 혹은 서버리스)
4. 성능 최적화 (Web Core Vitals, WASM)

기술 트렌드를 좇는 것도 중요하지만, 기본기(알고리즘, 시스템 설계, 네트워크)는 어떤 트렌드가 와도 핵심입니다.`,
  },

  // ──────────────────────────────────────────────────────── TRAVEL (2개)
  {
    title: '발리에서 한 달 워케이션: 개발자의 현실적인 후기',
    category: 'travel',
    featured: false,
    tags: ['워케이션', '발리', '리모트워크', '개발자여행', '디지털노마드'],
    content: `# 발리에서 한 달 워케이션: 개발자의 현실적인 후기

인스타그램에서 보이는 수영장 옆에서 노트북 펼쳐놓고 일하는 모습. 실제로 해봤습니다. 예상과 달랐던 것들, 좋았던 것들을 솔직하게 공유합니다.

## 왜 발리였나

발리를 선택한 이유:
1. **비자**: 30일 무비자 입국 가능 (한국 여권 기준)
2. **비용**: 서울 대비 생활비 40~60% 수준
3. **인터넷**: 의외로 괜찮음 (카페 기준 50~100Mbps)
4. **개발자 커뮤니티**: 짱구(Canggu) 지역에 디지털 노마드 많음

## 숙소와 코워킹 스페이스

**숙소 선택 기준:**
- 에어컨 (필수! 발리는 덥습니다)
- 안정적인 와이파이 (측정 필수)
- 짱구 또는 우붓 지역 (개발자 커뮤니티 중심지)

월세 기준:
- 스튜디오 아파트: 50~80만원
- 빌라(수영장 포함): 100~150만원

**코워킹 스페이스:**
- **Dojo Bali**: 하루 25,000루피아(~2,000원), 안정적인 1Gbps 광랜
- **Outpost**: 커뮤니티 이벤트 많음, 약간 비쌈
- **동네 카페**: 가성비 최고, 단 자리 경쟁

## 실제 개발 환경

**좋았던 것:**
- 시차: 한국 -1시간 (한국 고객과 회의 거의 지장 없음)
- 카페 분위기: 집중이 잘 되는 환경
- 기후: 비오는 계절 피하면 쾌적

**어려웠던 것:**
\`\`\`
문제 1: 불안정한 전력
→ 해결: UPS 같은 배터리팩 지참 or 맥북처럼 배터리 좋은 기기 사용

문제 2: 화상 회의 중 인터넷 끊김
→ 해결: LTE 핫스팟 백업 항상 준비 (Telkomsel SIM 현지 구매)

문제 3: 더위로 인한 집중력 저하
→ 해결: 오전 8시~12시에 핵심 작업 집중, 오후는 가벼운 업무
\`\`\`

## 한 달 지출 내역

| 항목 | 금액 |
|------|------|
| 항공권 (왕복) | 60만원 |
| 숙소 (31일) | 110만원 |
| 식비 | 40만원 |
| 교통 (오토바이 렌트) | 10만원 |
| 코워킹/카페 | 8만원 |
| 기타 | 15만원 |
| **합계** | **243만원** |

서울에서 월세 + 생활비가 150만원 이상인 분들이라면 거의 비슷한 비용으로 훨씬 넓고 수영장 있는 공간에서 지낼 수 있습니다.

## 개발 생산성 변화

솔직히 말하면, **처음 2주는 생산성이 낮았습니다**. 새로운 환경 적응, 관광 욕구, 소셜 활동 때문입니다.

3~4주차에는 오히려 서울보다 집중이 잘 됐습니다. 이유는:
- 사무실 정치 없음
- 배달음식 유혹 없음
- 자연 속에서 정신적 여유

## 추천 여부

**이런 분께 추천:**
- 풀리모트 가능한 직군
- 3주 이상 장기 체류 계획 (2주 이하는 적응하다 끝남)
- 혼자 일하는 것에 익숙한 분

**비추천:**
- 오전 9시 정각에 한국 팀과 스탠드업 미팅 필수인 분
- 빠른 인터넷(1Gbps+)이 항상 필요한 업무`,
  },
  {
    title: 'JSConf Korea 2025 참관기: 컨퍼런스에서 배운 것들',
    category: 'travel',
    featured: false,
    tags: ['JSConf', '개발자컨퍼런스', '네트워킹', '기술커뮤니티', 'JavaScript'],
    content: `# JSConf Korea 2025 참관기

국내 최대 JavaScript 컨퍼런스에 처음으로 참석했습니다. 세션 내용보다 현장에서 느낀 것들이 더 많았습니다.

## 컨퍼런스 개요

- **일정**: 2025년 10월, 서울 코엑스
- **규모**: 약 1,500명 참가
- **트랙**: 3개 트랙 병행, 총 30여 개 세션

## 기억에 남는 세션들

### 1. "JavaScript 런타임의 미래" (키노트)

Deno, Bun, Node.js 세 런타임의 방향성을 비교 분석한 세션이었습니다.

핵심 메시지:
- Node.js: 안정성, 생태계, 기업 채택
- Deno: 보안 기본값, Web API 호환
- Bun: 성능 극대화, 개발 경험

\`\`\`bash
# 벤치마크 (단순 HTTP 서버, req/s)
bun:    ~100,000
deno:   ~60,000
node:   ~50,000
\`\`\`

### 2. "리액트 컴파일러 실제로 써보니"

React Compiler(구 React Forget)의 실제 적용 경험을 공유한 세션. 자동 메모이제이션이 모든 경우에 최적이 아닐 수 있다는 현실적인 내용이 인상적이었습니다.

### 3. "5년차 프론트엔드가 번아웃을 극복한 방법"

기술 세션이 아닌 커리어/멘탈 헬스 세션이었는데, 오히려 가장 많은 공감을 받았습니다.

발표자가 공유한 번아웃 신호:
- 코드 작성이 두려워짐
- 새 기술 트렌드에 무감각해짐
- 업무 외 코딩이 완전히 사라짐

## 네트워킹: 컨퍼런스의 진짜 가치

세션도 좋았지만, 커피 브레이크와 점심 시간의 대화가 가장 값졌습니다.

우연히 대화를 나눈 분들:
- 스타트업 CTO: 채용 인사이트와 실제 기술 스택 결정 과정
- 오픈소스 메인테이너: 기여 시작하는 방법 조언
- 시니어 개발자: 커리어 전환 경험

**네트워킹 팁:**
1. 세션 후 발표자에게 직접 질문하기 (발표자도 대화를 원합니다)
2. 공식 디스코드/슬랙 채널 활용
3. 이름표에 현재 관심사/기술 스택 적어두기

## 컨퍼런스 참가 비용 대비 효과

- 참가비: 10만원 (얼리버드)
- 교통/숙박: 없음 (서울 거주)
- 가치: 헤아리기 어려움

얻은 것들:
- 최신 트렌드 밀도 높은 업데이트 (유튜브 영상 50개 분량)
- 3명과 링크드인 연결 (그 중 1명과는 이후 사이드 프로젝트 협업)
- "나만 모르는 게 아니구나" 하는 안도감

## 다음 컨퍼런스 준비 체크리스트

- [ ] 명함 or QR코드 준비 (링크드인 프로필)
- [ ] 관심 세션 사전에 체크, 겹치는 경우 우선순위 결정
- [ ] 노트 앱 준비 (노션, 옵시디언 등)
- [ ] 편한 신발 (하루 종일 서있는 경우도 많음)
- [ ] 개방적인 마음 — 낯선 사람에게 먼저 말 걸기

컨퍼런스는 투자 대비 효과가 매우 높은 개발자 성장 방법입니다. 올해 한 번도 가지 않았다면, 내년에는 꼭 가보세요.`,
  },

  // ──────────────────────────────────────────────────────── GENERAL (3개)
  {
    title: '2025년 개발자 회고: 내가 배운 것과 실패한 것들',
    category: 'general',
    featured: false,
    tags: ['회고', '개발자일상', '성장', '2025', '자기계발'],
    content: `# 2025년 개발자 회고

한 해가 끝날 때마다 회고를 쓰려 했지만, 항상 미루다 새해가 됐습니다. 올해는 진짜로 씁니다.

## 올해 한 것들

### 프로젝트
- **포트폴리오 사이트 v1 → v2**: Supabase에서 Neon으로 마이그레이션, 3D 히어로 씬 추가
- **테트리스 게임**: Canvas API 공부용으로 시작했다가 포트폴리오에 포함
- **AI 챗봇 통합**: Gemini API로 실제 동작하는 챗봇 구현

### 배운 기술
- Next.js 14 App Router (Pages Router에서 전환)
- React Three Fiber & Three.js 기초
- PostgreSQL 쿼리 최적화 (EXPLAIN ANALYZE 처음 제대로 사용)
- GitHub Actions CI/CD

### 읽은 책
- 클린 아키텍처 (로버트 마틴)
- 파친코 (이민진)
- 린 스타트업 (에릭 리스)

## 실패한 것들 (이게 더 중요)

### 1. 출시하지 못한 사이드 프로젝트

올해 구상만 했다가 실행하지 못한 프로젝트들:
- 개발자 독서 기록 앱 (notion 클론 느낌)
- 채용 공고 자동 분석 도구
- 기술 블로그 뉴스레터

공통된 패턴: "조금 더 설계하자" → 무한 반복 → 출시 못 함

**교훈**: 72시간 안에 MVP를 배포하는 습관을 들여야 할 것 같습니다.

### 2. 운동 루틴 실패

개발자의 직업병인 목/어깨 통증이 심해졌습니다. 헬스장 등록만 세 번, 실제 꾸준히 간 건 한 달도 안 됩니다.

내년에는 저녁 운동 대신 아침 운동으로 바꿔볼 계획입니다.

### 3. 영어 공부 흐지부지

개발 관련 영어는 괜찮지만, 기술 컨퍼런스나 해외 개발자와의 캐주얼 대화가 아직 어색합니다.

## 올해 잘 한 것들

1. **블로그 시작**: 완성도보다 꾸준함을 우선했고, 덕분에 글쓰기가 조금 편해짐
2. **커뮤니티 참여**: JSConf, 사내 세미나, 오픈소스 이슈 등록
3. **멘토링**: 부트캠프 수료생 3명의 포트폴리오 리뷰 도움

## 내년 목표 (구체적으로)

- **기술**: TypeScript 심화, AWS SAA 자격증
- **프로젝트**: 배포 완료 사이드 프로젝트 최소 1개
- **건강**: 주 3회 운동 (4월까지 유지가 목표)
- **글쓰기**: 월 2개 이상 기술 포스트

회고를 쓰다 보면 "생각보다 많이 했네"와 "생각보다 못 했네"가 동시에 느껴집니다. 그게 성장의 증거 같습니다.`,
  },
  {
    title: '처음 오픈소스 기여하기: Pull Request 하나가 바꾼 것들',
    category: 'general',
    featured: false,
    tags: ['오픈소스', 'GitHub', '기여', '커뮤니티', '개발자성장'],
    content: `# 처음 오픈소스 기여하기

오픈소스 기여는 "대단한 개발자들이 하는 것"이라고 생각했습니다. 작은 PR 하나를 머지하고 나서 그 생각이 완전히 바뀌었습니다.

## 첫 기여의 계기

Next.js 공식 문서를 읽다가 오타를 발견했습니다. "오타 수정 정도는 괜찮겠지"라는 가벼운 마음으로 처음 PR을 올렸습니다.

\`\`\`bash
# 레포 포크 후 클론
git clone https://github.com/[내ID]/next.js.git
cd next.js

# 브랜치 생성
git checkout -b fix/typo-in-routing-docs

# 수정 후 커밋
git add .
git commit -m "docs: fix typo in app router docs"

# 푸시 후 PR 생성
git push origin fix/typo-in-routing-docs
\`\`\`

## 예상보다 친절한 리뷰 프로세스

PR을 올리자마자 자동화된 테스트가 돌아갔고, 24시간 이내에 메인테이너에게서 댓글이 달렸습니다.

\`\`\`
"Thanks for the contribution! Could you also check the related section 
on the same page? Seems there might be a similar issue."
\`\`\`

요청대로 수정했고, 이틀 후에 **Merged** 표시가 떴습니다.

그 초록색 Merged 배지를 보는 순간의 기분은... 생각보다 훨씬 좋았습니다.

## 기여 방법 찾기

**입문자에게 좋은 이슈 찾기:**

\`\`\`
GitHub 검색: label:good-first-issue is:open language:javascript
\`\`\`

레이블 종류:
- \`good first issue\`: 입문자용
- \`help wanted\`: 메인테이너가 도움 요청
- \`documentation\`: 코드 없이도 기여 가능
- \`bug\`: 버그 수정

## 기여 유형별 난이도

| 유형 | 난이도 | 효과 |
|------|--------|------|
| 오타/문서 수정 | ⭐ | 포트폴리오 가산점 |
| 번역 기여 | ⭐⭐ | 언어 실력 활용 |
| 테스트 추가 | ⭐⭐ | 코드 이해도 높임 |
| 버그 수정 | ⭐⭐⭐ | 핵심 기여 |
| 기능 추가 | ⭐⭐⭐⭐ | RFC 프로세스 필요 |

## 기여로 바뀐 것들

1. **코드 읽는 능력 향상**: 남의 큰 코드베이스를 빠르게 파악하는 연습
2. **PR 쓰는 법**: 설명 잘 쓴 PR이 얼마나 중요한지 체감
3. **자신감**: "나도 오픈소스에 기여할 수 있다"
4. **이력서 항목**: "Next.js 오픈소스 기여" 한 줄의 무게

## 실수했던 것들

- **큰 것부터 하려다 시작을 못 함**: 작은 것부터 시작이 맞습니다
- **현지인 영어 댓글에 겁먹음**: 개발 영어는 생각보다 패턴이 있습니다
- **테스트 안 보고 PR**: 반드시 로컬에서 테스트 먼저 돌리세요

## 나만의 오픈소스 기여 루틴

매주 금요일 오후 30분을 "오픈소스 시간"으로 블록합니다. 거창한 기여가 아니어도 됩니다. 오탈자 수정, 오래된 스크린샷 업데이트, 코멘트 개선 — 모두 가치 있는 기여입니다.

오픈소스는 거대한 것이 아닙니다. **내가 사용하는 도구를 조금 더 좋게 만드는 것**입니다.`,
  },
  {
    title: '개발자의 번아웃: 징후, 극복, 그리고 예방',
    category: 'general',
    featured: false,
    tags: ['번아웃', '멘탈헬스', '개발자일상', '워라밸', '자기관리'],
    content: `# 개발자의 번아웃: 징후, 극복, 그리고 예방

개발자 번아웃을 처음 겪은 건 3년차 때였습니다. 당시에는 번아웃인 줄도 몰랐습니다. 지금 돌아보면 꽤 심각한 상태였는데, 그때를 기억하며 씁니다.

## 번아웃의 징후

### 초기 신호 (무시하기 쉬운 것들)
- 평소에 재미있던 사이드 프로젝트에 손이 안 감
- 기술 뉴스레터를 읽지 않게 됨
- 코드 리뷰 피드백이 유독 예민하게 느껴짐
- 회의 시간이 길어질수록 무기력해짐

### 중기 신호 (무언가 잘못됐음을 느낄 때)
- 간단한 버그도 집중해서 볼 수가 없음
- 월요일 아침마다 특별한 이유 없는 무거움
- 동료들과 대화가 피상적으로 변함
- 퇴근 후 몇 시간을 아무것도 못 함

### 후기 신호 (즉각 조치 필요)
- 업무 중 실수가 눈에 띄게 늘어남
- 수면 패턴이 완전히 무너짐
- "그냥 다 관두고 싶다"는 생각이 반복됨

## 번아웃의 원인 분석

개발자 번아웃의 흔한 원인들:

\`\`\`
1. 기술 부채가 쌓인 코드베이스에서 장기간 작업
2. 명확한 요구사항 없이 계속 변하는 스펙
3. 성과가 보이지 않는 반복적인 업무
4. 경쟁적인 분위기에서의 만성 야근
5. 성장감의 부재 ("나는 여기서 발전하고 있나?")
\`\`\`

## 내가 번아웃을 극복한 방법

### 1. 일단 멈추기

억지로 생산적이 되려 하지 않았습니다. 주말 이틀을 완전히 코드와 거리를 뒀습니다. 유튜브, 독서, 산책 — 코드와 무관한 것들만.

### 2. 작은 승리 만들기

복잡한 프로젝트 대신, 1~2시간 안에 완성할 수 있는 작은 것을 만들었습니다.

\`\`\`javascript
// 이런 것도 됩니다: 터미널 달력 스크립트 30분 만에 완성
const today = new Date();
console.log(\`오늘: \${today.toLocaleDateString('ko-KR', { 
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
})}\`);
\`\`\`

"완성"의 기쁨이 의외로 회복에 도움이 됩니다.

### 3. 환경 변화

- 항상 같은 자리가 아닌 카페나 도서관에서 일하기
- 배경음악 변경 (로파이 → 클래식, 또는 완전한 침묵)
- 업무 시작 전 10분 걷기

### 4. 동료와 솔직한 대화

"요즘 좀 지쳐있어요"라고 말하는 게 생각보다 어렵습니다. 하지만 말하고 나면 훨씬 가벼워집니다.

## 번아웃 예방 루틴

**매일:**
- 퇴근 시간 엄수 (야근은 합의된 상황에서만)
- 점심 시간 자리를 벗어나기
- 오늘 할 일 3가지만 정하기 (모두 다 하려 하지 않기)

**매주:**
- 배운 것 한 줄 기록
- 즐거웠던 코딩 순간 떠올리기
- 1가지는 개인 프로젝트에 투자

**매달:**
- "나는 성장하고 있나?" 솔직하게 점검
- 기술 커뮤니티 참여 (밋업, 컨퍼런스)

## 개발 문화의 문제

개인의 노력만으로는 한계가 있습니다. 번아웃이 팀 전체에 만연하다면, 그것은 개인 문제가 아니라 조직 문제입니다.

좋은 팀의 특징:
- "바빠요?"가 아닌 "어떻게 도와드릴까요?"
- 실수를 숨기지 않아도 되는 심리적 안전
- 명확한 우선순위와 합리적인 마감

번아웃을 겪었다면, 그건 당신이 약해서가 아닙니다. 오히려 오랫동안 열심히 달려온 증거입니다. 잠깐 멈추는 것은 포기가 아닙니다.`,
  },
];

// ---------------------------------------------------------------------------
// Seed logic
// ---------------------------------------------------------------------------

async function ensureCategoryConstraint(client) {
  // Check if there's a CHECK constraint on category that might block inserts
  const result = await client.query(`
    SELECT conname, pg_get_constraintdef(oid) AS def
    FROM pg_constraint
    WHERE conrelid = 'posts'::regclass
      AND contype = 'c'
      AND conname ILIKE '%category%'
  `);

  if (result.rows.length > 0) {
    const constraint = result.rows[0];
    const def = constraint.def;
    const neededCategories = ['general', 'tech', 'project', 'economy', 'travel', 'update'];
    const hasAll = neededCategories.every(c => def.includes(c));

    if (!hasAll) {
      console.log(`⚠️  category 제약 조건 업데이트 중: ${constraint.conname}`);
      await client.query(`ALTER TABLE posts DROP CONSTRAINT "${constraint.conname}"`);
      await client.query(`
        ALTER TABLE posts ADD CONSTRAINT posts_category_check
        CHECK (category IN ('general', 'tech', 'project', 'economy', 'travel', 'update', 'coin', 'food', 'lottery'))
      `);
      console.log('✅ category 제약 조건 업데이트 완료');
    } else {
      console.log('✅ category 제약 조건 이미 적합');
    }
  } else {
    console.log('ℹ️  category 관련 CHECK 제약 없음 — 그대로 진행');
  }
}

async function main() {
  console.log('🌱 블로그 포스트 시딩 시작...\n');

  const client = await pool.connect();

  try {
    await ensureCategoryConstraint(client);

    // Check existing titles to avoid duplicates
    const existingResult = await client.query('SELECT title FROM posts');
    const existingTitles = new Set(existingResult.rows.map(r => r.title));

    console.log(`📋 기존 포스트: ${existingTitles.size}개\n`);

    const results = { inserted: [], skipped: [], failed: [] };

    for (const post of POSTS) {
      if (existingTitles.has(post.title)) {
        results.skipped.push(post.title);
        console.log(`⏭️  스킵 (중복): ${post.title}`);
        continue;
      }

      try {
        await client.query(
          `INSERT INTO posts (title, content, author, category, tags, featured, views, likes, status)
           VALUES ($1, $2, $3, $4, $5::text[], $6, $7, $8, $9)`,
          [
            post.title,
            post.content,
            'iykyk',
            post.category,
            post.tags || [],
            post.featured || false,
            Math.floor(Math.random() * 200),  // 초기 조회수 랜덤 부여
            Math.floor(Math.random() * 30),   // 초기 좋아요 랜덤 부여
            'published',
          ]
        );
        results.inserted.push({ title: post.title, category: post.category });
        console.log(`✅ 삽입: [${post.category}] ${post.title}`);
      } catch (err) {
        results.failed.push({ title: post.title, error: err.message });
        console.error(`❌ 실패: ${post.title}\n   원인: ${err.message}`);
      }
    }

    // ── 결과 리포트 ───────────────────────────────────────────────────────
    console.log('\n' + '='.repeat(60));
    console.log('📊 시딩 결과 요약');
    console.log('='.repeat(60));
    console.log(`✅ 삽입 성공: ${results.inserted.length}개`);
    console.log(`⏭️  중복 스킵: ${results.skipped.length}개`);
    console.log(`❌ 실패: ${results.failed.length}개`);

    // 카테고리별 분류
    const byCategory = {};
    for (const { title, category } of results.inserted) {
      if (!byCategory[category]) byCategory[category] = [];
      byCategory[category].push(title);
    }

    console.log('\n📁 카테고리별 삽입 목록:');
    for (const [cat, titles] of Object.entries(byCategory)) {
      console.log(`\n  [${cat.toUpperCase()}] (${titles.length}개)`);
      titles.forEach(t => console.log(`    • ${t}`));
    }

    if (results.failed.length > 0) {
      console.log('\n❌ 실패 목록:');
      results.failed.forEach(({ title, error }) => {
        console.log(`  • ${title}\n    → ${error}`);
      });
    }

    // 전체 포스트 수 확인
    const totalResult = await client.query("SELECT COUNT(*) FROM posts WHERE status = 'published'");
    console.log(`\n📈 DB 전체 published 포스트: ${totalResult.rows[0].count}개`);
    console.log('\n🔄 재실행 안전 여부: ✅ 안전 (중복 제목 자동 스킵)');

  } finally {
    client.release();
    await pool.end();
    console.log('\n✨ 완료!');
  }
}

main().catch(err => {
  console.error('💥 치명적 오류:', err.message);
  process.exit(1);
});
