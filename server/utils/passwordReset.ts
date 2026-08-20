import { createHmac, randomBytes } from 'node:crypto'
import { and, eq, gt, isNull } from 'drizzle-orm'
import { passwordResetTokens, users } from '../database/schema'
import { hashPassword } from './auth'
import { isValidPassword } from '../../utils/fieldLimits'

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

export async function createPasswordResetLink(
  targetUserId: string,
  actorUserId: string,
  origin: string,
): Promise<{ resetUrl: string, expiresAt: string }> {
  const user = await findUserById(targetUserId)
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'Usuario no encontrado' })
  }

  if (user.role === 'admin') {
    throw createError({
      statusCode: 400,
      statusMessage: 'No se puede enviar restablecimiento a cuentas de administrador',
    })
  }

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

  const base = origin.replace(/\/$/, '')
  return {
    resetUrl: `${base}/restablecer-contrasena?token=${encodeURIComponent(token)}`,
    expiresAt: expiresAt.toISOString(),
  }
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
