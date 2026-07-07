# Gemini AI 쿼터 / Fallback 가드레일

## 트리거 조건

다음 중 하나에 해당하면 이 체크리스트를 따른다:

- `client/lib/ai-quota.ts`, `ai-quota-guard.ts`, `ai-chat-quota.ts`, `anonymous-quota.ts`, `ai-feature-quota.ts` 등 쿼터 관련 파일 수정
- `client/app/api/ai/*` (chat, summarize, translate, improve), `client/app/api/ai-interviewer`, `client/app/api/kuuma/chat` 등 Gemini를 호출하는 API 라우트 수정
- `client/app/api/subscription/*` (check, usage) 수정
- `GEMINI_API_KEY` / `GEMINI_MODEL` 관련 환경변수 작업
- `client/lib/aetheria/llm-router.ts` 등 앱 레이어 외 Gemini 호출부 수정

## 절차

### 1. 레이어 구분을 지킨다

- **앱 레이어** (실사용자에게 응답하는 AI 기능)는 반드시 쿼터/구독 체크를 통과한 뒤에만 Gemini를 호출해야 한다. 새 AI 기능을 추가할 때 `enforceAiQuota` (또는 동등한 쿼터 가드) 호출을 빠뜨리지 않는다.
- 개발 보조 목적(예: 코드 리뷰 텍스트 생성 등)으로 Gemini를 쓰는 스크립트를 새로 추가하는 경우, **프로덕션 쿼터/구독 테이블에 절대 영향을 주지 않도록** 별도 경로로 분리한다.

### 2. Fail-safe / Fallback

- `GEMINI_API_KEY`가 없거나 Gemini 호출이 실패해도 사용자에게 **500 에러 화면**을 보여주면 안 된다. 키워드 템플릿 fallback(챗봇) 또는 명확한 에러 메시지(`errorCode` 포함 JSON)로 우아하게 처리한다.
- 쿼터/구독 체크 자체가 실패한 경우(`SUBSCRIPTION_CHECK_UNAVAILABLE` 등)에도 **안전한 기본값(차단)**으로 동작해야 한다. 즉 "확인 불가 = 무제한 허용"이 아니라 "확인 불가 = 503으로 차단"이 현재 정책이다. 이 fail-closed 정책을 임의로 fail-open으로 바꾸지 않는다.
- 새 AI 기능을 추가할 때는 `USAGE_LIMIT_KEYS`(또는 동등 매핑)에 새 `usageType`을 등록하고, `dailyXxx` 형태의 한도 키를 구독 스키마와 맞춘다.

### 3. 모델명 관리

- 현재 모델명이 파일마다 하드코딩되어 있다 (`gemini-2.5-flash-preview-05-20` in chat, `gemini-2.5-flash` in `llm-router.ts`). 새로 추가하는 호출부는 가능하면 `process.env.GEMINI_MODEL`을 우선 사용하고, 없으면 해당 기능의 기존 기본값으로 폴백하도록 작성한다 (기존 호출부를 일괄 변경하려면 별도 태스크로 진행하고 회귀 테스트를 거친다).
- `reasoning_effort: 'none'` 같은 모델별 특이 옵션(예: `gemini-2.5-flash`의 thinking 토큰 소비 이슈)을 변경하기 전에 관련 주석/이력을 확인한다.

### 4. 비용 한도

- Vercel Hobby / Neon 무료 플랜 기준 정책과 충돌하지 않는지 확인한다:
  - cron: 1일 1회, `maxDuration` 60초, 실행당 1건 생성.
  - 앱 내 AI 기능: 무료 사용자 일일 한도(`dailyImprovements`, `dailyTranslations`, `dailySummaries` 등)를 늘리거나 없애려면 Master 승인 필요.
- `internal API timeout`(`INTERNAL_API_TIMEOUT_MS`, 기본 3000ms) 같은 내부 fetch 타임아웃 값을 변경할 때는 Vercel 함수 `maxDuration`과의 관계를 함께 고려한다.

### 5. 변경 후 검증

- 쿼터/타입 관련 파일을 수정했다면 `AGENTS.md`의 "Before commit/push" 규칙에 따라 **`cd client && npm run build`**를 반드시 실행하고 통과를 확인한다.
- discriminated union(`{ allowed: true } | { allowed: false }` 등)을 다룰 때는 `if (!x.ok)` 하나로 narrowing 되지 않을 수 있으므로 명시적 타입 가드를 사용한다 (`.cursor/rules/client-build-before-ship.mdc` 참고).
