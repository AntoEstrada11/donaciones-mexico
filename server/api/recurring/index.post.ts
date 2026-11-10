import type { DonationMethod, RecurringFrequency } from '~/types'

export default defineEventHandler(async (event) => {
  const session = await requireActiveSession(event)
  await assertNotOperator(session)
  await assertEmailVerified(session.sub)

  const body = await readBody(event)
  const churchId = String(body?.churchId || '')
  const campaignId = String(body?.campaignId || '')
  const amount = Number(body?.amount)
  const frequency = String(body?.frequency || 'monthly') as RecurringFrequency
  const method = String(body?.method || 'spei') as DonationMethod

  if (!churchId || !campaignId) {
    throw createError({ statusCode: 400, statusMessage: 'Iglesia y campaña son requeridas' })
  }
  if (!['spei', 'card', 'paypal'].includes(method)) {
    throw createError({ statusCode: 400, statusMessage: 'Método inválido' })
  }

  const item = await createRecurring({
    userId: session.sub,
    churchId,
    campaignId,
    amount,
    frequency,
    method,
  })
  return { item }
})
