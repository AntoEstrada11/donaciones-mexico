export default defineEventHandler(async (event) => {
  const session = await requireActiveSession(event)
  await assertNotOperator(session)
  return await listDonationsByUser(session.sub)
})
