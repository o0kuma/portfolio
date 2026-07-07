# Neon / Cron 체크리스트

## 트리거 조건

다음 중 하나에 해당하면 이 체크리스트를 따른다:

- `server/migrations/*.sql` 신규 파일을 추가하거나 기존 스키마를 변경할 때
- `client/app/api/cron/generate-posts/route.ts` 또는 `server/scripts/auto-generate-posts.js`를 수정할 때
- `client/vercel.json` (또는 루트 `vercel.json`)의 cron 설정을 변경할 때
- `server/scripts/cleanup-old-posts.js`처럼 Neon 데이터를 직접 조작하는 스크립트를 수정할 때

## 절차

### 1. 마이그레이션 작업 시

1. 새 SQL 파일은 `server/migrations/`에 `add-<feature>.sql` 형식으로 작성한다 (기존 파일 참고: `add-tetris-scores.sql`, `add-posts-source.sql` 등).
2. **자동 실행 스크립트가 없다** — Neon SQL Editor 또는 `psql "$DATABASE_URL" -f server/migrations/<file>.sql`로 **수동 실행**해야 한다.
3. 로컬 개발 DB와 프로덕션(Vercel) DB가 같은 Neon 인스턴스를 쓰는지 확인한다 (`server/.env`의 `DATABASE_URL`). 다르면 양쪽 모두 실행해야 한다.
4. 마이그레이션 후 관련 API 라우트(`config/db.js`를 통해 `pg` 드라이버 사용)가 새 컬럼/테이블을 정상적으로 읽는지 로컬에서 확인한다.
5. 기존 `*-supabase.js` 이름의 파일이라도 실제로는 `pg` 드라이버를 쓴다는 점을 기억한다 (마이그레이션 중인 레거시 네이밍).

### 2. Cron 라우트 수정 시

1. `GET /api/cron/generate-posts`는 프로덕션에서 `Authorization: Bearer <CRON_SECRET>` 헤더가 없으면 **503**을 반환한다. 로컬 테스트 시에는 `CRON_SECRET` 없이도 동작하는지, 프로덕션 로직과 분기가 올바른지 확인한다.
2. Vercel Hobby 플랜 제약을 유지한다: **cron은 하루 1회**, `maxDuration` **60초** 이내. 한 번 실행에 여러 포스트를 생성하도록 바꾸지 않는다 (기존 정책: 카테고리 로테이션으로 1회 1건).
3. `GEMINI_API_KEY`가 없을 때 키워드 템플릿 fallback으로 정상 동작하는지 확인한다 (500 에러로 cron 자체가 실패하면 안 됨).
4. 수정 후 로컬에서 수동 실행으로 검증한다:

   ```bash
   node server/scripts/auto-generate-posts.js general 1
   ```

### 3. Cleanup 스크립트 수정 시

1. `cleanup-old-posts.js`는 **수동 실행 전용**이며 cron에 연결되어 있지 않다. 자동 스케줄링을 추가하려면 Master에게 먼저 확인한다.
2. 삭제 대상은 `source = 'cron'`이면서 **비추천(non-featured)**, 15일 초과 글만이다. 수동 작성 글은 절대 삭제 대상이 아니어야 한다 — 이 조건을 변경했다면 `--confirm` 없이 dry-run으로 먼저 결과를 확인한다.
3. 실제 삭제는 `--confirm` 플래그가 있을 때만 실행되는지 재확인한다.

### 4. 배포 전 최종 확인

- Vercel Production 환경변수: `DATABASE_URL`, `GEMINI_API_KEY`, `CRON_SECRET` 3종이 모두 설정되어 있는지.
- Vercel Cron 설정(`client/vercel.json`)의 스케줄이 `0 0 * * *`(UTC, 09:00 KST)로 의도한 대로인지.
- 실패 시 디버깅: Vercel → Project → Cron Jobs / Logs에서 401(시크릿 불일치), 503(시크릿 누락), 500/502(DB/Gemini/타임아웃)를 구분해서 확인한다.
