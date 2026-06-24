const GEMINI_MODEL = process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash'

export function buildPostSummaryPrompt(content: string): string {
  return `다음 블로그 포스트를 한국어로 3줄로 요약해주세요. 불릿 포인트(•)로 작성하세요:\n\n${content.slice(0, 3000)}`
}

export function parseGeminiSummaryResponse(data: unknown): string | null {
  const summary = (data as { choices?: { message?: { content?: string } }[] })
    ?.choices?.[0]?.message?.content?.trim()
  return summary || null
}

/** Generate a short bullet summary via Gemini (JSON API, not streaming chat). */
export async function generatePostSummary(content: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (!apiKey) return null

  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GEMINI_MODEL,
      messages: [{ role: 'user', content: buildPostSummaryPrompt(content) }],
      temperature: 0.5,
      max_tokens: 300,
    }),
  })

  if (!res.ok) return null

  const data = await res.json()
  return parseGeminiSummaryResponse(data)
}
