/**
 * Promueve un usuario a admin por correo.
 * Uso: npm run db:promote-admin -- correo@ejemplo.com
 * Si no se pasa correo, usa ADMIN_EMAIL del .env.
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
const emailArg = args.find(arg => !arg.startsWith('--'))?.trim().toLowerCase()
const email = emailArg || process.env.ADMIN_EMAIL?.trim().toLowerCase()

if (!email) {
  console.error('Pase un correo: npm run db:promote-admin -- correo@mx.universal.org')
  console.error('O defina ADMIN_EMAIL en .env')
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
