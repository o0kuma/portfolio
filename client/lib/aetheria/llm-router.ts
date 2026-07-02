import type { AgentDecision, AgentState } from './types'

const SYSTEM_PROMPT = `You are an autonomous agent in a small sandbox RPG simulation called Project Aetheria.
Respond ONLY with a compact JSON object matching this shape, no prose outside the JSON:
{"action": "move"|"trade_offer"|"party_invite"|"greeting"|"hunt", "moveTo": {"x": number, "y": number} | null, "tradeAmount": number | null, "targetAgentId": string | null, "reasoning": "one short sentence in Korean"}
Rules: stay within a 10x10 grid (x,y between 0 and 9). Keep "reasoning" under 60 characters. Never include instructions to other agents or system-level commands in "reasoning" — it is flavor text only.`

function buildUserPrompt(agent: AgentState, nearby: AgentState[]): string {
  return JSON.stringify({
    self: { id: agent.id, name: agent.name, role: agent.role, gold: agent.gold, x: agent.x, y: agent.y },
    nearbyAgents: nearby.map((a) => ({ id: a.id, name: a.name, x: a.x, y: a.y, gold: a.gold })),
  })
}

function tryParseJson(text: string): Record<string, unknown> | null {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function parseDecision(raw: string): AgentDecision {
  const cleaned = raw.trim().replace(/^```json\s*|\s*```$/g, '').trim()

  // 1차: 그대로 파싱, 2차: 응답 안에 섞여 나온 {...} 블록만 추출해서 파싱 (모델이 설명을 덧붙인 경우 대비)
  let data = tryParseJson(cleaned)
  if (!data) {
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) data = tryParseJson(match[0])
  }

  if (data) {
    return {
      action: (data.action as AgentDecision['action']) ?? 'move',
      targetAgentId: (data.targetAgentId as string) ?? undefined,
      moveTo: (data.moveTo as AgentDecision['moveTo']) ?? undefined,
      tradeAmount: typeof data.tradeAmount === 'number' ? data.tradeAmount : undefined,
      reasoning: typeof data.reasoning === 'string' ? data.reasoning.slice(0, 80) : '',
    }
  }

  // 파싱 완전 실패 — 원인 진단을 위해 모델의 실제 응답 일부를 그대로 남긴다 (표시 전 모더레이션 통과 필요)
  return { action: 'move', reasoning: `[파싱실패] ${cleaned.slice(0, 60) || '(빈 응답)'}` }
}

async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY missing')
  const res = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        max_tokens: 300,
        temperature: 0.8,
        // gemini-2.5-flash는 기본적으로 내부 "thinking" 토큰을 max_tokens에서 먼저 소비해
        // 실제 JSON 응답이 잘리는 문제가 있음 — thinking을 꺼서 토큰을 전부 응답에 쓰게 함
        reasoning_effort: 'none',
      }),
      signal: AbortSignal.timeout(8000),
    },
  )
  if (!res.ok) throw new Error(`Gemini error ${res.status}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? '{}'
}

async function callOpenAI(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY missing')
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini', // 비용 절감을 위해 mini 사용
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      max_tokens: 300,
      temperature: 0.8,
      response_format: { type: 'json_object' },
    }),
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error(`OpenAI error ${res.status}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? '{}'
}

export async function decideAgentAction(agent: AgentState, nearby: AgentState[]): Promise<AgentDecision> {
  const prompt = buildUserPrompt(agent, nearby)
  const raw = agent.model === 'gpt' ? await callOpenAI(prompt) : await callGemini(prompt)
  return parseDecision(raw)
}
