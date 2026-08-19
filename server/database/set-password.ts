/**
 * Actualiza la contraseña de un usuario por correo (scrypt, mismo formato que el registro).
 * Uso: NEW_PASSWORD='...' npm run db:set-password -- correo@ejemplo.com
 * Crea la cuenta admin si no existe: añada --create
 * Si no se pasa correo, usa ADMIN_EMAIL del .env.
 */
import { randomBytes, scryptSync } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { donorProfiles, users } from './schema.ts'
import { FIELD_LIMITS, isValidEmail, isValidPassword } from '../../utils/fieldLimits.ts'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('Falta DATABASE_URL.')
  process.exit(1)
}

const args = process.argv.slice(2)
const createIfMissing = args.includes('--create')
const emailArg = args.find(arg => !arg.startsWith('--'))?.trim().toLowerCase()
const email = emailArg || process.env.ADMIN_EMAIL?.trim().toLowerCase()
const password = process.env.NEW_PASSWORD ?? ''

if (!email || !isValidEmail(email)) {
  console.error('Pase un correo: NEW_PASSWORD=\'...\' npm run db:set-password -- correo@ejemplo.com')
  console.error('O defina ADMIN_EMAIL en .env')
  process.exit(1)
}

if (!isValidPassword(password)) {
  console.error(`Defina NEW_PASSWORD (entre ${FIELD_LIMITS.password.min} y ${FIELD_LIMITS.password.max} caracteres).`)
  console.error('No la escriba en .env ni la deje en el historial del shell si puede evitarlo.')
  process.exit(1)
}

function hashPassword(value: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(value, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

const client = postgres(url, { max: 1 })
const db = drizzle(client)
const passwordHash = hashPassword(password)
const now = new Date()

try {
  const [existing] = await db
    .select({ id: users.id, email: users.email, role: users.role })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  if (!existing) {
    if (!createIfMissing) {
      console.error(`No existe un usuario con correo ${email}`)
      console.error('Regístrelo en /registro, o vuelva a correr con --create para dar de alta un admin.')
      process.exit(1)
    }

    const created = await db.transaction(async (tx) => {
      const [row] = await tx
        .insert(users)
        .values({
          email,
          name: 'Administrador',
          passwordHash,
          role: 'admin',
          profileComplete: false,
          updatedAt: now,
        })
        .returning({ id: users.id, email: users.email, role: users.role })

      await tx.insert(donorProfiles).values({ userId: row.id })
      return row
    })

    console.log(`Admin creado: ${created.email} (${created.id}) role=${created.role}`)
    console.log('Inicie sesión de nuevo; no se imprime la contraseña.')
  }
  else {
    const [row] = await db
      .update(users)
      .set({ passwordHash, updatedAt: now })
      .where(eq(users.id, existing.id))
      .returning({ id: users.id, email: users.email, role: users.role })

    console.log(`Contraseña actualizada: ${row.email} (${row.id}) role=${row.role}`)
    console.log('Cierre sesión e inicie de nuevo. No se imprime la contraseña.')
  }
}
finally {
  await client.end()
}
