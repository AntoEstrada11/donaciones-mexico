interface HubTokenResponse {
  access_token: string
  refresh_token: string
  role: string
  app_code: string
  permissions: string[]
}

interface HubMeResponse {
  user: {
    id: string
    email: string
    full_name: string
    is_active: boolean
    is_superadmin: boolean
  }
  memberships: Array<{ app_code: string, role: string, is_active: boolean }>
}

function hubBaseUrl(): string {
  return String(useRuntimeConfig().public.authHubUrl || '').replace(/\/$/, '')
}

export function isAuthHubEnabled(): boolean {
  const url = hubBaseUrl()
  return url.startsWith('https://') || url.startsWith('http://')
}

async function hubFetch(path: string, init: RequestInit = {}) {
  const base = hubBaseUrl()
  if (!base) {
    throw createError({ statusCode: 503, statusMessage: 'Auth Hub no está configurado' })
  }

  const response = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  })

  return response
}

const PLATFORM_APP_CODES = ['auth-hub', 'hub', 'web-hub', 'web-auth-hub']

export async function loginOnAuthHub(email: string, password: string): Promise<HubTokenResponse> {
  const appCode = String(useRuntimeConfig().public.appCode || 'donaciones')
  const appCodes = [appCode, ...PLATFORM_APP_CODES.filter(code => code !== appCode)]

  let lastStatus = 0
  for (const code of appCodes) {
    const response = await hubFetch('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, app_code: code }),
    })
    lastStatus = response.status

    if (response.ok) {
      return await response.json() as HubTokenResponse
    }

    if (response.status === 401) {
      throw createError({ statusCode: 401, statusMessage: 'Correo o contraseña incorrectos' })
    }

    // 403 suele ser “sin membresía en esta app”: un superadmin puede entrar por otra app del hub.
    if (response.status !== 403) {
      throw createError({ statusCode: 502, statusMessage: 'No se pudo validar el acceso en Auth Hub' })
    }
  }

  if (lastStatus === 403) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Esta cuenta no tiene acceso al panel de operación.',
    })
  }

  throw createError({ statusCode: 502, statusMessage: 'No se pudo validar el acceso en Auth Hub' })
}

export async function fetchAuthHubMe(accessToken: string): Promise<HubMeResponse> {
  const response = await hubFetch('/api/v1/auth/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) {
    throw createError({ statusCode: 502, statusMessage: 'No se pudo leer el perfil en Auth Hub' })
  }

  const body = await response.json() as HubMeResponse
  return {
    user: {
      id: String(body.user?.id || ''),
      email: String(body.user?.email || ''),
      full_name: String(body.user?.full_name || ''),
      is_active: Boolean(body.user?.is_active),
      is_superadmin: Boolean(body.user?.is_superadmin),
    },
    memberships: Array.isArray(body.memberships) ? body.memberships : [],
  }
}

const OPERATOR_ROLES = new Set(['admin', 'superadmin', 'owner'])

function isOperatorRole(role: string) {
  return OPERATOR_ROLES.has(role.trim().toLowerCase())
}

export function mapHubRole(input: {
  tokenRole: string
  isSuperadmin: boolean
  memberships: HubMeResponse['memberships']
  permissions?: string[]
}): 'admin' | 'donor' {
  if (input.isSuperadmin) return 'admin'
  if (isOperatorRole(input.tokenRole)) return 'admin'
  if ((input.permissions || []).some(code => isOperatorRole(code) || code === '*')) return 'admin'

  const appCode = String(useRuntimeConfig().public.appCode || 'donaciones')
  const membership = input.memberships.find(item => item.app_code === appCode && item.is_active)
  if (membership && isOperatorRole(membership.role)) return 'admin'

  return 'donor'
}
