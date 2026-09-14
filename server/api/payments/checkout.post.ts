import {
  getAdapter,
  getSiteUrl,
  getWebhookBaseUrl,
  resolveCheckoutProvider,
} from '../../payments'

export default defineEventHandler(async (event) => {
  const session = optionalSession(event)
  assertNotOperator(session)
  if (session) {
    await assertDonorAccountActive(session.sub)
  }

  const body = await readBody(event)
  const donationId = String(body?.donationId || '').trim()
  if (!donationId) {
    throw createError({ statusCode: 400, statusMessage: 'donationId es requerido' })
  }

  const row = await getDonationRow(donationId)
  if (!row || row.status !== 'pending') {
    throw createError({ statusCode: 400, statusMessage: 'Donación inexistente o no pendiente' })
  }

  if (row.userId && session && row.userId !== session.sub) {
    throw createError({ statusCode: 403, statusMessage: 'No puede cobrar esta donación' })
  }

  if (row.method === 'spei') {
    throw createError({ statusCode: 400, statusMessage: 'SPEI no usa checkout de pasarela' })
  }

  const donation = await findDonationById(donationId)
  if (!donation) {
    throw createError({ statusCode: 400, statusMessage: 'Donación inexistente o no pendiente' })
  }

  const settings = await getPaymentSettings()
  const provider = resolveCheckoutProvider(donation.method, settings.cardProvider)

  if (provider === 'mercadopago' && !(settings.cardEnabled && settings.credentials.mercadopago)) {
    throw createError({ statusCode: 503, statusMessage: 'Tarjeta no configurada' })
  }
  if (provider === 'paypal' && !(settings.paypalEnabled && settings.credentials.paypal)) {
    throw createError({ statusCode: 503, statusMessage: 'PayPal no configurado' })
  }

  const siteUrl = getSiteUrl()
  const webhookBaseUrl = getWebhookBaseUrl()
  const adapter = getAdapter(provider)
  const checkout = await adapter.createCheckout({
    donation,
    siteUrl,
    webhookBaseUrl,
    mode: settings.mode,
  })

  await attachCheckoutReference({
    donationId: donation.id,
    provider,
    providerReference: checkout.providerReference,
  })

  return { redirectUrl: checkout.redirectUrl }
})
