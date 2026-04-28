# 🚀 포트폴리오 웹사이트

Node.js API 서버와 Next.js 프론트엔드로 구축된 포트폴리오 웹사이트입니다.  
포트폴리오/블로그/게시글/구독 기능과 함께, 브라우저 기반 테트리스 데모(`/tetris`)를 포함합니다.

## ✨ 주요 기능

- 반응형 UI (모바일/데스크톱)
- 다크모드 및 테마 저장
- 포스트/프로젝트 검색·필터
- Supabase 기반 데이터 연동
- 구독/사용량 추적(선택적 Stripe 결제)
- 테트리스 데모 (키보드 + 모바일 제스처)
- 보안 미들웨어(Helmet, CORS, Rate limit), 로깅

## 🛠️ 기술 스택

### 백엔드 (`server`)
- Node.js, Express
- Supabase (`@supabase/supabase-js`)
- cors, helmet, morgan, express-validator
- nodemailer, openai, sharp

### 프론트엔드 (`client`)
- Next.js 14 (App Router), React 18, TypeScript
- Tailwind CSS, Framer Motion, React Icons

## 📁 프로젝트 구조

```text
portfolio/
├── client/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── portfolio/
│   │   └── tetris/
│   ├── components/
│   ├── hooks/
│   └── lib/
├── server/
│   ├── routes/
│   ├── config/
│   └── scripts/
└── README.md
```

## 🚀 시작하기

### Client 실행

```bash
cd client
npm install
npm run dev
```

- 기본: `http://localhost:3000`
- 3000 점유 시: `http://localhost:3001`
- 테트리스: `/tetris`

### Server 실행

```bash
cd server
npm install
npm run dev
```

- API: `http://localhost:5000`
- 상태 체크: `GET /api/health`

---

## 📘 운영 문서 통합 (기존 루트 MD 반영)

아래 내용은 기존 문서를 섹션별로 통합 정리한 것입니다.

### 1) Supabase 환경 변수/연결 설정

기존 문서: `SUPABASE_SETUP_GUIDE.md`, `QUICK_FIX_SUPABASE.md`

#### 서버 환경 변수 (`server/.env`)

```env
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

#### 클라이언트 환경 변수 (`client/.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### 핵심 주의사항
- 브라우저에서 쓰는 값만 `NEXT_PUBLIC_` 접두사 사용
- `SUPABASE_SERVICE_ROLE_KEY`는 공개 변수로 노출 금지
- env 변경 후 client/server 재시작 필수

---

### 2) Posts 테이블 컬럼 이슈 해결

기존 문서: `FIX_SUPABASE_TABLE.md`, `FIX_TABLE_COLUMNS.md`, `QUICK_FIX_AUTHOR_COLUMN.md`

#### 증상
- `author` 컬럼 누락 시 게시글 생성 실패
- `views`, `featured` 누락 시 조회/필터 기능 제약

#### 권장 SQL

```sql
ALTER TABLE posts ADD COLUMN IF NOT EXISTS author VARCHAR(100) NOT NULL DEFAULT 'iykyk';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_category_check;
ALTER TABLE posts ADD CONSTRAINT posts_category_check
  CHECK (category IN ('general', 'tech', 'economy', 'coin', 'travel', 'food', 'lottery', 'project', 'update'));
```

#### 점검 쿼리

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'posts'
ORDER BY ordinal_position;
```

---

### 3) RLS 정책 오류 해결

기존 문서: `FIX_RLS_ERROR.md`

#### 대표 오류

```text
new row violates row-level security policy for table "posts"
```

#### 해결 방법
- `posts` 테이블에 SELECT/INSERT/UPDATE/DELETE 정책 명시
- 서버 사이드에서 Service Role Key 사용 가능 (개발 편의)

#### 운영 권장
- 프로덕션에서는 `USING (true)` 완전 오픈 정책 지양
- 인증 사용자 조건으로 정책 제한

---

### 4) 게시글 작성/샘플 데이터 가이드

기존 문서: `CREATE_POSTS_GUIDE.md`

#### 작성 방식
- 웹: `/posts`의 작성 UI
- API:

```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"제목","content":"내용","author":"작성자","category":"tech"}'
```

#### 샘플 데이터 생성

```bash
cd server
npm run create-sample-posts
```

#### 주의
- 서버 실행 상태 필요
- Supabase 연결 필요
- 재실행 시 중복 생성 가능

---

### 5) 구독/수익화 설정

기존 문서: `SUBSCRIPTION_SETUP.md`

#### 구성 요소
- `subscriptions`, `payments`, `ai_usage` 테이블
- `posts.is_premium`, `premium_price` 필드 기반 유료 콘텐츠

#### 사용 흐름
- `/subscription`에서 플랜 선택
- `/api/subscription/check`, `/api/subscription/usage`로 상태/사용량 확인

#### Stripe (선택)
- 개발환경: Stripe 없이 내부 처리 가능
- 운영환경: Stripe key, price id, webhook 설정 권장

---

### 6) 광고 배치 전략

기존 문서: `AD_PLACEMENT_GUIDE.md`

#### 이미 반영된 핵심 위치
- 게시물 상세 상단/중간/하단

#### 추가 권장 위치
- 블로그 메인 Featured 영역 전후
- 포스트 목록 그리드 3개 간격
- 포트폴리오 섹션 사이

#### 원칙
- 광고 밀도 과다 금지
- 모바일 레이아웃 우선
- 로딩/성능 저하 최소화

---

## 🔧 유용한 명령어

### server

```bash
cd server
npm run dev
npm run test-supabase
npm run create-sample-posts
npm run check-posts-table
npm run fix-posts-table
```

### client

```bash
cd client
npm run dev
npm run build
npm run lint
```

## 📝 참고

- `npm run build`에서 `/api/contact` 등 env 의존 라우트가 있으면 환경 변수 누락 시 실패할 수 있습니다.
- 기능 확인은 우선 `npm run dev` 기준으로 검증하는 것을 권장합니다.

