import { and, eq, gte, inArray, or, sql } from 'drizzle-orm'
import { donations, donorProfiles } from '../database/schema'
import {
  classifyDonor,
  pldThresholdMxn,
  satReportThresholdMxn,
  umaWindowStart,
  type DonorComplianceStatus,
} from '../../utils/uma'

export interface UmaSnapshot {
  paidInWindow: number
  pldThreshold: number
  satThreshold: number
  status: DonorComplianceStatus
}

export async function paidAmountInUmaWindow(userId: string, rfc: string | null): Promise<number> {
  const db = useDatabase()
  const since = umaWindowStart()

  const userMatch = eq(donations.userId, userId)
  let filter = userMatch

  if (rfc) {
    const peers = await db
      .select({ userId: donorProfiles.userId })
      .from(donorProfiles)
      .where(eq(donorProfiles.rfc, rfc))
    const ids = [...new Set([userId, ...peers.map(row => row.userId)])]
    filter = or(userMatch, inArray(donations.userId, ids)) ?? userMatch
  }

  const [row] = await db
    .select({
      total: sql<number>`coalesce(sum(${donations.amount}::numeric), 0)`.mapWith(Number),
    })
    .from(donations)
    .where(and(filter, eq(donations.status, 'paid'), gte(donations.createdAt, since)))

  return Number(row?.total ?? 0)
}

export async function refreshDonorCompliance(userId: string): Promise<UmaSnapshot> {
  const db = useDatabase()
  const [profile] = await db.select().from(donorProfiles).where(eq(donorProfiles.userId, userId)).limit(1)
  const wantsReceipt = profile?.wantsReceipt ?? false
  const paidInWindow = await paidAmountInUmaWindow(userId, profile?.rfc ?? null)
  const status = classifyDonor({ wantsReceipt, paidInWindowMxn: paidInWindow })

  if (profile) {
    await db
      .update(donorProfiles)
      .set({ complianceStatus: status, updatedAt: new Date() })
      .where(eq(donorProfiles.userId, userId))
  }

  return {
    paidInWindow,
    pldThreshold: pldThresholdMxn(),
    satThreshold: satReportThresholdMxn(),
    status,
  }
}

export async function countCompliance(status: DonorComplianceStatus) {
  const db = useDatabase()
  const [row] = await db
    .select({ total: sql<number>`count(*)::int`.mapWith(Number) })
    .from(donorProfiles)
    .where(eq(donorProfiles.complianceStatus, status))
  return Number(row?.total ?? 0)
}
