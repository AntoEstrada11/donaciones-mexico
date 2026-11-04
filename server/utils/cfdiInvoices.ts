import { and, eq } from 'drizzle-orm'
import { cfdiInvoices, donations } from '../database/schema'
import type { CfdiInvoice } from '~/types'
import { getDonorProfile } from './users'
import { getIdentityStatus } from './identity'

function mapRow(row: typeof cfdiInvoices.$inferSelect): CfdiInvoice {
  return {
    id: row.id,
    donationId: row.donationId,
    status: row.status,
    uuid: row.uuid,
    errorCode: row.errorCode,
    createdAt: row.createdAt.toISOString(),
  }
}

/** PAC aún no cableado: deja constancia del pedido y marca failed con código claro. */
export function isCfdiPacConfigured(): boolean {
  const c = useRuntimeConfig()
  return Boolean(String(c.cfdiPacApiUrl || '').trim() && String(c.cfdiPacApiKey || '').trim())
}

export async function requestCfdiForDonation(
  userId: string,
  donationId: string,
): Promise<CfdiInvoice> {
  const db = useDatabase()
  const [donation] = await db
    .select()
    .from(donations)
    .where(and(eq(donations.id, donationId), eq(donations.userId, userId)))
    .limit(1)

  if (!donation) {
    throw createError({ statusCode: 404, statusMessage: 'Donación no encontrada' })
  }
  if (donation.status !== 'paid') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Solo se puede solicitar factura de una donación pagada',
    })
  }

  const profile = await getDonorProfile(userId)
  const identity = await getIdentityStatus(userId)
  if (!profile?.wantsReceipt || !profile.rfc || !profile.fiscalName || !profile.zip) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Complete RFC, razón social y C.P. fiscal en su perfil y active el recibo',
    })
  }
  if (!identity.complete) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Adjunte anverso y reverso de su identificación antes de solicitar factura',
    })
  }

  const [existing] = await db
    .select()
    .from(cfdiInvoices)
    .where(eq(cfdiInvoices.donationId, donationId))
    .limit(1)

  if (existing?.status === 'stamped') {
    return mapRow(existing)
  }

  if (!isCfdiPacConfigured()) {
    const [row] = existing
      ? await db
          .update(cfdiInvoices)
          .set({
            status: 'failed',
            errorCode: 'PAC_NOT_CONFIGURED',
            updatedAt: new Date(),
          })
          .where(eq(cfdiInvoices.id, existing.id))
          .returning()
      : await db
          .insert(cfdiInvoices)
          .values({
            donationId,
            userId,
            status: 'failed',
            errorCode: 'PAC_NOT_CONFIGURED',
          })
          .returning()

    if (!row) {
      throw createError({ statusCode: 500, statusMessage: 'No se pudo registrar la solicitud de CFDI' })
    }

    throw createError({
      statusCode: 503,
      statusMessage:
        'El timbrado CFDI aún no está configurado (falta PAC y CSD de la Iglesia). Use la constancia HTML del historial por ahora.',
      data: { invoice: mapRow(row) },
    })
  }

  // Reservado: llamada al PAC cuando existan NUXT_CFDI_PAC_* y CSD.
  throw createError({
    statusCode: 503,
    statusMessage: 'Integración PAC pendiente de activación operativa',
  })
}

export async function getCfdiForDonation(
  userId: string,
  donationId: string,
): Promise<CfdiInvoice | null> {
  const db = useDatabase()
  const [row] = await db
    .select()
    .from(cfdiInvoices)
    .where(and(eq(cfdiInvoices.donationId, donationId), eq(cfdiInvoices.userId, userId)))
    .limit(1)
  return row ? mapRow(row) : null
}
