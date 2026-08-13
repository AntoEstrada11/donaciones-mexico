import { count, desc, eq, sql } from 'drizzle-orm'
import { campaigns, donations, heroSlides, users } from '../database/schema'
import type { AdminDonationRow, AdminStats, AdminUserRow, Donation, UserRole } from '~/types'

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
  }
}

export async function listAdminUsers(): Promise<AdminUserRow[]> {
  const db = useDatabase()
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      profileComplete: users.profileComplete,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))

  return rows.map(row => ({
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    profileComplete: row.profileComplete,
    createdAt: row.createdAt.toISOString(),
  }))
}

export async function setUserRole(
  targetUserId: string,
  role: UserRole,
  actorUserId: string,
): Promise<AdminUserRow> {
  const db = useDatabase()

  if (role === 'donor' && targetUserId === actorUserId) {
    const [admins] = await db
      .select({ total: count() })
      .from(users)
      .where(eq(users.role, 'admin'))

    if (Number(admins?.total ?? 0) <= 1) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No puede quitar el rol al único administrador',
      })
    }
  }

  const [row] = await db
    .update(users)
    .set({ role, updatedAt: new Date() })
    .where(eq(users.id, targetUserId))
    .returning()

  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'Usuario no encontrado' })
  }

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    profileComplete: row.profileComplete,
    createdAt: row.createdAt.toISOString(),
  }
}

export async function listAdminDonations(limit = 100): Promise<AdminDonationRow[]> {
  const db = useDatabase()
  const rows = await db
    .select({
      donation: donations,
      userEmail: users.email,
      userName: users.name,
      campaignName: campaigns.name,
    })
    .from(donations)
    .leftJoin(users, eq(donations.userId, users.id))
    .leftJoin(campaigns, eq(donations.campaignId, campaigns.id))
    .orderBy(desc(donations.createdAt))
    .limit(limit)

  return rows.map(({ donation, userEmail, userName, campaignName }) => ({
    id: donation.id,
    churchId: donation.churchExternalId,
    campaignId: donation.campaignId,
    amount: Number(donation.amount),
    currency: donation.currency,
    status: donation.status,
    method: donation.method,
    createdAt: donation.createdAt.toISOString(),
    userEmail: userEmail ?? null,
    userName: userName ?? null,
    campaignName: campaignName ?? null,
  }))
}

const ALLOWED_STATUS: Donation['status'][] = ['paid', 'pending', 'failed', 'cancelled']

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

  const [enriched] = await db
    .select({
      userEmail: users.email,
      userName: users.name,
      campaignName: campaigns.name,
    })
    .from(donations)
    .leftJoin(users, eq(donations.userId, users.id))
    .leftJoin(campaigns, eq(donations.campaignId, campaigns.id))
    .where(eq(donations.id, id))
    .limit(1)

  return {
    id: row.id,
    churchId: row.churchExternalId,
    campaignId: row.campaignId,
    amount: Number(row.amount),
    currency: row.currency,
    status: row.status,
    method: row.method,
    createdAt: row.createdAt.toISOString(),
    userEmail: enriched?.userEmail ?? null,
    userName: enriched?.userName ?? null,
    campaignName: enriched?.campaignName ?? null,
  }
}
