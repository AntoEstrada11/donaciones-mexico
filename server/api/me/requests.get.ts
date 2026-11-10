export default defineEventHandler(async (event) => {
  const session = await requireActiveSession(event)
  return await listDonorRequests(session.sub, true)
})
