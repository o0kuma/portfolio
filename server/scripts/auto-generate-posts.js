/**
 * auto-generate-posts.js
 *
 * Generates blog posts automatically via Gemini API and saves them to Neon DB.
 * Reads GEMINI_API_KEY and DATABASE_URL from server/.env
 *
 * Usage (from repo root):
 *   node server/scripts/auto-generate-posts.js [category] [count]
 *   node server/scripts/auto-generate-posts.js tech 3
 *   node server/scripts/auto-generate-posts.js economy 2
 *   node server/scripts/auto-generate-posts.js all 1   <- one post per category
 *
 * Available categories: tech, economy, coin, travel, general
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { Pool } = require('pg');
const { OpenAI } = require('openai');

// ---------------------------------------------------------------------------
// Category definitions — topics are randomly picked per run
// ---------------------------------------------------------------------------
const CATEGORIES = {
  tech: {
    label: '기술',
    topics: [
      '2026년 AI 코딩 도구 완전 비교: Cursor vs GitHub Copilot vs Claude Code',
      'React 19 새로운 기능 완전 가이드: use() Hook, Server Actions, Compiler',
      'Node.js 22 LTS 실전 업그레이드 가이드',
      'TypeScript 5.x 고급 패턴: 브랜드 타입, 조건부 타입, satisfies 연산자',
      'Bun vs Node.js 2026 성능 비교: 실무에서 교체해야 할까',
      'Next.js 15 App Router 심화: 캐싱 전략, PPR, Turbopack 전환',
      'LLM 앱 개발 입문: LangChain.js로 RAG 파이프라인 구축하기',
      'PostgreSQL 17 새 기능과 Neon 서버리스 활용 가이드',
      'Rust로 배우는 WebAssembly: 브라우저 성능 최적화 실전',
      'Docker Compose에서 Kubernetes로: 소규모팀 마이그레이션 전략',
      '프론트엔드 성능 최적화 2026: Core Web Vitals 100점 달성법',
      'GraphQL vs REST vs tRPC: 2026년 API 설계 선택 가이드',
    ],
  },
  economy: {
    label: '경제',
    topics: [
      '2026년 미국 주식 시장 하반기 전망: 연준 금리와 빅테크 실적',
      '환율 1400원 시대 개인 투자자 포트폴리오 전략',
      'S&P500 ETF 장기 투자 vs 개별 종목: 10년 수익률 비교 분석',
      'AI 반도체 섹터 투자 심층 분석: NVIDIA, AMD, TSMC 현황',
      '인플레이션 시대 부동산 vs 주식: 2026년 자산 배분 전략',
      '달러 예금 vs 채권 ETF: 안전 자산 비교 가이드',
      '개발자 투자 입문: ISA·연금저축 세금 혜택 완전 활용법',
      '글로벌 경기 침체 신호와 방어형 포트폴리오 구성법',
      '테슬라·엔비디아 실적 발표 분석과 AI 관련주 전망',
      '배당주 투자 전략: 월배당 ETF로 수익 파이프라인 만들기',
    ],
  },
  coin: {
    label: '코인',
    topics: [
      '비트코인 10만달러 이후 전망: 2026년 암호화폐 시장 분석',
      '이더리움 레이어2 생태계 비교: Arbitrum vs Optimism vs Base',
      '솔라나(SOL) 생태계 2026: DeFi, NFT, 밈코인 현황 총정리',
      '암호화폐 세금 신고 완전 가이드 (2026년 한국 기준)',
      '비트코인 ETF 투자 가이드: 직접 구매 vs 현물 ETF 비교',
      'DeFi 수익률 파밍 2026: 안전하게 연 10% 이상 달성하는 법',
      '블록체인 기술 실용화 사례: 금융·물류·의료 분야 적용',
      '알트코인 리서치 방법론: 고수익 프로젝트 발굴 체계적 접근법',
    ],
  },
  travel: {
    label: '여행',
    topics: [
      '발리 짱구 워케이션 2026 완벽 가이드: 코워킹·숙소·비용 총정리',
      '치앙마이 디지털 노마드 실전 후기: 한 달 살기 비용과 팁',
      '제주도 개발자 워케이션: 뉴스팟 카페·숙소·인터넷 환경 리뷰',
      '도쿄 IT 컨퍼런스 여행 가이드: JSCONF Japan, PyCon Japan',
      '포르투갈 리스본 워케이션: 유럽 디지털 노마드 수도 탐방기',
      '다낭·호이안 워케이션 총정리: 비자, 인터넷, 숙소, 생활비',
      '국내 워케이션 숨은 명소: 강릉·여수·전주 개발자 추천 스팟',
      '싱가포르 테크 씬 탐방: 스타트업 생태계와 여행 팁 동시에',
    ],
  },
  general: {
    label: '일반',
    topics: [
      '2026년 개발자 필수 생산성 도구 TOP 10: AI 도구부터 노트앱까지',
      '개발자 번아웃 극복기: 징후 파악부터 회복까지 실전 가이드',
      '사이드 프로젝트로 월 100만원 수익 만들기: 현실적인 로드맵',
      '개발자 커리어 5년 플랜: 주니어에서 시니어까지 성장 전략',
      'AI 시대 개발자 생존 전략: 대체되지 않는 능력 키우기',
      '오픈소스 기여 시작하기: 첫 PR부터 메인테이너까지 로드맵',
      '개발자를 위한 글쓰기: 기술 블로그로 퍼스널 브랜딩 구축법',
      '재택근무 4년차 개발자의 루틴: 생산성과 워라밸 동시 잡기',
      '개발자 건강 관리 완전 가이드: 눈·목·손목 보호와 운동 루틴',
      '기술 면접 준비 전략 2026: 알고리즘·시스템 설계·행동 면접',
    ],
  },
};

// ---------------------------------------------------------------------------
// Gemini direct API helper (native REST — OpenAI-compat endpoint has model availability issues)
// ---------------------------------------------------------------------------
const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_BASE = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/** Fix literal control chars inside JSON string values (Gemini quirk). */
function fixJsonControlChars(str) {
  let inString = false;
  let escaped = false;
  let result = '';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (escaped) { result += ch; escaped = false; continue; }
    if (ch === '\\' && inString) { escaped = true; result += ch; continue; }
    if (ch === '"') { inString = !inString; result += ch; continue; }
    if (inString) {
      const cc = ch.charCodeAt(0);
      if (ch === '\n') { result += '\\n'; continue; }
      if (ch === '\r') { result += '\\r'; continue; }
      if (ch === '\t') { result += '\\t'; continue; }
      if (cc < 32) continue; // skip other control chars
    }
    result += ch;
  }
  return result;
}

