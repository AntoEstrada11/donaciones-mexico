/**
 * Almacén de objetos privados (MinIO / S3-compatible).
 * Solo el servidor Nitro lee y escribe. No hay URLs públicas ni política anónima.
 * Prefijos: identity/{userId}/… y cfdi/{userId}/…
 *
 * Cifrado en la aplicación (AES-256-GCM) antes de subir: el bucket nunca ve el
 * binario en claro. La clave se deriva de NUXT_MINIO_OBJECT_SECRET o, si falta,
 * de NUXT_AUTH_SECRET (rotar ambos invalida lecturas de objetos viejos).
 */
import {
  CreateBucketCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadBucketCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { createCipheriv, createDecipheriv, randomBytes, randomUUID, scryptSync } from 'node:crypto'

export type PrivateObjectKind = 'identity' | 'cfdi'

export interface StoredObject {
  key: string
  body: Buffer
  mime: string
}

const ENC_VERSION = 1
const IV_LEN = 12
const TAG_LEN = 16
const KEY_SALT = 'donaciones-minio-objects-v1'

let client: S3Client | null = null
let bucketReady: Promise<void> | null = null
let derivedKey: Buffer | null = null

function storageConfig() {
  const c = useRuntimeConfig()
  const endpoint = String(c.minioEndpoint || '').trim().replace(/\/$/, '')
  const accessKey = String(c.minioAccessKey || '').trim()
  const secretKey = String(c.minioSecretKey || '').trim()
  const bucket = String(c.minioBucketPrivate || 'donaciones-private').trim()
  const region = String(c.minioRegion || 'us-east-1').trim() || 'us-east-1'
  const objectSecret = String(c.minioObjectSecret || c.authSecret || '').trim()
  return { endpoint, accessKey, secretKey, bucket, region, objectSecret }
}

/** True si hay endpoint y credenciales para hablar con MinIO. */
export function isObjectStorageConfigured(): boolean {
  const { endpoint, accessKey, secretKey } = storageConfig()
  return Boolean(endpoint && accessKey && secretKey)
}

function requireStorageConfig() {
  const cfg = storageConfig()
  if (!cfg.endpoint || !cfg.accessKey || !cfg.secretKey) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Almacenamiento seguro de documentos no configurado',
    })
  }
  if (!cfg.objectSecret || cfg.objectSecret === 'dev-secret-change-me') {
    throw createError({
      statusCode: 503,
      statusMessage: 'Falta secreto de cifrado de objetos (NUXT_MINIO_OBJECT_SECRET o NUXT_AUTH_SECRET)',
    })
  }
  return cfg
}

function getObjectKeyMaterial(): Buffer {
  if (derivedKey) return derivedKey
  const { objectSecret } = requireStorageConfig()
  derivedKey = scryptSync(objectSecret, KEY_SALT, 32)
  return derivedKey
}

