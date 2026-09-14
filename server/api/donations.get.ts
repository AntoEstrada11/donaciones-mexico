export default defineEventHandler(async (event) => {
  const session = await requireActiveSession(event)
  assertNotOperator(session)
  return await listDonationsByUser(session.sub)
})
