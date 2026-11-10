import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'
import type { UserRole } from '~/types'

export interface SessionPayload {
  /** Id (uuid) del usuario en la tabla `users`. */
  sub: string
  email: string
  name: string
  role: UserRole
  exp: number
}

function getSecret() {
  return String(useRuntimeConfig().authSecret || 'dev-secret')
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const next = scryptSync(password, salt, 64)
  const prev = Buffer.from(hash, 'hex')
  if (next.length !== prev.length) return false
  return timingSafeEqual(next, prev)
}

function b64url(input: string | Buffer) {
  return Buffer.from(input).toString('base64url')
}

function fromB64url(input: string) {
  return Buffer.from(input, 'base64url').toString('utf8')
}

export function normalizeUserRole(role: unknown): UserRole {
  if (role === 'admin' || role === 'editor' || role === 'donor') return role
  return 'donor'
}

export function isStaffRole(role: UserRole | string | null | undefined): boolean {
  return role === 'admin' || role === 'editor'
}

export function signToken(payload: Omit<SessionPayload, 'exp'>, ttlSeconds = 60 * 60 * 24 * 7) {
  const body: SessionPayload = {
    ...payload,
    role: normalizeUserRole(payload.role),
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  }
  const data = b64url(JSON.stringify(body))
  const sig = createHmac('sha256', getSecret()).update(data).digest('base64url')
  return `${data}.${sig}`
}

export function verifyToken(token: string): SessionPayload | null {
  const [data, sig] = token.split('.')
  if (!data || !sig) return null

  const expected = createHmac('sha256', getSecret()).update(data).digest('base64url')
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null

  try {
    const payload = JSON.parse(fromB64url(data)) as SessionPayload
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null
    return {
      ...payload,
      role: normalizeUserRole(payload.role),
    }
  }
  catch {
    return null
  }
}

export function getBearerToken(event: H3Event): string | null {
  const header = getHeader(event, 'authorization')
  if (!header?.startsWith('Bearer ')) return null
  return header.slice(7).trim() || null
}

export function requireSession(event: H3Event): SessionPayload {
  const token = getBearerToken(event)
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'No autenticado' })
  }

  const session = verifyToken(token)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Sesión inválida o expirada' })
  }

  return session
}

/** Valida sesión y que la cuenta donante no esté dada de baja. */
export async function requireActiveSession(event: H3Event): Promise<SessionPayload> {
  const session = requireSession(event)
  await assertDonorAccountActive(session.sub)
  return session
}

/** Sesión cuando exista, sin exigirla: permite donar sin haber iniciado sesión. */
export function optionalSession(event: H3Event): SessionPayload | null {
  const token = getBearerToken(event)
  return token ? verifyToken(token) : null
}

/** El personal opera el panel; no dona con esa cuenta. */
export async function assertNotOperator(session: SessionPayload | null) {
  if (!session) return
  if (isStaffRole(session.role)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'El personal no registra donaciones con esta cuenta.',
    })
  }
  const { findUserById } = await import('./users')
  const row = await findUserById(session.sub)
  if (row && isStaffRole(row.role)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'El personal no registra donaciones con esta cuenta.',
    })
  }
}

/**
 * Revalida el rol en BD (el JWT puede quedar desfasado tras promote/demote).
 * La fila en `users` es la fuente de verdad.
 */
async function requireLiveRole(
  session: SessionPayload,
  allowed: (role: UserRole) => boolean,
  statusMessage: string,
): Promise<SessionPayload> {
  const { findUserById } = await import('./users')
  const row = await findUserById(session.sub)
  const liveRole = normalizeUserRole(row?.role)
  if (!row || !allowed(liveRole)) {
    throw createError({ statusCode: 403, statusMessage })
  }
  return {
    ...session,
    role: liveRole,
    email: row.email,
    name: row.name,
  }
}

/** Admin global: todo el panel. */
export async function requireAdmin(event: H3Event): Promise<SessionPayload> {
  const session = requireSession(event)
  return requireLiveRole(session, role => role === 'admin', 'Se requiere rol de administrador')
}

/** Personal del panel (admin o editor). */
export async function requireStaff(event: H3Event): Promise<SessionPayload> {
  const session = requireSession(event)
  return requireLiveRole(session, isStaffRole, 'Se requiere acceso al panel')
}

/**
 * Contenido público editable: carrusel y pie de contacto.
 * Admin global o editor. Cobros, SPEI bancario y operación siguen en requireAdmin.
 */
export async function requireContentEditor(event: H3Event): Promise<SessionPayload> {
  return requireStaff(event)
}
