import { and, eq } from 'drizzle-orm'
import { donations, paymentEvents } from '../database/schema'
import type { Donation, PaymentProvider } from '~/types'

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

export async function findDonationById(id: string) {
  const db = useDatabase()
  const [row] = await db.select().from(donations).where(eq(donations.id, id)).limit(1)
  return row ? toDonation(row) : null
}

export async function findDonationByProviderReference(
  provider: PaymentProvider,
  providerReference: string,
) {
  const db = useDatabase()
  const [row] = await db
    .select()
    .from(donations)
    .where(and(
      eq(donations.provider, provider),
      eq(donations.providerReference, providerReference),
    ))
    .limit(1)
  return row ? toDonation(row) : null
}

export async function attachCheckoutReference(input: {
  donationId: string
  provider: PaymentProvider
  providerReference: string
}): Promise<Donation> {
  const db = useDatabase()
  const [row] = await db
    .update(donations)
    .set({
      provider: input.provider,
      providerReference: input.providerReference,
      updatedAt: new Date(),
    })
    .where(eq(donations.id, input.donationId))
    .returning()

  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'Donación no encontrada' })
  }
  return toDonation(row)
}

/**
 * Inserta el evento si es nuevo. Devuelve false si ya existía (idempotencia).
 */
export async function recordPaymentEvent(input: {
  provider: PaymentProvider
  providerEventId: string
  donationId: string | null
  eventType: string
  mappedStatus: Donation['status'] | null
}): Promise<boolean> {
  const db = useDatabase()
  const inserted = await db
    .insert(paymentEvents)
    .values({
      provider: input.provider,
      providerEventId: input.providerEventId,
      donationId: input.donationId,
      eventType: input.eventType.slice(0, 80),
      mappedStatus: input.mappedStatus,
    })
    .onConflictDoNothing({
      target: [paymentEvents.provider, paymentEvents.providerEventId],
    })
    .returning({ id: paymentEvents.id })

  return inserted.length > 0
}

export async function applyProviderStatus(input: {
  donationId: string
  status: Donation['status']
  provider: PaymentProvider
  providerPaymentId?: string | null
  providerReference?: string | null
  expectedAmount?: number | null
}): Promise<Donation | null> {
  const db = useDatabase()
  const [current] = await db.select().from(donations).where(eq(donations.id, input.donationId)).limit(1)
  if (!current) return null

  if (
    input.expectedAmount != null
    && Number.isFinite(input.expectedAmount)
    && Math.abs(Number(current.amount) - input.expectedAmount) > 0.009
  ) {
    // Monto no coincide: no marcar paid; dejar pending y registrar solo el evento.
    return toDonation(current)
  }

  const paidAt = input.status === 'paid'
    ? (current.paidAt ?? new Date())
    : current.paidAt

  const [row] = await db
    .update(donations)
    .set({
      status: input.status,
      provider: input.provider,
      providerPaymentId: input.providerPaymentId ?? current.providerPaymentId,
      providerReference: input.providerReference ?? current.providerReference,
      paidAt,
      updatedAt: new Date(),
    })
    .where(eq(donations.id, input.donationId))
    .returning()

  return row ? toDonation(row) : null
}
