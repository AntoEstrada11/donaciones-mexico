import { getAdapter } from '../../../payments'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const paymentId = String(body?.paymentId || '').trim()
  const donationIdHint = String(body?.donationId || '').trim()

  if (!paymentId && !donationIdHint) {
    throw createError({ statusCode: 400, statusMessage: 'paymentId o donationId es requerido' })
  }

  const settings = await getPaymentSettings()
  if (!(settings.cardEnabled && settings.credentials.mercadopago)) {
    throw createError({ statusCode: 503, statusMessage: 'MercadoPago no configurado' })
  }

  const adapter = getAdapter('mercadopago')

  let resourceId = paymentId
  if (!resourceId && donationIdHint) {
    const donation = await findDonationById(donationIdHint)
    if (donation?.providerPaymentId) {
      resourceId = donation.providerPaymentId
    }
    else if (donation?.providerReference) {
      // Sin payment id aún: no hay fetch fiable solo con preference; dejar pending
      return {
        ok: true,
        status: donation.status,
        donationId: donation.id,
        synced: false,
      }
    }
  }

  if (!resourceId) {
    throw createError({ statusCode: 400, statusMessage: 'No hay payment_id de MercadoPago para confirmar' })
  }

  const status = await adapter.fetchStatus(resourceId, settings.mode)
  const donationId = status.donationId || donationIdHint
  if (!donationId) {
    throw createError({ statusCode: 400, statusMessage: 'No se pudo asociar el pago a una donación' })
  }

  const eventId = `return-sync:${resourceId}`
  const isNew = await recordPaymentEvent({
    provider: 'mercadopago',
    providerEventId: eventId,
    donationId,
    eventType: 'RETURN.SYNC',
    mappedStatus: status.status,
  })

  if (isNew || status.status === 'paid') {
    await applyProviderStatus({
      donationId,
      status: status.status,
      provider: 'mercadopago',
      providerPaymentId: status.providerPaymentId,
      providerReference: status.providerReference,
      expectedAmount: status.amount,
    })
  }

  const donation = await findDonationById(donationId)
  return {
    ok: true,
    status: donation?.status || status.status,
    donationId,
    synced: true,
  }
})
