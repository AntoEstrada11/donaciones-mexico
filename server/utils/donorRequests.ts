import { and, desc, eq } from 'drizzle-orm'
import { donorRequests } from '../database/schema'
import type { DonorRequest, DonorRequestType } from '~/types'
import { isMailConfigured, mailDevReturnLink, sendMail, siteOriginFallback } from './mail'
import { getIdentityStatus } from './identity'
import { issueEmailVerification, isEmailVerified } from './emailVerification'
import { findUserById } from './users'

const RESEND_COOLDOWN_MS = 15 * 60 * 1000
const ALLOWED: DonorRequestType[] = ['identity', 'fiscal', 'email_verify']

function mapRow(row: typeof donorRequests.$inferSelect): DonorRequest {
  return {
    id: row.id,
    type: row.type,
    status: row.status,
    sentAt: row.sentAt?.toISOString() ?? null,
    resolvedAt: row.resolvedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  }
}

export function isDonorRequestType(value: string): value is DonorRequestType {
  return ALLOWED.includes(value as DonorRequestType)
}

export async function listDonorRequests(userId: string, onlyOpen = false): Promise<DonorRequest[]> {
  const db = useDatabase()
  const rows = await db
    .select()
    .from(donorRequests)
    .where(
      onlyOpen
        ? and(eq(donorRequests.userId, userId), eq(donorRequests.status, 'open'))
        : eq(donorRequests.userId, userId),
    )
    .orderBy(desc(donorRequests.createdAt))
    .limit(50)
  return rows.map(mapRow)
}

export async function resolveOpenDonorRequests(userId: string, type: DonorRequestType) {
  const db = useDatabase()
  await db
    .update(donorRequests)
    .set({
      status: 'resolved',
      resolvedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(
      eq(donorRequests.userId, userId),
      eq(donorRequests.type, type),
      eq(donorRequests.status, 'open'),
    ))
}

export async function setDonorRequestStatus(
  userId: string,
  requestId: string,
  status: 'resolved' | 'cancelled',
): Promise<DonorRequest> {
  const db = useDatabase()
  const [row] = await db
    .update(donorRequests)
    .set({
      status,
      resolvedAt: status === 'resolved' ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(and(eq(donorRequests.id, requestId), eq(donorRequests.userId, userId)))
    .returning()

  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'Solicitud no encontrada' })
  }
  return mapRow(row)
}

async function assertRequestNeeded(userId: string, type: DonorRequestType) {
  if (type === 'email_verify') {
    if (await isEmailVerified(userId)) {
      throw createError({ statusCode: 400, statusMessage: 'El correo ya está verificado' })
    }
    return
  }
  if (type === 'identity') {
    const identity = await getIdentityStatus(userId)
    if (identity.complete) {
      throw createError({ statusCode: 400, statusMessage: 'La identificación ya está completa' })
    }
  }
}

function requestCopy(type: DonorRequestType, actionUrl: string) {
  if (type === 'identity') {
    return {
      subject: 'Complete su identificación — Donaciones IURD México',
      text: `Para dar seguimiento a sus donaciones necesitamos las fotos de su INE (anverso y reverso).\n\nComplete aquí:\n${actionUrl}\n`,
      html: `<p>Para dar seguimiento a sus donaciones necesitamos las fotos de su <strong>INE</strong> (anverso y reverso).</p><p><a href="${actionUrl}">Completar identificación</a></p>`,
      path: '/perfil#bloque-identidad',
    }
  }
  if (type === 'fiscal') {
    return {
      subject: 'Complete sus datos fiscales — Donaciones IURD México',
      text: `Le pedimos completar o actualizar sus datos fiscales en su perfil.\n\nComplete aquí:\n${actionUrl}\n`,
      html: `<p>Le pedimos completar o actualizar sus <strong>datos fiscales</strong> en su perfil.</p><p><a href="${actionUrl}">Completar datos fiscales</a></p>`,
      path: '/perfil#bloque-fiscal',
    }
  }
  return {
    subject: 'Confirme su correo — Donaciones IURD México',
    text: '',
    html: '',
    path: '/verificar-correo',
  }
}

export async function createAndSendDonorRequest(input: {
  userId: string
  type: DonorRequestType
  actorUserId: string
  origin?: string
}): Promise<{ request: DonorRequest, sent: boolean, actionUrl?: string }> {
  if (!isDonorRequestType(input.type)) {
    throw createError({ statusCode: 400, statusMessage: 'Tipo de solicitud inválido' })
  }

  const user = await findUserById(input.userId)
  if (!user || user.role !== 'donor') {
    throw createError({ statusCode: 404, statusMessage: 'Donante no encontrado' })
  }

  await assertRequestNeeded(input.userId, input.type)

  const db = useDatabase()
  const [existing] = await db
    .select()
    .from(donorRequests)
    .where(and(
      eq(donorRequests.userId, input.userId),
      eq(donorRequests.type, input.type),
      eq(donorRequests.status, 'open'),
    ))
    .orderBy(desc(donorRequests.createdAt))
    .limit(1)

  if (existing?.sentAt) {
    const elapsed = Date.now() - existing.sentAt.getTime()
    if (elapsed < RESEND_COOLDOWN_MS) {
      const mins = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 60000)
      throw createError({
        statusCode: 429,
        statusMessage: `Espere ${mins} min antes de reenviar esta solicitud`,
      })
    }
  }

  const now = new Date()
  let row = existing
  if (!row) {
    const [created] = await db
      .insert(donorRequests)
      .values({
        userId: input.userId,
        type: input.type,
        status: 'open',
        createdByUserId: input.actorUserId,
        sentAt: now,
        createdAt: now,
        updatedAt: now,
      })
      .returning()
    row = created
  }
  else {
    const [updated] = await db
      .update(donorRequests)
      .set({
        createdByUserId: input.actorUserId,
        sentAt: now,
        updatedAt: now,
      })
      .where(eq(donorRequests.id, row.id))
      .returning()
    row = updated
  }

  if (!row) {
    throw createError({ statusCode: 500, statusMessage: 'No se pudo crear la solicitud' })
  }

  if (input.type === 'email_verify') {
    const result = await issueEmailVerification(input.userId, input.origin)
    return {
      request: mapRow(row),
      sent: result.sent,
      actionUrl: result.verifyUrl,
    }
  }

  const base = siteOriginFallback(input.origin)
  const path = input.type === 'fiscal' ? '/perfil#bloque-fiscal' : '/perfil#bloque-identidad'
  const actionUrl = `${base}${path}`
  const copy = requestCopy(input.type, actionUrl)

  const { sent } = await sendMail({
    to: user.email,
    subject: copy.subject,
    text: copy.text,
    html: copy.html,
  })

  if (!sent && !isMailConfigured() && mailDevReturnLink()) {
    return { request: mapRow(row), sent: false, actionUrl }
  }

  return { request: mapRow(row), sent, actionUrl: sent ? undefined : actionUrl }
}
