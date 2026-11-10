export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const token = String(body?.token || '').trim()
  if (!token) {
    throw createError({ statusCode: 400, statusMessage: 'Token requerido' })
  }
  await consumeEmailVerificationToken(token)
  return { ok: true }
})
