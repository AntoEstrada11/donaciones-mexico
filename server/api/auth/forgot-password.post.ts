import { isValidEmail, sanitizeEmailInput } from '../../../utils/fieldLimits'

/** Respuesta uniforme: no revela si el correo está registrado. */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const email = sanitizeEmailInput(String(body?.email || ''))

  if (!email || !isValidEmail(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Ingrese un correo válido' })
  }

  const origin = getRequestURL(event).origin
  await requestPasswordResetByEmail(email, origin)
  return {
    ok: true,
    message: 'Si el correo está registrado, enviamos instrucciones para restablecer la contraseña.',
  }
})
