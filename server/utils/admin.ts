import { count, desc, eq, inArray, sql } from 'drizzle-orm'
import { campaigns, donations, heroSlides, userStatusEvents, users } from '../database/schema'
import type { AdminDonationRow, AdminStats, AdminUserRow, Donation, DonorStatus } from '~/types'
import { setDonorStatus } from './users'

export async function getAdminStats(): Promise<AdminStats> {
  const db = useDatabase()

  const [userCounts] = await db
    .select({
      users: count(),
      admins: sql<number>`count(*) filter (where ${users.role} = 'admin')`.mapWith(Number),
    })
    .from(users)

  const statusRows = await db
    .select({
      status: donations.status,
      total: count(),
    })
    .from(donations)
    .groupBy(donations.status)

  const donationsByStatus: AdminStats['donationsByStatus'] = {
    paid: 0,
    pending: 0,
    failed: 0,
    cancelled: 0,
    refunded: 0,
  }
  for (const row of statusRows) {
    donationsByStatus[row.status] = Number(row.total)
  }

  const [slideCount] = await db
    .select({ total: count() })
    .from(heroSlides)
    .where(eq(heroSlides.active, true))

  return {
    users: Number(userCounts?.users ?? 0),
    admins: Number(userCounts?.admins ?? 0),
    donationsByStatus,
    activeSlides: Number(slideCount?.total ?? 0),
    pldPending: await countCompliance('pld_pending'),
    satReport: await countCompliance('sat_report'),
  }
}

async function latestStatusEventsByUser() {
  const db = useDatabase()
  const events = await db
    .select({
      userId: userStatusEvents.userId,
      status: userStatusEvents.status,
      createdAt: userStatusEvents.createdAt,
      actorUserId: userStatusEvents.actorUserId,
    })
    .from(userStatusEvents)
    .orderBy(desc(userStatusEvents.createdAt))

  const latest = new Map<string, (typeof events)[number]>()
  for (const event of events) {
    if (!latest.has(event.userId)) {
      latest.set(event.userId, event)
    }
  }
  return latest
}

export async function listAdminUsers(): Promise<AdminUserRow[]> {
  const db = useDatabase()
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      status: users.status,
      profileComplete: users.profileComplete,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))

  const latestEvents = await latestStatusEventsByUser()
  const actorIds = [...new Set(
    [...latestEvents.values()]
      .map(e => e.actorUserId)
      .filter((id): id is string => Boolean(id)),
  )]

  const actorNames = new Map<string, string>()
  if (actorIds.length > 0) {
    const actors = await db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(inArray(users.id, actorIds))

    for (const actor of actors) {
      actorNames.set(actor.id, actor.name)
    }
  }

  return rows.map((row) => {
    const event = latestEvents.get(row.id)
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      status: row.status,
      profileComplete: row.profileComplete,
      createdAt: row.createdAt.toISOString(),
      statusChangedAt: event?.createdAt.toISOString() ?? null,
      statusChangedByName: event?.actorUserId
        ? actorNames.get(event.actorUserId) ?? null
        : null,
    }
  })
}

export async function updateDonorStatusForAdmin(
  targetUserId: string,
  status: DonorStatus,
  actorUserId: string,
): Promise<AdminUserRow> {
  if (status !== 'active' && status !== 'deactivated') {
    throw createError({ statusCode: 400, statusMessage: 'Estado inválido' })
  }

  await setDonorStatus(targetUserId, status, actorUserId)

  const row = (await listAdminUsers()).find(u => u.id === targetUserId)
  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'Usuario no encontrado' })
  }
  return row
}

export async function listAdminDonations(limit = 500): Promise<AdminDonationRow[]> {
  const db = useDatabase()
  const rows = await db
    .select({
      donation: donations,
      userEmail: users.email,
      userName: users.name,
      campaignName: campaigns.name,
      campaignType: campaigns.type,
    })
    .from(donations)
    .leftJoin(users, eq(donations.userId, users.id))
    .leftJoin(campaigns, eq(donations.campaignId, campaigns.id))
    .orderBy(desc(donations.createdAt))
    .limit(limit)

  const churchNames = await churchNamesWithoutRemoteFetch()

  return rows.map(({ donation, userEmail, userName, campaignName, campaignType }) =>
    toAdminDonationRow(donation, {
      userEmail,
      userName,
      campaignName,
      campaignType,
      churchName: churchNames.get(donation.churchExternalId) ?? null,
    }),
  )
}

function toAdminDonationRow(
  donation: typeof donations.$inferSelect,
  extra: {
    userEmail: string | null
    userName: string | null
    campaignName: string | null
    campaignType: string | null
    churchName: string | null
  },
): AdminDonationRow {
  return {
    id: donation.id,
    churchId: donation.churchExternalId,
    campaignId: donation.campaignId,
    amount: Number(donation.amount),
    currency: donation.currency,
    status: donation.status,
    method: donation.method,
    createdAt: donation.createdAt.toISOString(),
    userEmail: extra.userEmail,
    userName: extra.userName,
    campaignName: extra.campaignName,
    campaignType: extra.campaignType,
    churchName: extra.churchName,
  }
}

const ALLOWED_STATUS: Donation['status'][] = ['paid', 'pending', 'failed', 'cancelled', 'refunded']

export async function updateDonationStatus(
  id: string,
  status: Donation['status'],
): Promise<AdminDonationRow> {
  if (!ALLOWED_STATUS.includes(status)) {
    throw createError({ statusCode: 400, statusMessage: 'Estado de donación inválido' })
  }

  const db = useDatabase()
  const [row] = await db
    .update(donations)
    .set({ status, updatedAt: new Date() })
    .where(eq(donations.id, id))
    .returning()

  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'Donación no encontrada' })
  }

  if (row.userId && row.status === 'paid') {
    await refreshDonorCompliance(row.userId)
  }

  const [enriched] = await db
    .select({
      userEmail: users.email,
      userName: users.name,
      campaignName: campaigns.name,
      campaignType: campaigns.type,
    })
    .from(donations)
    .leftJoin(users, eq(donations.userId, users.id))
    .leftJoin(campaigns, eq(donations.campaignId, campaigns.id))
    .where(eq(donations.id, id))
    .limit(1)

  const churchNames = await churchNamesWithoutRemoteFetch()

  return toAdminDonationRow(row, {
    userEmail: enriched?.userEmail ?? null,
    userName: enriched?.userName ?? null,
    campaignName: enriched?.campaignName ?? null,
    campaignType: enriched?.campaignType ?? null,
    churchName: churchNames.get(row.churchExternalId) ?? null,
  })
}