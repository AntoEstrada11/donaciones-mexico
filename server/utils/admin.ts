import { and, count, desc, eq, gte, ilike, inArray, lte, or, sql } from 'drizzle-orm'
import {
  campaigns,
  donations,
  donorProfiles,
  heroSlides,
  userStatusEvents,
  users,
} from '../database/schema'
import type {
  AdminComplianceAlert,
  AdminDonationRow,
  AdminDonorDetail,
  AdminStats,
  AdminUserRow,
  AdminUserScope,
  AdminUsersPage,
  Donation,
  DonationMethod,
  DonorStatus,
  UserRole,
} from '~/types'
import { setDonorStatus } from './users'
import { getIdentityStatus } from './identity'
import { listRecurringByUser } from './recurring'
import { pldThresholdMxn, satReportThresholdMxn } from '../../utils/uma'
import { isInstitutionalStaffEmail, STAFF_EMAIL_DOMAIN } from '../../utils/staffEmail'

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

  const [speiPendingRow] = await db
    .select({ total: count() })
    .from(donations)
    .where(and(eq(donations.method, 'spei'), eq(donations.status, 'pending')))

  return {
    users: Number(userCounts?.users ?? 0),
    admins: Number(userCounts?.admins ?? 0),
    donationsByStatus,
    activeSlides: Number(slideCount?.total ?? 0),
    pldPending: await countCompliance('pld_pending'),
    satReport: await countCompliance('sat_report'),
    speiPending: Number(speiPendingRow?.total ?? 0),
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

export interface AdminUserFilters {
  q?: string
  /** Por defecto todos; `scope` tiene prioridad si se envía. */
  role?: UserRole | 'all'
  /** donors = solo donantes; staff = admin|editor; staff_candidates = @mx.universal.org donantes. */
  scope?: AdminUserScope
  status?: DonorStatus | 'all'
  churchId?: string | 'all'
  page?: number
  pageSize?: number
}

function mapAdminUserRow(
  row: {
    id: string
    email: string
    name: string
    role: UserRole
    status: DonorStatus
    profileComplete: boolean
    emailVerifiedAt: Date | null
    createdAt: Date
    homeChurchId: string | null
    homeChurchName: string | null
  },
  event: { createdAt: Date, actorUserId: string | null } | undefined,
  actorNames: Map<string, string>,
): AdminUserRow {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    status: row.status,
    profileComplete: row.profileComplete,
    emailVerified: Boolean(row.emailVerifiedAt),
    createdAt: row.createdAt.toISOString(),
    statusChangedAt: event?.createdAt.toISOString() ?? null,
    statusChangedByName: event?.actorUserId
      ? actorNames.get(event.actorUserId) ?? null
      : null,
    homeChurchId: row.homeChurchId,
    homeChurchName: row.homeChurchName,
  }
}

export async function listAdminUsers(filters: AdminUserFilters = {}): Promise<AdminUsersPage> {
  const db = useDatabase()
  const page = Math.max(1, Number(filters.page) || 1)
  const pageSize = Math.min(100, Math.max(10, Number(filters.pageSize) || 25))
  const offset = (page - 1) * pageSize

  const conditions = []
  const q = String(filters.q || '').trim().slice(0, 100)
  if (q) {
    const pattern = `%${q.replace(/[%_]/g, '')}%`
    conditions.push(or(ilike(users.name, pattern), ilike(users.email, pattern)))
  }
  if (filters.scope === 'donors') {
    conditions.push(eq(users.role, 'donor'))
  }
  else if (filters.scope === 'staff') {
    conditions.push(inArray(users.role, ['admin', 'editor']))
  }
  else if (filters.scope === 'staff_candidates') {
    conditions.push(eq(users.role, 'donor'))
    conditions.push(ilike(users.email, `%@${STAFF_EMAIL_DOMAIN}`))
  }
  else if (filters.role && filters.role !== 'all') {
    conditions.push(eq(users.role, filters.role))
  }
  if (filters.status && filters.status !== 'all') {
    conditions.push(eq(users.status, filters.status))
  }
  if (filters.churchId && filters.churchId !== 'all') {
    conditions.push(eq(donorProfiles.homeChurchExternalId, filters.churchId))
  }

  const where = conditions.length ? and(...conditions) : undefined

  const [totalRow] = await db
    .select({ total: count() })
    .from(users)
    .leftJoin(donorProfiles, eq(donorProfiles.userId, users.id))
    .where(where)

  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      status: users.status,
      profileComplete: users.profileComplete,
      emailVerifiedAt: users.emailVerifiedAt,
      createdAt: users.createdAt,
      homeChurchId: donorProfiles.homeChurchExternalId,
      homeChurchName: donorProfiles.homeChurchName,
    })
    .from(users)
    .leftJoin(donorProfiles, eq(donorProfiles.userId, users.id))
    .where(where)
    .orderBy(desc(users.createdAt))
    .limit(pageSize)
    .offset(offset)

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

  return {
    items: rows.map(row => mapAdminUserRow(row, latestEvents.get(row.id), actorNames)),
    total: Number(totalRow?.total ?? 0),
    page,
    pageSize,
  }
}

