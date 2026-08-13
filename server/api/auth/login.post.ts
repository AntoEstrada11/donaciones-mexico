import type { AuthResponse } from '~/types'
import { isValidEmail, sanitizeEmailInput } from '../../../utils/fieldLimits'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const email = sanitizeEmailInput(String(body?.email || ''))
  const password = String(body?.password || '')

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Correo y contraseña son requeridos',
    })
  }

  if (!isValidEmail(email)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Ingrese un correo válido',
    })
  }

  const user = await findUserByEmail(email)
  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Correo o contraseña incorrectos',
    })
  }

  const token = signToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })

  const response: AuthResponse = {
    token,
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    profileComplete: user.profileComplete,
  }

  return response
})
