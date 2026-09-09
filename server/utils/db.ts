import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../database/schema'

type Database = ReturnType<typeof drizzle<typeof schema>>

let client: ReturnType<typeof postgres> | undefined
let database: Database | undefined

function resolveUrl() {
  return process.env.DATABASE_URL || String(useRuntimeConfig().databaseUrl || '')
}

function isLoopbackUrl(url: string) {
  try {
    const parsed = new URL(url)
    return parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1' || parsed.hostname === '::1'
  }
  catch {
    return /localhost|127\.0\.0\.1/.test(url)
  }
}

export function throwIfDatabaseError(error: unknown): never {
  const parts: string[] = []
  if (error instanceof Error) parts.push(error.message)
  const cause = error && typeof error === 'object' && 'cause' in error
    ? (error as { cause?: { message?: string, code?: string } }).cause
    : undefined
  if (cause?.message) parts.push(cause.message)
  if (cause?.code) parts.push(cause.code)
  const blob = parts.join(' ')
  if (/ECONNREFUSED|ENOTFOUND|ETIMEDOUT|DATABASE_URL/.test(blob)) {
    throw createError({
      statusCode: 503,
      statusMessage: 'El servicio de datos no está disponible. Intente más tarde.',
    })
  }
  throw error
}

export function useDatabase(): Database {
  if (database) return database

  const url = resolveUrl()
  if (!url) {
    throw createError({
      statusCode: 503,
      statusMessage: 'El servicio de datos no está disponible. Intente más tarde.',
    })
  }

  const onVercel = Boolean(process.env.VERCEL)
  if (onVercel && isLoopbackUrl(url)) {
    throw createError({
      statusCode: 503,
      statusMessage: 'El servicio de datos no está disponible. Intente más tarde.',
    })
  }

  client = postgres(url, {
    max: onVercel ? 1 : 10,
    ssl: isLoopbackUrl(url) ? false : 'require',
  })
  database = drizzle(client, { schema })
  return database
}

export { schema }