export async function listAdminUserChurchOptions() {
  const db = useDatabase()
  const rows = await db
    .select({
      id: donorProfiles.homeChurchExternalId,
      name: donorProfiles.homeChurchName,
    })
    .from(donorProfiles)
    .where(sql`${donorProfiles.homeChurchExternalId} is not null and ${donorProfiles.homeChurchExternalId} <> ''`)

  const map = new Map<string, string>()
  for (const row of rows) {
    if (!row.id) continue
    if (!map.has(row.id)) map.set(row.id, row.name || row.id)
  }
  return [...map.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name, 'es'))
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
  return await getAdminUserRow(targetUserId)
}

async function getAdminUserRow(userId: string): Promise<AdminUserRow> {
  const db = useDatabase()
  const [row] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      status: users.status,
      profileComplete: users.profileComplete,
      emailVerifiedAt: users.emailVerifiedAt,
      createdAt: users.createdAt,
      homeChurchId: donorProfiles.homeChurchExternalId,
      homeChurchName: donorProfiles.homeChurchName,
    })
    .from(users)
    .leftJoin(donorProfiles, eq(donorProfiles.userId, users.id))
    .where(eq(users.id, userId))
    .limit(1)

  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'Usuario no encontrado' })
  }

  const latestEvents = await latestStatusEventsByUser()
  const event = latestEvents.get(row.id)
  const actorNames = new Map<string, string>()
  if (event?.actorUserId) {
    const [actor] = await db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(eq(users.id, event.actorUserId))
      .limit(1)
    if (actor) actorNames.set(actor.id, actor.name)
  }

  return mapAdminUserRow(row, event, actorNames)
}

