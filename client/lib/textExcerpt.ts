/** Strips markdown/HTML syntax down to plain text and truncates for use as a meta description. */
export function plainTextExcerpt(content: string, maxLen = 160): string {
  const stripped = content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#*_>`~[\]()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return stripped.length > maxLen ? `${stripped.slice(0, maxLen - 1)}…` : stripped
}
