import { and, eq, ne, sql } from 'drizzle-orm'
import { donorProfiles, users } from '../database/schema'
import type { AppUser, DonorProfile } from '~/types'
import {
  FIELD_LIMITS,
  isValidName,
  isValidPhone,
  isValidRfc,
  isValidZip,
  sanitizeCityInput,
  sanitizeNameInput,
  sanitizePhoneInput,
  sanitizeRfcInput,
  sanitizeStateInput,
  sanitizeStreetInput,
  sanitizeZipInput,
} from '../../utils/fieldLimits'

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

/** Solo dígitos, para comparar teléfonos capturados en distintos formatos. */
export function normalizePhone(phone: string) {
  return phone.replace(/\D/g, '')
}

export interface ProfileInput {
  name?: string
  phone?: string | null
  wantsReceipt?: boolean
  street?: string | null
  city?: string | null
  state?: string | null
  zip?: string | null
  rfc?: string | null
}

function toAppUser(row: typeof users.$inferSelect): AppUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    passwordHash: row.passwordHash,
    role: row.role,
    profileComplete: row.profileComplete,
    createdAt: row.createdAt.toISOString(),
  }
}

export async function findUserByEmail(email: string): Promise<AppUser | null> {
  const db = useDatabase()
  const [row] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizeEmail(email)))
    .limit(1)

  return row ? toAppUser(row) : null
}

export async function findUserById(id: string): Promise<AppUser | null> {
  const db = useDatabase()
  const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1)
  return row ? toAppUser(row) : null
}

export async function createUser(input: {
  email: string
  name: string
  passwordHash: string
}): Promise<AppUser> {
  const db = useDatabase()
  const email = normalizeEmail(input.email)

  try {
    return await db.transaction(async (tx) => {
      const [row] = await tx
        .insert(users)
        .values({ email, name: input.name, passwordHash: input.passwordHash })
        .returning()

      await tx.insert(donorProfiles).values({ userId: row.id })

      return toAppUser(row)
    })
  }
  catch (error) {
    if (isUniqueViolation(error, 'users_email_key')) {
      throw createError({ statusCode: 409, statusMessage: 'Este correo ya está registrado' })
    }
    throw error
  }
}

export async function getDonorProfile(userId: string): Promise<DonorProfile | null> {
  const db = useDatabase()
  const [row] = await db
    .select({ user: users, profile: donorProfiles })
    .from(users)
    .leftJoin(donorProfiles, eq(donorProfiles.userId, users.id))
    .where(eq(users.id, userId))
    .limit(1)

  if (!row) return null

  return {
    id: row.user.id,
    name: row.user.name,
    email: row.user.email,
    phone: row.profile?.phone ?? null,
    wantsReceipt: row.profile?.wantsReceipt ?? false,
    street: row.profile?.street ?? null,
    city: row.profile?.city ?? null,
    state: row.profile?.state ?? null,
    zip: row.profile?.zip ?? null,
    rfc: row.profile?.rfc ?? null,
    profileComplete: row.user.profileComplete,
  }
}

