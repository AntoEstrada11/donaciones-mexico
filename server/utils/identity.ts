import { and, eq } from 'drizzle-orm'
import { identityDocuments } from '../database/schema'
import { FIELD_LIMITS } from '../../utils/fieldLimits'
import type { IdentitySide, IdentityStatus } from '~/types'

const ALLOWED = new Set<string>(FIELD_LIMITS.identityImage.mimeTypes)

export function isIdentitySide(value: string): value is IdentitySide {
  return value === 'front' || value === 'back'
}

export async function getIdentityStatus(userId: string): Promise<IdentityStatus> {
  const db = useDatabase()
  const rows = await db
    .select({
      side: identityDocuments.side,
      mime: identityDocuments.mime,
    })
    .from(identityDocuments)
    .where(eq(identityDocuments.userId, userId))

  return {
    front: rows.some(row => row.side === 'front'),
    back: rows.some(row => row.side === 'back'),
    complete: rows.some(row => row.side === 'front') && rows.some(row => row.side === 'back'),
  }
}

export async function saveIdentityImage(input: {
  userId: string
  side: IdentitySide
  mime: string
  bytes: Buffer
}) {
  if (!ALLOWED.has(input.mime)) {
    throw createError({ statusCode: 400, statusMessage: 'Use una foto JPG, PNG o WebP' })
  }
  if (input.bytes.length > FIELD_LIMITS.identityImage.maxBytes) {
    throw createError({ statusCode: 400, statusMessage: 'La foto no debe superar 3 MB' })
  }

  const db = useDatabase()
  await db
    .insert(identityDocuments)
    .values({
      userId: input.userId,
      side: input.side,
      mime: input.mime,
      bytes: input.bytes,
    })
    .onConflictDoUpdate({
      target: [identityDocuments.userId, identityDocuments.side],
      set: {
        mime: input.mime,
        bytes: input.bytes,
        createdAt: new Date(),
      },
    })
}

export async function getIdentityFile(userId: string, side: IdentitySide) {
  const db = useDatabase()
  const [row] = await db
    .select()
    .from(identityDocuments)
    .where(and(eq(identityDocuments.userId, userId), eq(identityDocuments.side, side)))
    .limit(1)
  return row ?? null
}
