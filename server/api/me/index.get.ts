export default defineEventHandler(async (event) => {
  const session = requireSession(event)
  const profile = await getDonorProfile(session.sub)

  if (!profile) {
    throw createError({ statusCode: 401, statusMessage: 'Usuario no encontrado' })
  }

  return profile
})
