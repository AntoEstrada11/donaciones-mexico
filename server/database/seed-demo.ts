/**
 * Semilla de prueba: donantes ficticios + ~1000 donaciones.
 * Uso: npm run db:seed-demo
 *       npm run db:seed-demo -- --force   (borra demos previos y vuelve a cargar)
 *
 * Correos: demo.donante.NNN@example.test
 * Contraseña compartida: DemoTest123
 * Solo para desarrollo local. No usar en producción.
 */
import { randomBytes, scryptSync } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { and, eq, like, sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import {
  campaigns,
  donations,
  donorProfiles,
  users,
} from './schema.ts'
import { classifyDonor, pldThresholdMxn, satReportThresholdMxn } from '../../utils/uma.ts'

const DEMO_EMAIL_PREFIX = 'demo.donante.'
const DEMO_EMAIL_DOMAIN = '@example.test'
const DEMO_PASSWORD = 'DemoTest123'
const DEMO_USER_COUNT = 120
const DEMO_DONATION_COUNT = 1000
const GUEST_DONATION_RATIO = 0.08

const FIRST_NAMES = [
  'Ana', 'Luis', 'María', 'Carlos', 'Sofía', 'Diego', 'Elena', 'Jorge',
  'Patricia', 'Miguel', 'Laura', 'Pedro', 'Carmen', 'Ricardo', 'Gabriela',
  'Fernando', 'Lucia', 'Andrés', 'Valeria', 'Héctor',
]
const LAST_NAMES = [
  'Prueba', 'Demo', 'Ficticio', 'Ejemplo', 'Muestra', 'Ensayo', 'Temporal',
  'Laboratorio', 'Sandbox', 'Simulado',
]
const CITIES = ['CDMX', 'Guadalajara', 'Monterrey', 'Puebla', 'León', 'Tijuana', 'Mérida']
const STATES = ['CDMX', 'Jalisco', 'Nuevo León', 'Puebla', 'Guanajuato', 'Baja California', 'Yucatán']
const AMOUNTS = [50, 100, 150, 200, 250, 300, 500, 750, 1000, 1500, 2000, 2500, 5000, 10000]
const METHODS = ['spei', 'card', 'paypal'] as const
const STATUSES = ['paid', 'paid', 'paid', 'paid', 'pending', 'pending', 'failed', 'cancelled'] as const

interface ChurchRow {
  id: string
  name: string
}

const url = process.env.DATABASE_URL
if (!url) {
  console.error('Falta DATABASE_URL. Copie .env.example a .env.')
  process.exit(1)
}

const force = process.argv.includes('--force')

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

function demoEmail(n: number) {
  return `${DEMO_EMAIL_PREFIX}${String(n).padStart(3, '0')}${DEMO_EMAIL_DOMAIN}`
}

function pick<T>(items: readonly T[], index: number): T {
  return items[index % items.length]!
}

function randomInt(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function daysAgo(maxDays: number) {
  const d = new Date()
  d.setDate(d.getDate() - randomInt(0, maxDays))
  d.setHours(randomInt(8, 21), randomInt(0, 59), randomInt(0, 59), 0)
  return d
}

function fakeRfc(n: number) {
  const yy = String(70 + (n % 30)).padStart(2, '0')
  const mm = String(1 + (n % 12)).padStart(2, '0')
  const dd = String(1 + (n % 28)).padStart(2, '0')
  const homoclave = `D${String(n % 100).padStart(2, '0')}`
  return `DEMO${yy}${mm}${dd}${homoclave}`
}

const client = postgres(url, { max: 1 })
const db = drizzle(client)

try {
  const campaignRows = await db
    .select({ id: campaigns.id, slug: campaigns.slug, name: campaigns.name })
    .from(campaigns)
    .where(eq(campaigns.active, true))

  if (campaignRows.length === 0) {
    console.error('No hay campañas. Ejecute antes: npm run db:seed')
    process.exit(1)
  }

  const churchesRaw = await readFile('./server/data/churches.json', 'utf8')
  const churches = (JSON.parse(churchesRaw) as ChurchRow[]).filter(c => c.id && c.name)
  if (churches.length === 0) {
    console.error('server/data/churches.json vacío o inválido.')
    process.exit(1)
  }

  if (force) {
    const deleted = await db
      .delete(users)
      .where(like(users.email, `${DEMO_EMAIL_PREFIX}%${DEMO_EMAIL_DOMAIN}`))
      .returning({ id: users.id })
    console.log(`--force: eliminados ${deleted.length} usuarios demo (cascade donaciones/perfiles).`)
  }

  const passwordHash = hashPassword(DEMO_PASSWORD)
  const now = new Date()
  const userIds: string[] = []

  for (let i = 1; i <= DEMO_USER_COUNT; i++) {
    const email = demoEmail(i)
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (existing) {
      userIds.push(existing.id)
      continue
    }

    const name = `${pick(FIRST_NAMES, i)} ${pick(LAST_NAMES, i * 3)} ${i}`
    const church = pick(churches, i * 7)
    const wantsReceipt = i % 5 === 0
    const verified = i % 8 !== 0
    const phoneDigits = `55${String(10000000 + i).slice(0, 8)}`

    const created = await db.transaction(async (tx) => {
      const [row] = await tx
        .insert(users)
        .values({
          email,
          name,
          passwordHash,
          role: 'donor',
          status: i % 40 === 0 ? 'deactivated' : 'active',
          profileComplete: true,
          emailVerifiedAt: verified ? now : null,
          updatedAt: now,
        })
        .returning({ id: users.id })

      await tx.insert(donorProfiles).values({
        userId: row.id,
        phone: `55 ${phoneDigits.slice(2, 6)} ${phoneDigits.slice(6)}`,
        phoneDigits,
        wantsReceipt,
        street: wantsReceipt ? `Calle Demo ${i}` : null,
        city: pick(CITIES, i),
        state: pick(STATES, i),
        zip: wantsReceipt ? String(10000 + (i % 80000)).padStart(5, '0') : null,
        colony: wantsReceipt ? 'Col. Prueba' : null,
        rfc: wantsReceipt ? fakeRfc(i) : null,
        fiscalName: wantsReceipt ? name.toUpperCase() : null,
        taxRegime: wantsReceipt ? '612' : null,
        cfdiUse: wantsReceipt ? 'D01' : null,
        complianceStatus: 'rapid',
        homeChurchExternalId: church.id,
        homeChurchName: church.name,
        updatedAt: now,
      })

      return row.id
    })

    userIds.push(created)
  }

  console.log(`Donantes demo listos: ${userIds.length} (contraseña: ${DEMO_PASSWORD}).`)

  const [{ total: existingDemoDonations }] = await db
    .select({ total: sql<number>`count(*)::int`.mapWith(Number) })
    .from(donations)
    .innerJoin(users, eq(donations.userId, users.id))
    .where(like(users.email, `${DEMO_EMAIL_PREFIX}%${DEMO_EMAIL_DOMAIN}`))

  if (!force && Number(existingDemoDonations) >= DEMO_DONATION_COUNT) {
    console.log(
      `Ya hay ${existingDemoDonations} donaciones de usuarios demo (≥ ${DEMO_DONATION_COUNT}). `
      + 'Use --force para recrear.',
    )
  }
  else {
    const batch: Array<typeof donations.$inferInsert> = []
    const guestCount = Math.round(DEMO_DONATION_COUNT * GUEST_DONATION_RATIO)

    for (let i = 0; i < DEMO_DONATION_COUNT; i++) {
      const isGuest = i < guestCount
      const userId = isGuest ? null : userIds[i % userIds.length]!
      const church = pick(churches, i * 11 + 3)
      const campaign = pick(campaignRows, i * 5)
      const method = pick(METHODS, i)
      const status = pick(STATUSES, i * 3)
      const amount = pick(AMOUNTS, i * 13)
      const createdAt = daysAgo(180)
      const paidAt = status === 'paid' ? new Date(createdAt.getTime() + randomInt(5, 120) * 60_000) : null

      let provider: 'spei_manual' | 'mercadopago' | 'paypal' | null = null
      let providerReference: string | null = null
      if (method === 'spei') {
        provider = 'spei_manual'
      }
      else if (method === 'card') {
        provider = 'mercadopago'
        providerReference = status === 'pending' ? null : `demo-mp-${i}`
      }
      else {
        provider = 'paypal'
        providerReference = status === 'pending' ? null : `demo-pp-${i}`
      }

      batch.push({
        userId,
        churchExternalId: String(church.id),
        churchName: church.name,
        campaignId: campaign.id,
        amount: String(amount),
        currency: 'MXN',
        status,
        method,
        provider,
        providerReference,
        providerPaymentId: status === 'paid' && providerReference ? `${providerReference}-pay` : null,
        paidAt,
        createdAt,
        updatedAt: paidAt || createdAt,
      })
    }

    const CHUNK = 100
    for (let offset = 0; offset < batch.length; offset += CHUNK) {
      await db.insert(donations).values(batch.slice(offset, offset + CHUNK))
    }
    console.log(`Donaciones insertadas: ${batch.length} (${guestCount} sin sesión).`)
  }

  // Donantes con montos altos en ventana UMA para probar /admin/alertas
  const heavyUsers = userIds.slice(0, 5)
  const pld = pldThresholdMxn()
  const sat = satReportThresholdMxn()
  for (let h = 0; h < heavyUsers.length; h++) {
    const userId = heavyUsers[h]!
    const target = h < 2 ? sat + 5000 : pld + 5000
    const church = pick(churches, h + 50)
    const campaign = pick(campaignRows, h)
    const chunkAmount = 25000
    const pieces = Math.ceil(target / chunkAmount)
    const rows: Array<typeof donations.$inferInsert> = []
    for (let p = 0; p < pieces; p++) {
      const createdAt = daysAgo(90)
      rows.push({
        userId,
        churchExternalId: String(church.id),
        churchName: church.name,
        campaignId: campaign.id,
        amount: String(chunkAmount),
        currency: 'MXN',
        status: 'paid',
        method: 'spei',
        provider: 'spei_manual',
        paidAt: createdAt,
        createdAt,
        updatedAt: createdAt,
      })
    }
    await db.insert(donations).values(rows)

    const paidInWindow = pieces * chunkAmount
    const [profile] = await db
      .select({ wantsReceipt: donorProfiles.wantsReceipt })
      .from(donorProfiles)
      .where(eq(donorProfiles.userId, userId))
      .limit(1)
    const status = classifyDonor({
      wantsReceipt: profile?.wantsReceipt ?? false,
      paidInWindowMxn: paidInWindow,
    })
    await db
      .update(donorProfiles)
      .set({ complianceStatus: status, updatedAt: new Date() })
      .where(eq(donorProfiles.userId, userId))
  }
  console.log(`Alertas UMA: 5 donantes con totales sobre umbral PLD/SAT (pld≈${Math.round(pld)}, sat≈${Math.round(sat)}).`)

  const [{ demoUsers }] = await db
    .select({ demoUsers: sql<number>`count(*)::int`.mapWith(Number) })
    .from(users)
    .where(like(users.email, `${DEMO_EMAIL_PREFIX}%${DEMO_EMAIL_DOMAIN}`))

  const [{ allDonations }] = await db
    .select({ allDonations: sql<number>`count(*)::int`.mapWith(Number) })
    .from(donations)

  const [{ pendingSpei }] = await db
    .select({ pendingSpei: sql<number>`count(*)::int`.mapWith(Number) })
    .from(donations)
    .where(and(eq(donations.status, 'pending'), eq(donations.method, 'spei')))

  console.log(
    `Resumen BD: usuarios demo=${demoUsers}, donaciones totales=${allDonations}, SPEI pending=${pendingSpei}.`,
  )
  console.log(`Login de prueba: ${demoEmail(1)} / ${DEMO_PASSWORD}`)
}
finally {
  await client.end()
}
