/** Estado vigente de cada consentimiento del titular. */
export default defineEventHandler(async (event) => {
  const session = requireSession(event)
  return await getLatestConsents(session.sub)
})
