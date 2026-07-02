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

function parseDecision(raw: string): AgentDecision {
  try {
    // 모델이 코드블록으로 감싸는 경우 대비
    const cleaned = raw.trim().replace(/^```json\s*|\s*```$/g, '')
    const data = JSON.parse(cleaned)
    return {
      action: data.action ?? 'move',
      targetAgentId: data.targetAgentId ?? undefined,
      moveTo: data.moveTo ?? undefined,
      tradeAmount: typeof data.tradeAmount === 'number' ? data.tradeAmount : undefined,
      reasoning: typeof data.reasoning === 'string' ? data.reasoning.slice(0, 80) : '',
    }
  } catch {
    return { action: 'move', reasoning: '' }
  }
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
        max_tokens: 200,
        temperature: 0.8,
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
      max_tokens: 200,
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