/** Empaqueta: version(1) + iv(12) + tag(16) + ciphertext */
function encryptPayload(plain: Buffer): Buffer {
  const iv = randomBytes(IV_LEN)
  const cipher = createCipheriv('aes-256-gcm', getObjectKeyMaterial(), iv)
  const ciphertext = Buffer.concat([cipher.update(plain), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([Buffer.from([ENC_VERSION]), iv, tag, ciphertext])
}

function decryptPayload(packed: Buffer): Buffer {
  if (packed.length < 1 + IV_LEN + TAG_LEN + 1) {
    throw createError({ statusCode: 500, statusMessage: 'Objeto cifrado corrupto' })
  }
  const version = packed[0]
  if (version !== ENC_VERSION) {
    throw createError({ statusCode: 500, statusMessage: 'Versión de cifrado no soportada' })
  }
  const iv = packed.subarray(1, 1 + IV_LEN)
  const tag = packed.subarray(1 + IV_LEN, 1 + IV_LEN + TAG_LEN)
  const ciphertext = packed.subarray(1 + IV_LEN + TAG_LEN)
  const decipher = createDecipheriv('aes-256-gcm', getObjectKeyMaterial(), iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(ciphertext), decipher.final()])
}

function getClient(): S3Client {
  if (client) return client
  const cfg = requireStorageConfig()
  client = new S3Client({
    endpoint: cfg.endpoint,
    region: cfg.region,
    credentials: {
      accessKeyId: cfg.accessKey,
      secretAccessKey: cfg.secretKey,
    },
    forcePathStyle: true,
  })
  return client
}

async function ensurePrivateBucket(): Promise<void> {
  if (bucketReady) return bucketReady
  bucketReady = (async () => {
    const { bucket } = requireStorageConfig()
    const s3 = getClient()
    try {
      await s3.send(new HeadBucketCommand({ Bucket: bucket }))
    }
    catch {
      await s3.send(new CreateBucketCommand({ Bucket: bucket }))
    }
  })()
  try {
    await bucketReady
  }
  catch (err) {
    bucketReady = null
    throw err
  }
}

export function buildPrivateObjectKey(
  kind: PrivateObjectKind,
  userId: string,
  filename: string,
): string {
  const safeUser = userId.replace(/[^a-zA-Z0-9-]/g, '')
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
  return `${kind}/${safeUser}/${safeName}`
}

export function newIdentityObjectKey(userId: string, side: string, ext: string): string {
  const cleanExt = ext.startsWith('.') ? ext : `.${ext}`
  return buildPrivateObjectKey('identity', userId, `${side}-${randomUUID()}${cleanExt}.enc`)
}

export function newCfdiObjectKey(userId: string, donationId: string): string {
  return buildPrivateObjectKey('cfdi', userId, `${donationId}-${randomUUID()}.pdf.enc`)
}

export async function putPrivateObject(input: {
  key: string
  body: Buffer
  mime: string
}): Promise<void> {
  await ensurePrivateBucket()
  const { bucket } = requireStorageConfig()
  const encrypted = encryptPayload(input.body)
  await getClient().send(new PutObjectCommand({
    Bucket: bucket,
    Key: input.key,
    Body: encrypted,
    ContentType: 'application/octet-stream',
    Metadata: {
      // Solo tipo MIME original; sin nombre ni correo.
      'x-plain-mime': input.mime.slice(0, 64),
    },
    CacheControl: 'private, no-store',
  }))
}

export async function getPrivateObject(key: string): Promise<StoredObject | null> {
  await ensurePrivateBucket()
  const { bucket } = requireStorageConfig()
  try {
    const out = await getClient().send(new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }))
    const bytes = await out.Body?.transformToByteArray()
    if (!bytes) return null
    const packed = Buffer.from(bytes)
    const plain = decryptPayload(packed)
    const mime = out.Metadata?.['x-plain-mime']
      || out.Metadata?.['X-Plain-Mime']
      || 'application/octet-stream'
    return { key, body: plain, mime }
  }
  catch (err: unknown) {
    const name = err && typeof err === 'object' && 'name' in err ? String((err as { name: string }).name) : ''
    if (name === 'NoSuchKey' || name === 'NotFound') return null
    throw err
  }
}

export async function deletePrivateObject(key: string): Promise<void> {
  if (!key || !isObjectStorageConfigured()) return
  await ensurePrivateBucket()
  const { bucket } = requireStorageConfig()
  await getClient().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
}

/**
 * Borra todos los objetos del titular bajo identity/ y cfdi/ (cancelación ARCO).
 * No registra userId en logs.
 */
export async function purgePrivateObjectsForUser(userId: string): Promise<void> {
  if (!isObjectStorageConfigured()) return
  await ensurePrivateBucket()
  const { bucket } = requireStorageConfig()
  const s3 = getClient()
  const prefixes = [
    `${buildPrivateObjectKey('identity', userId, '').replace(/\/$/, '')}/`,
    `${buildPrivateObjectKey('cfdi', userId, '').replace(/\/$/, '')}/`,
  ]

  for (const Prefix of prefixes) {
    let ContinuationToken: string | undefined
    do {
      const listed = await s3.send(new ListObjectsV2Command({
        Bucket: bucket,
        Prefix,
        ContinuationToken,
      }))
      const keys = (listed.Contents || [])
        .map(obj => obj.Key)
        .filter((k): k is string => Boolean(k))
      if (keys.length) {
        await s3.send(new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: {
            Objects: keys.map(Key => ({ Key })),
            Quiet: true,
          },
        }))
      }
      ContinuationToken = listed.IsTruncated ? listed.NextContinuationToken : undefined
    } while (ContinuationToken)
  }
}
