const LOCAL_API_ORIGIN = 'http://localhost:5000'

function normalizeOrigin(value?: string | null): string {
  const trimmed = value?.trim()
  if (!trimmed) return ''
  return trimmed.replace(/\/+$/, '')
}

export function getApiBaseUrl(): string {
  const configuredOrigin = normalizeOrigin(process.env.NEXT_PUBLIC_API_URL)

  if (configuredOrigin) {
    return configuredOrigin
  }

  // In production, default to same-origin so we never call localhost.
  if (process.env.NODE_ENV === 'production') {
    return ''
  }

  return LOCAL_API_ORIGIN
}
