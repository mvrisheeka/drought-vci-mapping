import { API_BASE_URL, API_TIMEOUT_MS } from './config'

export class ApiError extends Error {
  readonly status: number | null
  constructor(message: string, status: number | null = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type Query = Record<string, string | number | undefined>

function buildUrl(path: string, query?: Query) {
  if (!API_BASE_URL) throw new ApiError('Backend is not configured (VITE_API_BASE_URL is empty).')
  const qs = query
    ? Object.entries(query)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join('&')
    : ''
  return `${API_BASE_URL}${path}${qs ? `?${qs}` : ''}`
}

async function request<T>(method: 'GET' | 'POST', path: string, opts: { query?: Query; body?: unknown } = {}): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS)
  try {
    const res = await fetch(buildUrl(path, opts.query), {
      method,
      headers: opts.body ? { 'Content-Type': 'application/json' } : undefined,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      signal: controller.signal,
    })
    if (!res.ok) {
      let detail = res.statusText
      try {
        const j = await res.json()
        detail = j.detail ?? detail
      } catch {
        /* non-JSON error body */
      }
      throw new ApiError(`${method} ${path} failed: ${detail}`, res.status)
    }
    return (await res.json()) as T
  } catch (err) {
    if (err instanceof ApiError) throw err
    throw new ApiError(err instanceof Error && err.name === 'AbortError' ? 'Request timed out' : 'Backend unreachable')
  } finally {
    clearTimeout(timer)
  }
}

export const apiClient = {
  get: <T>(path: string, query?: Query) => request<T>('GET', path, { query }),
  post: <T>(path: string, body: unknown) => request<T>('POST', path, { body }),
  url: buildUrl,
}
