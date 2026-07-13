import type { Donation } from '~/types'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body?.churchId || !body?.campaignId || !body?.amount) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Iglesia, campaña y monto son requeridos',
    })
  }

  const amount = Number(body.amount)
  if (!Number.isFinite(amount) || amount <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El monto debe ser mayor a cero',
    })
  }

  const donation: Donation = {
    id: `don-${Date.now()}`,
    churchId: String(body.churchId),
    campaignId: String(body.campaignId),
    amount,
    currency: 'MXN',
    status: 'pending',
    method: body.method === 'card' ? 'card' : 'spei',
    createdAt: new Date().toISOString(),
  }

  return donation
})
