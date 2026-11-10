export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  const requestId = getRouterParam(event, 'requestId')
  if (!id || !requestId) {
    throw createError({ statusCode: 400, statusMessage: 'Id requerido' })
  }

  const body = await readBody(event)
  const status = String(body?.status || '')
  if (status !== 'resolved' && status !== 'cancelled') {
    throw createError({ statusCode: 400, statusMessage: 'Estado inválido' })
  }

  return await setDonorRequestStatus(id, requestId, status)
})
