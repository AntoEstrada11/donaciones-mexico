import { createHmac, randomBytes } from 'node:crypto'
import { and, eq, gt, isNull } from 'drizzle-orm'
import { passwordResetTokens, users } from '../database/schema'
import { hashPassword } from './auth'
import { isValidPassword } from '../../utils/fieldLimits'
import { sendMail, siteOriginFallback } from './mail'

const RESET_TTL_MS = 24 * 60 * 60 * 1000

function resetSecret() {
  return String(useRuntimeConfig().authSecret || 'dev-secret')
}

export function hashResetToken(token: string): string {
  return createHmac('sha256', resetSecret()).update(token).digest('hex')
}

export function generateResetToken(): string {
  return randomBytes(32).toString('base64url')
}

async function persistResetToken(
  targetUserId: string,
  actorUserId: string | null,
): Promise<{ token: string, expiresAt: Date }> {
  const token = generateResetToken()
  const tokenHash = hashResetToken(token)
  const expiresAt = new Date(Date.now() + RESET_TTL_MS)
  const db = useDatabase()

  await db.transaction(async (tx) => {
    await tx
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(and(
        eq(passwordResetTokens.userId, targetUserId),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, new Date()),
      ))

    await tx.insert(passwordResetTokens).values({
      userId: targetUserId,
      tokenHash,
      expiresAt,
      createdByUserId: actorUserId,
    })
  })

  return { token, expiresAt }
}

export async function createPasswordResetLink(
  targetUserId: string,
  actorUserId: string | null,
  origin: string,
): Promise<{ resetUrl: string, expiresAt: string, emailed: boolean }> {
  const user = await findUserById(targetUserId)
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'Usuario no encontrado' })
  }

  if (user.role === 'admin') {
    throw createError({
      statusCode: 400,
      statusMessage: 'No se puede enviar restablecimiento a cuentas de administrador global',
    })
  }

  const { token, expiresAt } = await persistResetToken(targetUserId, actorUserId)
  const base = siteOriginFallback(origin)
  const resetUrl = `${base}/restablecer-contrasena?token=${encodeURIComponent(token)}`

  const { sent } = await sendMail({
    to: user.email,
    subject: 'Restablecer contraseña — Donaciones IURD México',
    text: `Use este enlace para restablecer su contraseña (válido 24 horas):\n\n${resetUrl}\n\nSi usted no lo solicitó, ignore este mensaje.`,
    html: `<p>Restablezca su contraseña con este enlace (válido 24 horas):</p><p><a href="${resetUrl}">Restablecer contraseña</a></p><p>Si usted no lo solicitó, ignore este mensaje.</p>`,
  })

  return {
    resetUrl,
    expiresAt: expiresAt.toISOString(),
    emailed: sent,
  }
}

/** Olvidé mi contraseña: no revela si el correo existe. */
export async function requestPasswordResetByEmail(
  email: string,
  origin: string,
): Promise<{ ok: true }> {
  const user = await findUserByEmail(email)
  if (user && user.role !== 'admin') {
    await createPasswordResetLink(user.id, null, origin)
  }
  return { ok: true }
}

export async function consumePasswordResetToken(
  token: string,
  newPassword: string,
): Promise<void> {
  if (!isValidPassword(newPassword)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'La contraseña no cumple los requisitos',
    })
  }

  const tokenHash = hashResetToken(token.trim())
  const db = useDatabase()
  const now = new Date()

  const [row] = await db
    .select()
    .from(passwordResetTokens)
    .where(and(
      eq(passwordResetTokens.tokenHash, tokenHash),
      isNull(passwordResetTokens.usedAt),
      gt(passwordResetTokens.expiresAt, now),
    ))
    .limit(1)

  if (!row) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El enlace no es válido o ya expiró',
    })
  }

  const passwordHash = hashPassword(newPassword)

  await db.transaction(async (tx) => {
    await tx
      .update(passwordResetTokens)
      .set({ usedAt: now })
      .where(eq(passwordResetTokens.id, row.id))

    await tx
      .update(users)
      .set({ passwordHash, updatedAt: now })
      .where(eq(users.id, row.userId))
  })
}
