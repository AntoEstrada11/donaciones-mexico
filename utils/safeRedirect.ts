/** Solo rutas relativas del mismo origen (evita open redirect). */
export function safeRedirectPath(raw: unknown, fallback = '/perfil'): string {
  if (typeof raw !== 'string') return fallback

  const path = raw.trim()
  if (!path.startsWith('/') || path.startsWith('//')) return fallback
  if (path.includes('://') || path.includes('\\')) return fallback
  if (/[\n\r\t]/.test(path)) return fallback

  return path
}

const AUTH_REDIRECT_KEY = 'auth-post-login-redirect'

export function rememberAuthRedirect(path: string) {
  if (!import.meta.client) return
  const safe = safeRedirectPath(path, '')
  if (!safe) return
  try {
    sessionStorage.setItem(AUTH_REDIRECT_KEY, safe)
  }
  catch {
    // ignore
  }
}

export function consumeAuthRedirect(fallback = '/perfil'): string {
  if (!import.meta.client) return fallback
  try {
    const stored = sessionStorage.getItem(AUTH_REDIRECT_KEY)
    sessionStorage.removeItem(AUTH_REDIRECT_KEY)
    return safeRedirectPath(stored, fallback)
  }
  catch {
    return fallback
  }
}
