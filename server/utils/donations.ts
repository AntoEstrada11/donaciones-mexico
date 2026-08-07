import { desc, eq } from 'drizzle-orm'
import { campaigns, donations } from '../database/schema'
import type { Campaign, Donation } from '~/types'

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

export async function listDonationsByUser(userId: string): Promise<Donation[]> {
  const db = useDatabase()
  const rows = await db
    .select()
    .from(donations)
    .where(eq(donations.userId, userId))
    .orderBy(desc(donations.createdAt))

  return rows.map(toDonation)
}

export async function createDonation(input: {
  userId: string | null
  churchId: string
  campaignId: string
  amount: number
  method: 'spei' | 'card'
}): Promise<Donation> {
  const db = useDatabase()

  const [row] = await db
    .insert(donations)
    .values({
      userId: input.userId,
      churchExternalId: input.churchId,
      campaignId: input.campaignId,
      amount: input.amount.toFixed(2),
      method: input.method,
      status: 'pending',
    })
    .returning()

  return toDonation(row)
}
