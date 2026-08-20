import { isValidPassword } from '../../../utils/fieldLimits'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const token = String(body?.token || '').trim()
  const password = String(body?.password || '')

  if (!token || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Token y contraseña son requeridos' })
  }

  if (!isValidPassword(password)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'La contraseña debe tener entre 6 y 128 caracteres',
    })
  }

  await consumePasswordResetToken(token, password)
  return { ok: true }
})
