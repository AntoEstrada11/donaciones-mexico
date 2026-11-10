/**
 * Asigna rol editor (Personalizar: carrusel/pie) por correo.
 * Uso: npm run db:promote-editor -- correo@mx.universal.org
 */
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { users } from './schema.ts'
import { isInstitutionalStaffEmail, STAFF_EMAIL_DOMAIN } from '../../utils/staffEmail.ts'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('Falta DATABASE_URL.')
  process.exit(1)
}

const args = process.argv.slice(2)
const allowAny = args.includes('--allow-any')
const email = args.find(arg => !arg.startsWith('--'))?.trim().toLowerCase()
if (!email) {
  console.error(`Pase un correo: npm run db:promote-editor -- correo@${STAFF_EMAIL_DOMAIN}`)
  process.exit(1)
}

if (!allowAny && !isInstitutionalStaffEmail(email)) {
  console.error(`Solo correos @${STAFF_EMAIL_DOMAIN} (use --allow-any solo en emergencia local).`)
  process.exit(1)
}

const client = postgres(url, { max: 1 })
const db = drizzle(client)

try {
  const [row] = await db
    .update(users)
    .set({ role: 'editor', updatedAt: new Date() })
    .where(eq(users.email, email))
    .returning({ id: users.id, email: users.email, role: users.role })

  if (!row) {
    console.error(`No existe un usuario con correo ${email}`)
    process.exit(1)
  }

  console.log(`Editor listo: ${row.email} (${row.id}) role=${row.role}`)
}
finally {
  await client.end()
}
