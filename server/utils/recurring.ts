import { desc, eq } from 'drizzle-orm'
import { recurringDonations } from '../database/schema'
import type { DonationMethod, RecurringDonation, RecurringFrequency, RecurringStatus } from '~/types'
import { createDonation } from './donations'
import { churchNamesWithoutRemoteFetch } from './churches'

function addFrequency(from: Date, frequency: RecurringFrequency): Date {
  const d = new Date(from)
  if (frequency === 'weekly') d.setDate(d.getDate() + 7)
  else if (frequency === 'biweekly') d.setDate(d.getDate() + 14)
  else d.setMonth(d.getMonth() + 1)
  return d
}

function mapRow(row: typeof recurringDonations.$inferSelect): RecurringDonation {
  return {
    id: row.id,
    churchId: row.churchExternalId,
    churchName: row.churchName,
    campaignId: row.campaignId,
    amount: Number(row.amount),
    currency: row.currency,
    frequency: row.frequency,
    method: row.method,
    status: row.status,
    nextChargeAt: row.nextChargeAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  }
}

export async function listRecurringByUser(userId: string): Promise<RecurringDonation[]> {
  const db = useDatabase()
  const rows = await db
    .select()
    .from(recurringDonations)
    .where(eq(recurringDonations.userId, userId))
    .orderBy(desc(recurringDonations.createdAt))
  return rows.map(mapRow)
}

export async function createRecurring(input: {
  userId: string
  churchId: string
  campaignId: string
  amount: number
  frequency: RecurringFrequency
  method: DonationMethod
}): Promise<RecurringDonation> {
  if (!Number.isFinite(input.amount) || input.amount < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Monto inválido' })
  }
  const freqs: RecurringFrequency[] = ['weekly', 'biweekly', 'monthly']
  if (!freqs.includes(input.frequency)) {
    throw createError({ statusCode: 400, statusMessage: 'Frecuencia inválida' })
  }

  const db = useDatabase()
  const campaign = await findAvailableCampaign(input.campaignId)
  if (!campaign) {
    throw createError({ statusCode: 400, statusMessage: 'Campaña no disponible' })
  }

  const names = await churchNamesWithoutRemoteFetch()
  const churchName = names.get(String(input.churchId)) ?? null
  const now = new Date()

  // SPEI: activo de inmediato (cada ciclo genera pending). Tarjeta/PayPal: pending_setup hasta Preapproval.
  const status: RecurringStatus = input.method === 'spei' ? 'active' : 'pending_setup'
  const nextChargeAt = status === 'active' ? addFrequency(now, input.frequency) : null

  const [row] = await db
    .insert(recurringDonations)
    .values({
      userId: input.userId,
      churchExternalId: String(input.churchId).slice(0, 64),
      churchName,
      campaignId: input.campaignId,
      amount: String(input.amount.toFixed(2)),
      frequency: input.frequency,
      method: input.method,
      status,
      nextChargeAt,
    })
    .returning()

  if (!row) {
    throw createError({ statusCode: 500, statusMessage: 'No se pudo crear la donación recurrente' })
  }

  // Primer cargo SPEI inmediato como pending.
  if (input.method === 'spei') {
    const donation = await createDonation({
      userId: input.userId,
      churchId: input.churchId,
      churchName,
      campaignId: input.campaignId,
      amount: input.amount,
      method: 'spei',
    })
    const [updated] = await db
      .update(recurringDonations)
      .set({ lastDonationId: donation.id, updatedAt: new Date() })
      .where(eq(recurringDonations.id, row.id))
      .returning()
    if (updated) return mapRow(updated)
  }

  return mapRow(row)
}

export async function updateRecurringStatus(
  userId: string,
  id: string,
  status: Extract<RecurringStatus, 'active' | 'paused' | 'cancelled'>,
): Promise<RecurringDonation> {
  const db = useDatabase()
  const [existing] = await db
    .select()
    .from(recurringDonations)
    .where(and(eq(recurringDonations.id, id), eq(recurringDonations.userId, userId)))
    .limit(1)
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Donación recurrente no encontrada' })
  }
  if (existing.method !== 'spei' && status === 'active' && existing.status === 'pending_setup') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Configure el cobro con la pasarela antes de activar (cuenta empresarial pendiente)',
    })
  }

  const nextChargeAt = status === 'active'
    ? (existing.nextChargeAt && existing.nextChargeAt > new Date()
        ? existing.nextChargeAt
        : addFrequency(new Date(), existing.frequency))
    : existing.nextChargeAt

  const [row] = await db
    .update(recurringDonations)
    .set({ status, nextChargeAt, updatedAt: new Date() })
    .where(eq(recurringDonations.id, id))
    .returning()

  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'Donación recurrente no encontrada' })
  }
  return mapRow(row)
}
