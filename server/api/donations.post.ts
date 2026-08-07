import { formatAmountMaxLabel, isValidAmount } from '../../utils/fieldLimits'

export default defineEventHandler(async (event) => {
  const session = optionalSession(event)
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

  // Redondeo a centavos para no arrastrar basura de float desde el cliente.
  const amountRounded = Math.round(amount * 100) / 100

  return await createDonation({
    userId: session?.sub ?? null,
    churchId: String(body.churchId).slice(0, 64),
    campaignId: campaign.id,
    amount: amountRounded,
    method: body.method === 'card' ? 'card' : 'spei',
  })
})
