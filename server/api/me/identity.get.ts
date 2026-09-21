export default defineEventHandler(async (event) => {
  const session = await requireActiveSession(event)
  return await getIdentityStatus(session.sub)
})
