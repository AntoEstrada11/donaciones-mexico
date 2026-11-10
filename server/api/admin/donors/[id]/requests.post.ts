import { createAndSendDonorRequest, isDonorRequestType } from '../../../../utils/donorRequests'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Id requerido' })
  }

  const body = await readBody(event)
  const type = String(body?.type || '')
  if (!isDonorRequestType(type)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tipo inválido (identity, fiscal o email_verify)',
    })
  }

  const origin = getRequestURL(event).origin
  return await createAndSendDonorRequest({
    userId: id,
    type,
    actorUserId: admin.sub,
    origin,
  })
})
