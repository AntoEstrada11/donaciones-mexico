import { formatAmountMaxLabel, isValidAmount } from '../../utils/fieldLimits'
import type { DonationMethod } from '~/types'

export default defineEventHandler(async (event) => {
  const session = optionalSession(event)
  if (session) {
    await assertDonorAccountActive(session.sub)
  }
  const body = await readBody(event)

  if (!body?.churchId || !body?.campaignId || !body?.amount) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Iglesia, campaña y monto son requeridos',
    })
  }

  const amount = Number(body.amount)
  if (!isValidAmount(amount)) {
    throw createError({
      statusCode: 400,
      statusMessage: `El monto debe estar entre $1 y $${formatAmountMaxLabel()} MXN`,
    })
  }

  const campaign = await findCampaignById(String(body.campaignId))
  if (!campaign) {
    throw createError({ statusCode: 400, statusMessage: 'La campaña no existe' })
  }

  if (body?.consent !== true) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Debe aceptar el aviso de privacidad para registrar su donación',
    })
  }

  const rawMethod = String(body.method || 'spei')
  const method: DonationMethod = rawMethod === 'card'
    ? 'card'
    : rawMethod === 'paypal'
      ? 'paypal'
      : 'spei'

  const settings = await getPaymentSettings()
  if (method === 'spei' && !settings.speiManualEnabled) {
    throw createError({ statusCode: 400, statusMessage: 'SPEI no está disponible' })
  }
  if (method === 'card' && !(settings.cardEnabled && settings.credentials.mercadopago)) {
    throw createError({ statusCode: 503, statusMessage: 'Pago con tarjeta no disponible' })
  }
  if (method === 'paypal' && !(settings.paypalEnabled && settings.credentials.paypal)) {
    throw createError({ statusCode: 503, statusMessage: 'PayPal no está disponible' })
  }

  const amountRounded = Math.round(amount * 100) / 100

  const donation = await createDonation({
    userId: session?.sub ?? null,
    churchId: String(body.churchId).slice(0, 64),
    campaignId: campaign.id,
    amount: amountRounded,
    method,
  })

  await recordConsentBundle({
    event,
    userId: session?.sub ?? null,
    donationId: donation.id,
  })

  return donation
})