async function callGeminiRaw(prompt, jsonMode = false) {
  const key = process.env.GEMINI_API_KEY;
  const body = JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.85,
      maxOutputTokens: 8192,
      ...(jsonMode ? { responseMimeType: 'application/json' } : {}),
    },
  });
  const res = await fetch(`${GEMINI_BASE}?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}: ${txt.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// ---------------------------------------------------------------------------
// Database pool
// ---------------------------------------------------------------------------
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ---------------------------------------------------------------------------
// Core functions
// ---------------------------------------------------------------------------

/**
 * Generate a single blog post for the given category and topic hint.
 * Returns { title, content, tags, category }.
 */
async function generatePost(categoryKey, topicHint) {
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const systemPrompt = `당신은 전문 한국어 IT/테크 블로거입니다. 독자는 주로 개발자와 IT 관심자입니다.
반드시 다음 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "title": "흥미롭고 구체적인 포스트 제목",
  "content": "마크다운 형식 본문 (최소 1200자 이상)",
  "tags": ["태그1", "태그2", "태그3", "태그4"]
}`;

  const userPrompt = `오늘 날짜: ${today}
카테고리: ${CATEGORIES[categoryKey].label}
주제 방향: ${topicHint}

위 주제로 고품질 한국어 블로그 포스트를 작성해 주세요.

요구사항:
- 제목: 독자가 클릭하고 싶은 구체적이고 실용적인 제목
- 본문: 최소 1200자 이상의 마크다운 포맷
  * ## 소제목으로 명확하게 구조화
  * 코드 블록, 표, 목록 등 활용하여 가독성 높게
  * 실제 수치, 사례, 실용적 팁 포함
  * 최신 트렌드와 현실적 관점 반영
  * 단순 나열이 아닌 인사이트 있는 내용
