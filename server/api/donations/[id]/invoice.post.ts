export default defineEventHandler(async (event) => {
  const session = await requireActiveSession(event)
  await assertNotOperator(session)
  await assertEmailVerified(session.sub)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Id requerido' })
  }

  return { invoice: await requestCfdiForDonation(session.sub, id) }
})
