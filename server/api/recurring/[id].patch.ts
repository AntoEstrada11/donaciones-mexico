import type { RecurringStatus } from '~/types'

export default defineEventHandler(async (event) => {
  const session = await requireActiveSession(event)
  await assertNotOperator(session)
  await assertEmailVerified(session.sub)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Id requerido' })
  }

  const body = await readBody(event)
  const status = String(body?.status || '') as RecurringStatus
  if (!['active', 'paused', 'cancelled'].includes(status)) {
    throw createError({ statusCode: 400, statusMessage: 'Estado inválido' })
  }

  const item = await updateRecurringStatus(
    session.sub,
    id,
    status as 'active' | 'paused' | 'cancelled',
  )
  return { item }
})