export async function updateDonorProfile(userId: string, input: ProfileInput): Promise<DonorProfile> {
  const db = useDatabase()

  const current = await getDonorProfile(userId)
  if (!current) {
    throw createError({ statusCode: 404, statusMessage: 'Usuario no encontrado' })
  }

  const name = input.name !== undefined
    ? sanitizeNameInput(input.name).trim()
    : current.name
  if (!isValidName(name)) {
    throw createError({
      statusCode: 400,
      statusMessage: `El nombre es requerido (máximo ${FIELD_LIMITS.name.max} caracteres)`,
    })
  }

  const phoneRaw = input.phone !== undefined
    ? sanitizePhoneInput(input.phone || '').trim() || null
    : current.phone
  const phone = phoneRaw
  const phoneDigits = phone ? normalizePhone(phone) || null : null

  if (phone && !isValidPhone(phone)) {
    throw createError({
      statusCode: 400,
      statusMessage: `El teléfono debe tener entre ${FIELD_LIMITS.phone.minDigits} y ${FIELD_LIMITS.phone.maxDigits} dígitos`,
    })
  }

  if (phoneDigits) {
    const [taken] = await db
      .select({ userId: donorProfiles.userId })
      .from(donorProfiles)
      .where(and(eq(donorProfiles.phoneDigits, phoneDigits), ne(donorProfiles.userId, userId)))
      .limit(1)

    if (taken) {
      throw createError({ statusCode: 409, statusMessage: 'Este teléfono ya está registrado' })
    }
  }

  const wantsReceipt = input.wantsReceipt !== undefined
    ? Boolean(input.wantsReceipt)
    : current.wantsReceipt

  const street = input.street !== undefined
    ? sanitizeStreetInput(input.street || '').trim() || null
    : current.street
  const city = input.city !== undefined
    ? sanitizeCityInput(input.city || '').trim() || null
    : current.city
  const state = input.state !== undefined
    ? sanitizeStateInput(input.state || '').trim() || null
    : current.state
  const zip = input.zip !== undefined
    ? sanitizeZipInput(input.zip || '') || null
    : current.zip
  const rfc = input.rfc !== undefined
    ? sanitizeRfcInput(input.rfc || '') || null
    : current.rfc

  if (wantsReceipt) {
    if (zip && !isValidZip(zip)) {
      throw createError({ statusCode: 400, statusMessage: 'El código postal debe tener 5 dígitos' })
    }

    if (rfc && !isValidRfc(rfc)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'El RFC debe tener 12 o 13 caracteres válidos',
      })
    }
  }

  const profileComplete = Boolean(name && phoneDigits)

  // Minimización: si el donante ya no quiere recibo, no conservamos sus datos fiscales.
  const fiscal = wantsReceipt
    ? { street, city, state, zip, rfc }
    : { street: null, city: null, state: null, zip: null, rfc: null }

  const values = {
    phone,
    phoneDigits,
    wantsReceipt,
    ...fiscal,
    updatedAt: new Date(),
  }

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ name, profileComplete, updatedAt: new Date() })
        .where(eq(users.id, userId))

      await tx
        .insert(donorProfiles)
        .values({ userId, ...values })
        .onConflictDoUpdate({ target: donorProfiles.userId, set: values })
    })
  }
  catch (error) {
    if (isUniqueViolation(error, 'donor_profiles_phone_digits_key')) {
      throw createError({ statusCode: 409, statusMessage: 'Este teléfono ya está registrado' })
    }
    throw error
  }

  const updated = await getDonorProfile(userId)
  return updated as DonorProfile
}

/**
 * Cancelación del titular. El esquema hace el resto: `donor_profiles` cae en cascada,
 * las donaciones quedan con `user_id` nulo (obligación contable) y los consentimientos
 * sobreviven anonimizados como evidencia de que se otorgaron.
 */
export async function deleteUserAccount(userId: string): Promise<void> {
  const db = useDatabase()

  const [{ count } = { count: 0 }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users)
    .where(eq(users.role, 'admin'))

  const user = await findUserById(userId)
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'Usuario no encontrado' })
  }

  if (user.role === 'admin' && count <= 1) {
    throw createError({
      statusCode: 409,
      statusMessage: 'No se puede eliminar la única cuenta de administrador',
    })
  }

  await db.delete(users).where(eq(users.id, userId))
}

interface PgError {
  code?: string
  constraint_name?: string
  cause?: unknown
}

/** Drizzle envuelve los errores del driver, así que hay que recorrer la cadena de causas. */
function findPgError(error: unknown): PgError | null {
  let current = error as PgError | undefined
  for (let depth = 0; current && depth < 5; depth++) {
    if (current.code) return current
    current = current.cause as PgError | undefined
  }
  return null
}

function isUniqueViolation(error: unknown, constraint: string) {
  const pg = findPgError(error)
  return pg?.code === '23505' && pg.constraint_name === constraint
}
