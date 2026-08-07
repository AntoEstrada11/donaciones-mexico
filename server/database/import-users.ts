/**
 * Migración única del store en archivo (`server/data/users.json`) a PostgreSQL.
 * Es idempotente: los correos ya presentes se omiten.
 */
import { readFile } from 'node:fs/promises'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { donorProfiles, users } from './schema.ts'

interface LegacyUser {
  id: string
  email: string
  name: string
  phone?: string
  passwordHash: string
  profileComplete?: boolean
  createdAt?: string
}

const SOURCE = './server/data/users.json'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('Falta DATABASE_URL. Copie .env.example a .env y complete la cadena de conexión.')
  process.exit(1)
}

let source: LegacyUser[] = []
try {
  const raw = await readFile(SOURCE, 'utf8')
  const parsed = JSON.parse(raw)
  source = Array.isArray(parsed) ? parsed : []
}
catch {
  console.log(`No se encontró ${SOURCE}; no hay nada que migrar.`)
  process.exit(0)
}

const client = postgres(url, { max: 1 })
const db = drizzle(client)

let imported = 0
let skipped = 0

try {
  for (const legacy of source) {
    const email = legacy.email?.trim().toLowerCase()
    if (!email || !legacy.passwordHash) {
      skipped++
      continue
    }

    const [row] = await db
      .insert(users)
      .values({
        email,
        name: legacy.name || email.split('@')[0],
        passwordHash: legacy.passwordHash,
        profileComplete: Boolean(legacy.profileComplete),
        createdAt: legacy.createdAt ? new Date(legacy.createdAt) : new Date(),
      })
      .onConflictDoNothing({ target: users.email })
      .returning()

    if (!row) {
      skipped++
      continue
    }

    const phone = legacy.phone?.trim() || null
    await db
      .insert(donorProfiles)
      .values({
        userId: row.id,
        phone,
        phoneDigits: phone ? phone.replace(/\D/g, '') || null : null,
      })
      .onConflictDoNothing({ target: donorProfiles.userId })

    imported++
  }

  console.log(`Usuarios migrados: ${imported}. Omitidos (ya existían o inválidos): ${skipped}.`)
}
finally {
  await client.end()
}
