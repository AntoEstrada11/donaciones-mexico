import { and, eq } from 'drizzle-orm'
import { identityDocuments } from '../database/schema'
import { FIELD_LIMITS } from '../../utils/fieldLimits'
import type { IdentitySide, IdentityStatus } from '~/types'
import {
  deletePrivateObject,
  getPrivateObject,
  isObjectStorageConfigured,
  newIdentityObjectKey,
  putPrivateObject,
} from './objectStorage'

const ALLOWED = new Set<string>(FIELD_LIMITS.identityImage.mimeTypes)

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
}

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
  if (!isObjectStorageConfigured()) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Almacenamiento seguro de identificación no disponible',
    })
  }

  const ext = MIME_TO_EXT[input.mime] || '.jpg'
  const objectKey = newIdentityObjectKey(input.userId, input.side, ext)

  const db = useDatabase()
  const [previous] = await db
    .select({ objectKey: identityDocuments.objectKey })
    .from(identityDocuments)
    .where(and(
      eq(identityDocuments.userId, input.userId),
      eq(identityDocuments.side, input.side),
    ))
    .limit(1)

  await putPrivateObject({
    key: objectKey,
    body: input.bytes,
    mime: input.mime,
  })

  await db
    .insert(identityDocuments)
    .values({
      userId: input.userId,
      side: input.side,
      mime: input.mime,
      objectKey,
    })
    .onConflictDoUpdate({
      target: [identityDocuments.userId, identityDocuments.side],
      set: {
        mime: input.mime,
        objectKey,
        createdAt: new Date(),
      },
    })

  if (previous?.objectKey && previous.objectKey !== objectKey) {
    await deletePrivateObject(previous.objectKey).catch(() => undefined)
  }
}

export async function getIdentityFile(userId: string, side: IdentitySide) {
  const db = useDatabase()
  const [row] = await db
    .select()
    .from(identityDocuments)
    .where(and(eq(identityDocuments.userId, userId), eq(identityDocuments.side, side)))
    .limit(1)
  if (!row) return null

  if (row.objectKey) {
    const obj = await getPrivateObject(row.objectKey)
    if (!obj) return null
    return { mime: row.mime || obj.mime, bytes: obj.body, objectKey: row.objectKey }
  }

  // Filas legadas con BYTEA (antes de MinIO).
  if (row.bytes) {
    return { mime: row.mime, bytes: row.bytes, objectKey: null as string | null }
  }

  return null
}

/** Bytes de ambos lados para el paquete ARCO (acceso). */
export async function listIdentityFilesForExport(userId: string) {
  const sides: IdentitySide[] = ['front', 'back']
  const out: Array<{ side: IdentitySide, mime: string, base64: string }> = []
  for (const side of sides) {
    const file = await getIdentityFile(userId, side)
    if (file) {
      out.push({
        side,
        mime: file.mime,
        base64: Buffer.from(file.bytes).toString('base64'),
      })
    }
  }
  return out
}
