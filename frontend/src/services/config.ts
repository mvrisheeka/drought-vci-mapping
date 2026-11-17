/**
 * Backend configuration. With no VITE_API_BASE_URL the app runs entirely in the
 * browser using the notebook snapshot + demo layers.
 */
const raw = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ?? ''

export const API_BASE_URL: string | null = raw ? raw.replace(/\/+$/, '') : null
export const isApiConfigured = API_BASE_URL !== null
export const API_TIMEOUT_MS = 60_000
