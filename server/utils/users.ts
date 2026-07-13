import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import type { AppUser } from '~/types'

const USERS_DIR = join(process.cwd(), 'server', 'data')
const USERS_FILE = join(USERS_DIR, 'users.json')

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

/** Solo dígitos, para comparar teléfonos. */
export function normalizePhone(phone: string) {
  return phone.replace(/\D/g, '')
}

async function readUsers(): Promise<AppUser[]> {
  try {
    const raw = await readFile(USERS_FILE, 'utf8')
    const parsed = JSON.parse(raw) as AppUser[]
    return Array.isArray(parsed) ? parsed : []
  }
  catch {
    return []
  }
}

async function writeUsers(users: AppUser[]) {
  await mkdir(USERS_DIR, { recursive: true })
  await writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf8')
}

export async function findUserByEmail(email: string): Promise<AppUser | null> {
  const users = await readUsers()
  const key = normalizeEmail(email)
  return users.find(u => u.email === key || u.id === key) ?? null
}

export async function findUserById(id: string): Promise<AppUser | null> {
  return findUserByEmail(id)
}

export async function findUserByPhone(phone: string, excludeEmail?: string): Promise<AppUser | null> {
  const digits = normalizePhone(phone)
  if (!digits) return null

  const users = await readUsers()
  return users.find((u) => {
    if (!u.phone) return false
    if (excludeEmail && u.email === normalizeEmail(excludeEmail)) return false
    return normalizePhone(u.phone) === digits
  }) ?? null
}

export async function createUser(user: AppUser): Promise<AppUser> {
  const users = await readUsers()
  const email = normalizeEmail(user.email)

  if (users.some(u => u.email === email || u.id === email)) {
    throw createError({ statusCode: 409, statusMessage: 'Este correo ya está registrado' })
  }

  if (user.phone) {
    const digits = normalizePhone(user.phone)
    if (digits && users.some(u => u.phone && normalizePhone(u.phone) === digits)) {
      throw createError({ statusCode: 409, statusMessage: 'Este teléfono ya está registrado' })
    }
  }

  const next: AppUser = {
    ...user,
    id: email,
    email,
  }
  users.push(next)
  await writeUsers(users)
  return next
}

export async function updateUser(
  emailOrId: string,
  patch: Partial<Pick<AppUser, 'name' | 'phone' | 'profileComplete' | 'odooPartnerId'>>,
): Promise<AppUser> {
  const users = await readUsers()
  const key = normalizeEmail(emailOrId)
  const index = users.findIndex(u => u.email === key || u.id === key)

  if (index < 0) {
    throw createError({ statusCode: 404, statusMessage: 'Usuario no encontrado' })
  }

  if (patch.phone !== undefined && patch.phone) {
    const digits = normalizePhone(patch.phone)
    const taken = users.some((u, i) =>
      i !== index && u.phone && normalizePhone(u.phone) === digits,
    )
    if (taken) {
      throw createError({ statusCode: 409, statusMessage: 'Este teléfono ya está registrado' })
    }
  }

  users[index] = { ...users[index], ...patch }
  await writeUsers(users)
  return users[index]
}
