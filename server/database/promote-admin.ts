/**
 * Promueve un usuario a admin por correo.
 * Uso: npm run db:promote-admin -- correo@ejemplo.com
 * Si no se pasa correo, usa ADMIN_EMAIL del .env.
 */
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { users } from './schema.ts'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('Falta DATABASE_URL.')
  process.exit(1)
}

const emailArg = process.argv[2]?.trim().toLowerCase()
const email = emailArg || process.env.ADMIN_EMAIL?.trim().toLowerCase()

if (!email) {
  console.error('Pase un correo: npm run db:promote-admin -- correo@ejemplo.com')
  console.error('O defina ADMIN_EMAIL en .env')
  process.exit(1)
}

const client = postgres(url, { max: 1 })
const db = drizzle(client)

try {
  const [row] = await db
    .update(users)
    .set({ role: 'admin', updatedAt: new Date() })
    .where(eq(users.email, email))
    .returning({ id: users.id, email: users.email, role: users.role })

  if (!row) {
    console.error(`No existe un usuario con correo ${email}`)
    process.exit(1)
  }

  console.log(`Admin listo: ${row.email} (${row.id}) role=${row.role}`)
}
finally {
  await client.end()
}
