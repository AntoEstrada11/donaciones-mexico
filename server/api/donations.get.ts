export default defineEventHandler(async (event) => {
  const session = requireSession(event)
  return await listDonationsByUser(session.sub)
})