export async function setUserRoleForAdmin(
  targetUserId: string,
  role: UserRole,
): Promise<AdminUserRow> {
  if (role !== 'donor' && role !== 'editor' && role !== 'admin') {
    throw createError({ statusCode: 400, statusMessage: 'Rol inválido' })
  }

  const db = useDatabase()
  const [current] = await db.select().from(users).where(eq(users.id, targetUserId)).limit(1)
  if (!current) {
    throw createError({ statusCode: 404, statusMessage: 'Usuario no encontrado' })
  }

  if ((role === 'admin' || role === 'editor') && !isInstitutionalStaffEmail(current.email)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Solo correos @${STAFF_EMAIL_DOMAIN} pueden ser admin o editor`,
    })
  }

  if (current.role === 'admin' && role !== 'admin') {
    const [adminCount] = await db
      .select({ total: count() })
      .from(users)
      .where(eq(users.role, 'admin'))
    if (Number(adminCount?.total ?? 0) <= 1) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No se puede quitar el único administrador',
      })
    }
  }

  await db
    .update(users)
    .set({ role, updatedAt: new Date() })
    .where(eq(users.id, targetUserId))

  return await getAdminUserRow(targetUserId)
}

export async function updateDonorHomeChurch(
  userId: string,
  churchId: string | null,
  churchName: string | null,
) {
  const db = useDatabase()
  const id = churchId ? String(churchId).slice(0, 64) : null
  let name = churchName ? String(churchName).trim().slice(0, 200) : null
  if (id && !name) {
    const names = await churchNamesWithoutRemoteFetch()
    name = names.get(id) ?? id
  }

  const [existing] = await db
    .select({ userId: donorProfiles.userId })
    .from(donorProfiles)
    .where(eq(donorProfiles.userId, userId))
    .limit(1)

  if (!existing) {
    await db.insert(donorProfiles).values({
      userId,
      homeChurchExternalId: id,
      homeChurchName: name,
      updatedAt: new Date(),
    })
  }
  else {
    await db
      .update(donorProfiles)
      .set({
        homeChurchExternalId: id,
        homeChurchName: name,
        updatedAt: new Date(),
      })
      .where(eq(donorProfiles.userId, userId))
  }
}

export interface AdminDonationFilters {
  status?: Donation['status']
  method?: DonationMethod
  churchId?: string
  dateFrom?: Date
  dateTo?: Date
  minAmount?: number
  maxAmount?: number
  limit?: number
}

export async function listAdminDonations(
  filters: AdminDonationFilters | number = 500,
): Promise<AdminDonationRow[]> {
  const opts: AdminDonationFilters = typeof filters === 'number'
    ? { limit: filters }
    : filters

  const db = useDatabase()
  const conditions = []

  if (opts.status) conditions.push(eq(donations.status, opts.status))
  if (opts.method) conditions.push(eq(donations.method, opts.method))
  if (opts.churchId) conditions.push(eq(donations.churchExternalId, opts.churchId))
  if (opts.dateFrom) conditions.push(gte(donations.createdAt, opts.dateFrom))
  if (opts.dateTo) conditions.push(lte(donations.createdAt, opts.dateTo))
  if (opts.minAmount != null && Number.isFinite(opts.minAmount)) {
    conditions.push(gte(donations.amount, String(opts.minAmount)))
  }
  if (opts.maxAmount != null && Number.isFinite(opts.maxAmount)) {
    conditions.push(lte(donations.amount, String(opts.maxAmount)))
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined
  const limit = Math.min(Math.max(opts.limit ?? 500, 1), 2000)

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
    .where(where)
    .orderBy(desc(donations.createdAt))
    .limit(limit)

  const churchNames = await churchNamesWithoutRemoteFetch()

  return rows.map(({ donation, userEmail, userName, campaignName, campaignType }) =>
    toAdminDonationRow(donation, {
      userEmail,
      userName,
      campaignName,
      campaignType,
      churchName: churchNames.get(donation.churchExternalId) ?? donation.churchName ?? null,
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
    userId: donation.userId,
    churchId: donation.churchExternalId,
    churchName: extra.churchName,
    campaignId: donation.campaignId,
    amount: Number(donation.amount),
    currency: donation.currency,
    status: donation.status,
    method: donation.method,
    createdAt: donation.createdAt.toISOString(),
    provider: donation.provider,
    providerReference: donation.providerReference,
    providerPaymentId: donation.providerPaymentId,
    paidAt: donation.paidAt ? donation.paidAt.toISOString() : null,
    userEmail: extra.userEmail,
    userName: extra.userName,
    campaignName: extra.campaignName,
    campaignType: extra.campaignType,
  }
}

const ALLOWED_STATUS: Donation['status'][] = ['paid', 'pending', 'failed', 'cancelled', 'refunded']
const ALLOWED_METHODS: DonationMethod[] = ['spei', 'card', 'paypal']

export function parseDonationStatus(value: unknown): Donation['status'] | undefined {
  const raw = String(value || '')
  return ALLOWED_STATUS.includes(raw as Donation['status'])
    ? raw as Donation['status']
    : undefined
}

export function parseDonationMethod(value: unknown): DonationMethod | undefined {
  const raw = String(value || '')
  return ALLOWED_METHODS.includes(raw as DonationMethod)
    ? raw as DonationMethod
    : undefined
}

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
    .set({
      status,
      updatedAt: new Date(),
      ...(status === 'paid' ? { paidAt: new Date() } : {}),
    })
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
    churchName: churchNames.get(row.churchExternalId) ?? row.churchName ?? null,
  })
}

export async function getAdminDonorDetail(userId: string): Promise<AdminDonorDetail> {
  const db = useDatabase()
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'Donante no encontrado' })
  }

  const [profile] = await db
    .select()
    .from(donorProfiles)
    .where(eq(donorProfiles.userId, userId))
    .limit(1)

  const identity = await getIdentityStatus(userId)
  const uma = await refreshDonorCompliance(userId)
  const ownDonations = await listAdminDonationsForUser(userId)
  const recurring = await listRecurringByUser(userId)
  const requests = await listDonorRequests(userId)

  let paidCount = 0
  let paidAmount = 0
  let pendingCount = 0
  let pendingAmount = 0
  for (const row of ownDonations) {
    if (row.status === 'paid') {
      paidCount += 1
      paidAmount += row.amount
    }
    else if (row.status === 'pending') {
      pendingCount += 1
      pendingAmount += row.amount
    }
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
    profileComplete: user.profileComplete,
    emailVerified: Boolean(user.emailVerifiedAt),
    createdAt: user.createdAt.toISOString(),
    profile: profile
      ? {
          phone: profile.phone,
          wantsReceipt: profile.wantsReceipt,
          street: profile.street,
          city: profile.city,
          state: profile.state,
          zip: profile.zip,
          colony: profile.colony,
          rfc: profile.rfc,
          fiscalName: profile.fiscalName,
          taxRegime: profile.taxRegime,
          cfdiUse: profile.cfdiUse,
          complianceStatus: uma.status,
          identityVerifiedAt: profile.identityVerifiedAt?.toISOString() ?? null,
          homeChurchId: profile.homeChurchExternalId,
          homeChurchName: profile.homeChurchName,
        }
      : null,
    identity,
    uma,
    donations: ownDonations,
    recurring,
    requests,
    totals: {
      paidCount,
      paidAmount,
      pendingCount,
      pendingAmount,
    },
  }
}

async function listAdminDonationsForUser(userId: string): Promise<AdminDonationRow[]> {
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
    .where(eq(donations.userId, userId))
    .orderBy(desc(donations.createdAt))
    .limit(500)

  const churchNames = await churchNamesWithoutRemoteFetch()

  return rows.map(({ donation, userEmail, userName, campaignName, campaignType }) =>
    toAdminDonationRow(donation, {
      userEmail,
      userName,
      campaignName,
      campaignType,
      churchName: churchNames.get(donation.churchExternalId) ?? donation.churchName ?? null,
    }),
  )
}

export async function listComplianceAlerts(): Promise<AdminComplianceAlert[]> {
  const db = useDatabase()
  const rows = await db
    .select({
      userId: users.id,
      name: users.name,
      email: users.email,
      status: users.status,
      complianceStatus: donorProfiles.complianceStatus,
      wantsReceipt: donorProfiles.wantsReceipt,
      rfc: donorProfiles.rfc,
    })
    .from(donorProfiles)
    .innerJoin(users, eq(users.id, donorProfiles.userId))
    .where(inArray(donorProfiles.complianceStatus, ['pld_pending', 'sat_report']))
    .orderBy(desc(donorProfiles.updatedAt))

  const pldThreshold = pldThresholdMxn()
  const satThreshold = satReportThresholdMxn()
  const alerts: AdminComplianceAlert[] = []

  for (const row of rows) {
    if (row.complianceStatus !== 'pld_pending' && row.complianceStatus !== 'sat_report') {
      continue
    }

    const uma = await refreshDonorCompliance(row.userId)
    // Puede haber bajado de umbral tras refrescar; solo listar si sigue en alerta.
    if (uma.status !== 'pld_pending' && uma.status !== 'sat_report') continue

    const identity = await getIdentityStatus(row.userId)
    const [last] = await db
      .select({ createdAt: donations.createdAt })
      .from(donations)
      .where(eq(donations.userId, row.userId))
      .orderBy(desc(donations.createdAt))
      .limit(1)

    alerts.push({
      userId: row.userId,
      name: row.name,
      email: row.email,
      status: row.status,
      complianceStatus: uma.status,
      paidInWindow: uma.paidInWindow,
      pldThreshold,
      satThreshold,
      identityComplete: identity.complete,
      wantsReceipt: row.wantsReceipt,
      rfc: row.rfc,
      lastDonationAt: last?.createdAt.toISOString() ?? null,
    })
  }

  alerts.sort((a, b) => {
    if (a.complianceStatus !== b.complianceStatus) {
      return a.complianceStatus === 'sat_report' ? -1 : 1
    }
    return b.paidInWindow - a.paidInWindow
  })

  return alerts
}