- 태그: 3~5개의 핵심 키워드

JSON 형식으로만 응답하세요.`;

  // Step 1: get title + tags as JSON (small payload)
  const metaPrompt = `당신은 한국어 블로그 포스터입니다.
카테고리: ${CATEGORIES[categoryKey].label}
주제 방향: ${topicHint}
오늘 날짜: ${today}

다음 JSON만 출력하세요 (다른 텍스트 없이):
{"title":"흥미롭고 구체적인 한국어 제목","tags":["태그1","태그2","태그3","태그4"]}`;

  const metaRaw = await callGeminiRaw(metaPrompt, true);
  const metaFi = metaRaw.indexOf('{');
  const metaLi = metaRaw.lastIndexOf('}');
  if (metaFi === -1 || metaLi === -1) throw new Error(`메타 JSON 없음: ${metaRaw.slice(0, 100)}`);
  let meta;
  try {
    meta = JSON.parse(fixJsonControlChars(metaRaw.slice(metaFi, metaLi + 1)));
  } catch (e) {
    throw new Error(`메타 JSON 파싱 실패: ${e.message}`);
  }
  const title = String(meta.title || topicHint).trim();
  const tags = Array.isArray(meta.tags) ? meta.tags.slice(0, 5).map(String) : [];

  // Step 2: get full content as plain markdown (no JSON encoding overhead)
  const contentPrompt = `당신은 전문 한국어 IT/테크 블로거입니다.

아래 제목으로 고품질 한국어 블로그 포스트 본문만 마크다운으로 작성해 주세요.
제목: ${title}
카테고리: ${CATEGORIES[categoryKey].label}
오늘 날짜: ${today}

