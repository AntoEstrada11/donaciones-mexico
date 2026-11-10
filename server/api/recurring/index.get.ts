export default defineEventHandler(async (event) => {
  const session = await requireActiveSession(event)
  await assertNotOperator(session)
  await assertEmailVerified(session.sub)
  return { items: await listRecurringByUser(session.sub) }
})
