import { createHmac, randomBytes } from 'node:crypto'
import { and, eq, gt, isNull } from 'drizzle-orm'
import { emailVerificationTokens, users } from '../database/schema'
import { isMailConfigured, mailDevReturnLink, sendMail, siteOriginFallback } from './mail'

const VERIFY_TTL_MS = 48 * 60 * 60 * 1000

function secret() {
  return String(useRuntimeConfig().authSecret || 'dev-secret')
}

function hashToken(token: string) {
  return createHmac('sha256', secret()).update(token).digest('hex')
}

export async function isEmailVerified(userId: string): Promise<boolean> {
  const db = useDatabase()
  const [row] = await db
    .select({ emailVerifiedAt: users.emailVerifiedAt, role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
  if (!row) return false
  if (row.role === 'admin' || row.role === 'editor') return true
  return Boolean(row.emailVerifiedAt)
}

export async function assertEmailVerified(userId: string): Promise<void> {
  if (await isEmailVerified(userId)) return
  throw createError({
    statusCode: 403,
    statusMessage: 'Confirme su correo electrónico antes de continuar',
  })
}

export async function issueEmailVerification(
  userId: string,
  origin?: string,
): Promise<{ sent: boolean, verifyUrl?: string }> {
  const user = await findUserById(userId)
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'Usuario no encontrado' })
  }
  if (await isEmailVerified(userId)) {
    return { sent: false }
  }

  const token = randomBytes(32).toString('base64url')
  const tokenHash = hashToken(token)
  const expiresAt = new Date(Date.now() + VERIFY_TTL_MS)
  const db = useDatabase()

  await db.transaction(async (tx) => {
    await tx
      .update(emailVerificationTokens)
      .set({ usedAt: new Date() })
      .where(and(
        eq(emailVerificationTokens.userId, userId),
        isNull(emailVerificationTokens.usedAt),
        gt(emailVerificationTokens.expiresAt, new Date()),
      ))
    await tx.insert(emailVerificationTokens).values({
      userId,
      tokenHash,
      expiresAt,
    })
  })

  const base = siteOriginFallback(origin)
  const verifyUrl = `${base}/verificar-correo?token=${encodeURIComponent(token)}`

  const { sent } = await sendMail({
    to: user.email,
    subject: 'Confirme su correo — Donaciones IURD México',
    text: `Confirme su correo abriendo este enlace (válido 48 horas):\n\n${verifyUrl}\n`,
    html: `<p>Confirme su correo para usar donaciones en línea.</p><p><a href="${verifyUrl}">Confirmar correo</a></p><p>El enlace vence en 48 horas.</p>`,
  })

  if (!sent && mailDevReturnLink()) {
    return { sent: false, verifyUrl }
  }
  return { sent }
}

export async function consumeEmailVerificationToken(token: string): Promise<void> {
  const tokenHash = hashToken(token.trim())
  const db = useDatabase()
  const now = new Date()

  const [row] = await db
    .select()
    .from(emailVerificationTokens)
    .where(and(
      eq(emailVerificationTokens.tokenHash, tokenHash),
      isNull(emailVerificationTokens.usedAt),
      gt(emailVerificationTokens.expiresAt, now),
    ))
    .limit(1)

  if (!row) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El enlace no es válido o ya expiró',
    })
  }

  await db.transaction(async (tx) => {
    await tx
      .update(emailVerificationTokens)
      .set({ usedAt: now })
      .where(eq(emailVerificationTokens.id, row.id))
    await tx
      .update(users)
      .set({ emailVerifiedAt: now, updatedAt: now })
      .where(eq(users.id, row.userId))
  })

  await resolveOpenDonorRequests(row.userId, 'email_verify')
}
