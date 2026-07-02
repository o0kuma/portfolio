// 로그 스트림 공개 전 경량 필터. 별도 모더레이션 API 호출 없이(비용 절감)
// 금칙어·길이 제한으로 명백히 부적절한 출력만 걸러낸다.

const BANNED_PATTERNS = [
  /ignore (all|previous|prior) instructions/i,
  /system prompt/i,
  /you are now/i,
  /씨발|병신|개새끼|좆/,
  /주민번호|계좌번호|비밀번호/,
]

const MAX_LEN = 200

export function moderateText(raw: string): { ok: boolean; text: string } {
  if (!raw || typeof raw !== 'string') return { ok: false, text: '' }
  const trimmed = raw.trim().slice(0, MAX_LEN)
  const flagged = BANNED_PATTERNS.some((p) => p.test(trimmed))
  if (flagged) return { ok: false, text: '(내용이 필터링되었습니다)' }
  return { ok: true, text: trimmed }
}
