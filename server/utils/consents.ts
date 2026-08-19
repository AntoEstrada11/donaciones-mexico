import { createHmac } from 'node:crypto'
import { desc, eq } from 'drizzle-orm'
import type { H3Event } from 'h3'
import { consents } from '../database/schema'
import type { ConsentRecord, ConsentType } from '~/types'
import { LEGAL } from '../../utils/legal'

/**
 * Huella de la IP para acreditar el consentimiento sin guardar la dirección en claro:
 * la IP es dato personal y no necesitamos poder revertirla, solo compararla.
 */
function hashIp(ip: string | undefined): string | null {
  if (!ip) return null
  const secret = String(useRuntimeConfig().authSecret || 'dev-secret')
  return createHmac('sha256', secret).update(ip).digest('hex').slice(0, 64)
}

interface ConsentContext {
  ipHash: string | null
  userAgent: string | null
}

export function consentContext(event: H3Event): ConsentContext {
  return {
    ipHash: hashIp(getRequestIP(event, { xForwardedFor: true })),
    userAgent: getHeader(event, 'user-agent')?.slice(0, 255) ?? null,
  }
}

export async function recordConsent(input: {
  event: H3Event
  userId?: string | null
  donationId?: string | null
  type: ConsentType
  granted: boolean
}) {
  const db = useDatabase()
  const { ipHash, userAgent } = consentContext(input.event)

  await db.insert(consents).values({
    userId: input.userId ?? null,
    donationId: input.donationId ?? null,
    type: input.type,
    granted: input.granted,
    noticeVersion: LEGAL.noticeVersion,
    ipHash,
    userAgent,
  })
}

/** Registra de una sola vez el paquete que se acepta al registrarse o al donar. */
export async function recordConsentBundle(input: {
  event: H3Event
  userId?: string | null
  donationId?: string | null
  marketing?: boolean
}) {
  const base = { event: input.event, userId: input.userId, donationId: input.donationId }

  await recordConsent({ ...base, type: 'privacy_notice', granted: true })
  await recordConsent({ ...base, type: 'sensitive_data', granted: true })

  if (input.marketing !== undefined) {
    await recordConsent({ ...base, type: 'marketing', granted: input.marketing })
  }
}

export async function listConsentsByUser(userId: string): Promise<ConsentRecord[]> {
  const db = useDatabase()
  const rows = await db
    .select()
    .from(consents)
    .where(eq(consents.userId, userId))
    .orderBy(desc(consents.createdAt))

  return rows.map(row => ({
    id: row.id,
    type: row.type,
    granted: row.granted,
    noticeVersion: row.noticeVersion,
    createdAt: row.createdAt.toISOString(),
  }))
}

/** Última decisión vigente por tipo de consentimiento. */
export async function getLatestConsents(userId: string): Promise<Partial<Record<ConsentType, boolean>>> {
  const rows = await listConsentsByUser(userId)
  const latest: Partial<Record<ConsentType, boolean>> = {}

  for (const row of rows) {
    if (latest[row.type] === undefined) {
      latest[row.type] = row.granted
    }
  }

  return latest
}
