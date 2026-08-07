import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../database/schema'

type Database = ReturnType<typeof drizzle<typeof schema>>

let client: ReturnType<typeof postgres> | undefined
let database: Database | undefined

function resolveUrl() {
  return process.env.DATABASE_URL || String(useRuntimeConfig().databaseUrl || '')
}

export function useDatabase(): Database {
  if (database) return database

  const url = resolveUrl()
  if (!url) {
    throw createError({
      statusCode: 500,
      statusMessage: 'DATABASE_URL no está configurada',
    })
  }

  client = postgres(url, { max: 10 })
  database = drizzle(client, { schema })
  return database
}

export { schema }
