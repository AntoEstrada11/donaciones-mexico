import { formatAmountMaxLabel, isValidAmount } from '../../utils/fieldLimits'
import type { DonationCreateResponse, DonationMethod } from '~/types'

export default defineEventHandler(async (event): Promise<DonationCreateResponse> => {
  const session = optionalSession(event)
  assertNotOperator(session)
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

  if (body?.wantsReceipt === true) {
    if (!session?.sub) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Inicie sesión para solicitar factura.',
      })
    }
    await updateDonorProfile(session.sub, {
      wantsReceipt: true,
      fiscalName: body.fiscalName !== undefined ? String(body.fiscalName) : undefined,
      rfc: body.rfc !== undefined ? String(body.rfc) : undefined,
      zip: body.zip !== undefined ? String(body.zip) : undefined,
      taxRegime: body.taxRegime !== undefined ? String(body.taxRegime) : undefined,
      cfdiUse: body.cfdiUse !== undefined ? String(body.cfdiUse) : undefined,
    })
  }
  else if (body?.wantsReceipt === false && session?.sub) {
    await updateDonorProfile(session.sub, { wantsReceipt: false })
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

  const uma = session?.sub ? await refreshDonorCompliance(session.sub) : undefined

  return { donation, checkoutUrl: null, uma }
})
