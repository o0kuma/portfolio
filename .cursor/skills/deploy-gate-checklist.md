# 배포 전 체크리스트 (Deploy Gate)

## 트리거 조건

다음 중 하나에 해당하면 커밋/푸시 또는 배포 승인 전에 이 체크리스트를 따른다:

- Master가 "배포해줘", "푸시해줘", "이제 올려도 될까?" 등 배포/푸시 관련 요청을 할 때
- `client/app/api/**`, `client/lib/**`, API에서 쓰는 TypeScript union/type을 변경했을 때
- `server/migrations/*.sql`을 새로 추가했을 때
- 환경변수(`.env.example`, Vercel 프로젝트 설정) 관련 변경이 있을 때
- `client/vercel.json` / 루트 `vercel.json` (cron 설정 등)을 변경했을 때

## 절차

### 1. 빌드 게이트 (필수)

```bash
cd client && npm run build
```

- exit 0 확인 (Next.js 타입체크 포함).
- 실패 시 커밋/푸시하지 않는다. `.cursor/rules/client-build-before-ship.mdc`의 타입 가드 가이드를 참고해 수정한다.
- 가능하면 `cd server && npm test`도 실행한다 (테스트 파일이 있는 영역 한정).

### 2. 마이그레이션 확인

- 이번 변경에 `server/migrations/*.sql` 신규 파일이 포함되어 있는가?
  - 있다면: 배포 **전에** Neon SQL Editor 또는 `psql`로 먼저 실행했는지 확인 (자동 실행 스크립트 없음 — `neon-cron-checklist.md` 참고).
  - 마이그레이션 순서: **스키마 변경 먼저 → 코드 배포 나중** (역순이면 새 코드가 없는 컬럼을 참조해 런타임 에러 발생 가능).

### 3. 환경변수 확인 (Vercel Production)

| 변수 | 필요 조건 | 없을 때 영향 |
|---|---|---|
| `DATABASE_URL` | 포스트/프로젝트/문의/구독/AI 사용량/티어리스 게임 리더보드 기능 전체 | 해당 기능 API가 에러 반환 (앱 자체는 구동) |
| `GEMINI_API_KEY` | AI 챗봇, cron 포스트 생성, 요약/번역/개선 | 키워드 템플릿 fallback으로 저하 동작 |
| `CRON_SECRET` | `/api/cron/generate-posts` | 없으면 503, cron이 매일 실패 |
| `PORTFOLIO_DISABLED` / `NEXT_PUBLIC_PORTFOLIO_DISABLED` | 포트폴리오 섹션 숨김 여부 (기본 공개) | 의도와 다르게 공개/비공개될 수 있음 |

- Vercel 프로젝트의 **Root Directory가 `client`**로 설정되어 있는지 확인 (Next.js 앱 기준).

### 4. Cron / 스케줄 확인 (해당 시)

- `client/vercel.json`의 cron 스케줄이 의도한 시각인지 (`0 0 * * *` = UTC 00:00 = KST 09:00).
- Hobby 플랜 제약: 하루 1회, `maxDuration` 60초 초과하지 않는지.

### 5. 최종 확인 및 승인

- 위 항목을 모두 통과했다면 변경사항을 Master에게 요약 보고한다.
- **커밋/푸시/배포는 Master의 명시적 승인 후에만 진행한다** (에이전트가 임의로 푸시하지 않는다).
- 배포 후에는 Vercel → Project → Deployments / Logs에서 즉시 에러가 없는지 한 번 더 확인한다.