요구사항:
- 최소 1000자 이상
- ## 소제목으로 구조화
- 실용적인 정보, 인사이트 포함
- 서론/본론/결론 구조
- 제목 없이 본문만 출력`;

  const content = await callGeminiRaw(contentPrompt, false);
  if (!content || content.length < 200) throw new Error(`본문 너무 짧음: ${content.length}자`);

  const parsed = { title, content: content.trim(), tags };

  return {
    title: parsed.title,
    content: parsed.content,
    tags: parsed.tags,
    category: categoryKey,
  };
}

/**
 * Check whether a similar title already exists in the last 30 days.
 * Falls back to simple ILIKE check if pg_trgm is unavailable.
 */
async function isDuplicate(client, title) {
  const prefix = title.substring(0, 25);

  // Try pg_trgm similarity first
  try {
    const result = await client.query(
      `SELECT id FROM posts
       WHERE created_at > NOW() - INTERVAL '30 days'
         AND similarity(lower(title), lower($1)) > 0.55
       LIMIT 1`,
      [title]
    );
    return result.rows.length > 0;
  } catch {
    // pg_trgm not available — fall back to ILIKE prefix check
    const result = await client.query(
      `SELECT id FROM posts
       WHERE created_at > NOW() - INTERVAL '30 days'
         AND title ILIKE $1
       LIMIT 1`,
      [`%${prefix}%`]
    );
    return result.rows.length > 0;
  }
}

/**
 * Persist a generated post to the database.
 * Returns the inserted row { id, title, category }.
 */
async function savePost(client, post) {
  const result = await client.query(
    `INSERT INTO posts (title, content, author, category, tags, featured, views, likes, status)
     VALUES ($1, $2, $3, $4, $5::text[], $6, $7, $8, $9)
     RETURNING id, title, category`,
    [
      post.title,
      post.content,
      'iykyk',
      post.category,
      post.tags,
      false,
      0,
      0,
      'published',
    ]
  );
  return result.rows[0];
}

/**
 * Generate `count` posts for a single category.
 * Returns { success, skipped, failed } arrays.
 */
async function generateForCategory(categoryKey, count) {
  const client = await pool.connect();
  const results = { success: [], skipped: [], failed: [] };

  try {
    const topics = [...CATEGORIES[categoryKey].topics].sort(() => Math.random() - 0.5);

    for (let i = 0; i < count; i++) {
      const topicHint = topics[i % topics.length];
      console.log(`\n🤖 생성 중... [${categoryKey}] ${topicHint}`);

      try {
        const post = await generatePost(categoryKey, topicHint);
        console.log(`   제목: "${post.title}"`);
        console.log(`   본문 길이: ${post.content.length}자 | 태그: ${post.tags.join(', ')}`);

        const dup = await isDuplicate(client, post.title);
        if (dup) {
          console.log('   ⏭️  최근 30일 내 유사 제목 발견 — 스킵');
          results.skipped.push(post.title);
          continue;
        }

        const saved = await savePost(client, post);
        console.log(`   ✅ DB 저장 완료 (ID: ${saved.id})`);
        results.success.push({ title: post.title, category: categoryKey, id: saved.id });
      } catch (err) {
        console.error(`   ❌ 오류: ${err.message}`);
        results.failed.push({ topic: topicHint, error: err.message });
      }

      // Throttle: avoid hitting rate limits between requests
      if (i < count - 1) {
        await new Promise((r) => setTimeout(r, 2500));
      }
    }
  } finally {
    client.release();
  }

  return results;
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------
async function main() {
  const [, , categoryArg = 'general', countRaw = '1'] = process.argv;
  const count = Math.max(1, parseInt(countRaw, 10) || 1);
  const isAll = categoryArg === 'all';
  const categoriesToRun = isAll ? Object.keys(CATEGORIES) : [categoryArg];

  // Pre-flight checks
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.trim() === '') {
    console.error('❌ GEMINI_API_KEY가 server/.env에 설정되지 않았습니다.');
    console.error('   Google AI Studio(https://aistudio.google.com/app/apikey)에서 발급 후 추가하세요.');
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL이 server/.env에 설정되지 않았습니다.');
    process.exit(1);
  }
  if (!isAll && !CATEGORIES[categoryArg]) {
    console.error(`❌ 알 수 없는 카테고리: "${categoryArg}"`);
    console.error(`   사용 가능한 카테고리: ${Object.keys(CATEGORIES).join(', ')}, all`);
    process.exit(1);
  }

  console.log('┌─────────────────────────────────────────────┐');
  console.log('│   🚀 자동 블로그 포스트 생성 시스템           │');
  console.log('└─────────────────────────────────────────────┘');
  console.log(`카테고리 : ${isAll ? '전체 (' + Object.keys(CATEGORIES).join(', ') + ')' : categoryArg}`);
  console.log(`포스트 수: ${count}개${isAll ? ' (카테고리당)' : ''}`);
  console.log(`모델     : gemini-2.5-flash-preview-05-20`);
  console.log(`저자     : iykyk  상태: published\n`);

  const total = { success: [], skipped: [], failed: [] };

  for (let ci = 0; ci < categoriesToRun.length; ci++) {
    const cat = categoriesToRun[ci];
    console.log(`\n${'═'.repeat(50)}`);
    console.log(`📂 [${cat.toUpperCase()}] ${CATEGORIES[cat].label}`);
    console.log('═'.repeat(50));

    const result = await generateForCategory(cat, count);
    total.success.push(...result.success);
    total.skipped.push(...result.skipped);
    total.failed.push(...result.failed);

    // Pause between categories to respect rate limits
    if (ci < categoriesToRun.length - 1) {
      console.log('\n⏳ 다음 카테고리까지 3초 대기...');
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  // Final report
  console.log(`\n${'═'.repeat(60)}`);
  console.log('📊 최종 결과 요약');
  console.log('═'.repeat(60));
  console.log(`✅ 생성 성공 : ${total.success.length}개`);
  console.log(`⏭️  중복 스킵 : ${total.skipped.length}개`);
  console.log(`❌ 실패      : ${total.failed.length}개`);

  if (total.success.length > 0) {
    console.log('\n📝 저장된 포스트:');
    total.success.forEach(({ title, category }) => {
      console.log(`   [${category}] ${title}`);
    });
  }

  if (total.failed.length > 0) {
    console.log('\n❌ 실패 상세:');
    total.failed.forEach(({ topic, error }) => {
      console.log(`   • ${topic}`);
      console.log(`     → ${error}`);
    });
  }

  await pool.end();
  console.log('\n✨ 완료!\n');
}

main().catch((err) => {
  console.error('💥 예상치 못한 오류:', err.message);
  process.exit(1);
});
