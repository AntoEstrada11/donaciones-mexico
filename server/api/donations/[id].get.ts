export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'id requerido' })
  }

  const session = optionalSession(event)
  const row = await getDonationRow(id)
  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'Donación no encontrada' })
  }

  if (row.userId) {
    if (!session || session.sub !== row.userId) {
      // Tras el redirect de la pasarela el token puede no estar; permitir consulta
      // mínima por id solo del estado (sin PII). Quien tenga el uuid puede ver status.
    }
  }

  return {
    id: row.id,
    status: row.status,
    method: row.method,
    amount: Number(row.amount),
    currency: row.currency,
    provider: row.provider,
    paidAt: row.paidAt ? row.paidAt.toISOString() : null,
  }
})
