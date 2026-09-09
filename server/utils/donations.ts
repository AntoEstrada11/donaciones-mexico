import { desc, eq } from 'drizzle-orm'
import { campaigns, donations } from '../database/schema'
import type { Campaign, Donation, DonationMethod } from '~/types'

function toDonation(row: typeof donations.$inferSelect): Donation {
  return {
    id: row.id,
    churchId: row.churchExternalId,
    campaignId: row.campaignId,
    amount: Number(row.amount),
    currency: row.currency,
    status: row.status,
    method: row.method,
    createdAt: row.createdAt.toISOString(),
    provider: row.provider,
    providerReference: row.providerReference,
    providerPaymentId: row.providerPaymentId,
    paidAt: row.paidAt ? row.paidAt.toISOString() : null,
  }
}

export async function listCampaigns(): Promise<Campaign[]> {
  const db = useDatabase()
  const rows = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.active, true))
    .orderBy(campaigns.sortOrder)

  return rows.map(row => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    type: row.type,
  }))
}

export async function findCampaignById(id: string) {
  const db = useDatabase()
  const [row] = await db.select().from(campaigns).where(eq(campaigns.id, id)).limit(1)
  return row ?? null
}

export async function getDonationRow(id: string) {
  const db = useDatabase()
  const [row] = await db.select().from(donations).where(eq(donations.id, id)).limit(1)
  return row ?? null
}

export async function listDonationsByUser(userId: string): Promise<Donation[]> {
  const db = useDatabase()
  const rows = await db
    .select()
    .from(donations)
    .where(eq(donations.userId, userId))
    .orderBy(desc(donations.createdAt))

  return rows.map(toDonation)
}

export async function findDonationForUser(id: string, userId: string) {
  const db = useDatabase()
  const [row] = await db.select().from(donations).where(eq(donations.id, id)).limit(1)
  if (!row || row.userId !== userId) return null
  return toDonation(row)
}

export async function findDonationByProviderPaymentId(providerPaymentId: string) {
  const db = useDatabase()
  const [row] = await db
    .select()
    .from(donations)
    .where(eq(donations.providerPaymentId, providerPaymentId))
    .limit(1)
  return row ? toDonation(row) : null
}

export async function createDonation(input: {
  userId: string | null
  churchId: string
  campaignId: string
  amount: number
  method: DonationMethod
}): Promise<Donation> {
  const db = useDatabase()

  const provider = input.method === 'spei' ? 'spei_manual' as const : null

  const [row] = await db
    .insert(donations)
    .values({
      userId: input.userId,
      churchExternalId: input.churchId,
      campaignId: input.campaignId,
      amount: input.amount.toFixed(2),
      method: input.method,
      status: 'pending',
      provider,
    })
    .returning()

  return toDonation(row)
}

export async function attachProviderPaymentId(id: string, providerPaymentId: string) {
  const db = useDatabase()
  await db
    .update(donations)
    .set({ providerPaymentId, updatedAt: new Date() })
    .where(eq(donations.id, id))
}

/** Idempotente: no degrada un cobro ya `paid`. */
export async function applyGatewayStatus(input: {
  donationId: string
  status: Donation['status']
  providerPaymentId?: string
}): Promise<Donation | null> {
  const db = useDatabase()
  const [current] = await db.select().from(donations).where(eq(donations.id, input.donationId)).limit(1)
  if (!current) return null
  if (current.status === 'paid') return toDonation(current)

  const paidAt = input.status === 'paid'
    ? (current.paidAt ?? new Date())
    : current.paidAt

  const [row] = await db
    .update(donations)
    .set({
      status: input.status,
      providerPaymentId: input.providerPaymentId ?? current.providerPaymentId,
      paidAt,
      updatedAt: new Date(),
    })
    .where(eq(donations.id, input.donationId))
    .returning()

  if (row?.status === 'paid' && row.userId) {
    await refreshDonorCompliance(row.userId)
  }

  return row ? toDonation(row) : null
}
