import { capturePayPalOrder } from '../../../payments'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const orderId = String(body?.orderId || '').trim()
  const donationId = String(body?.donationId || '').trim()

  if (!orderId && !donationId) {
    throw createError({ statusCode: 400, statusMessage: 'orderId o donationId es requerido' })
  }

  const settings = await getPaymentSettings()
  if (!(settings.paypalEnabled && settings.credentials.paypal)) {
    throw createError({ statusCode: 503, statusMessage: 'PayPal no configurado' })
  }

  let reference = orderId
  if (!reference && donationId) {
    const donation = await findDonationById(donationId)
    if (!donation?.providerReference) {
      throw createError({ statusCode: 400, statusMessage: 'No hay orden PayPal asociada' })
    }
    reference = donation.providerReference
  }

  const status = await capturePayPalOrder(reference, settings.mode)
  const targetDonationId = status.donationId || donationId || null
  if (!targetDonationId) {
    throw createError({ statusCode: 400, statusMessage: 'No se pudo asociar la captura a una donación' })
  }

  const eventId = `capture:${reference}:${status.providerPaymentId || 'na'}`
  const isNew = await recordPaymentEvent({
    provider: 'paypal',
    providerEventId: eventId,
    donationId: targetDonationId,
    eventType: 'ORDER.CAPTURE',
    mappedStatus: status.status,
  })

  if (isNew || status.status === 'paid') {
    await applyProviderStatus({
      donationId: targetDonationId,
      status: status.status,
      provider: 'paypal',
      providerPaymentId: status.providerPaymentId,
      providerReference: status.providerReference || reference,
      expectedAmount: status.amount,
    })
  }

  const donation = await findDonationById(targetDonationId)
  return {
    ok: true,
    status: donation?.status || status.status,
    donationId: targetDonationId,
  }
})
