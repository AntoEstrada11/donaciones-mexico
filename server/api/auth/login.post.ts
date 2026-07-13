import type { AuthResponse } from '~/types'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const email = normalizeEmail(String(body?.email || ''))
  const password = String(body?.password || '')

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Correo y contraseña son requeridos',
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
    sub: user.email,
    email: user.email,
    name: user.name,
    odooPartnerId: user.odooPartnerId,
  })

  const response: AuthResponse = {
    token,
    name: user.name,
    email: user.email,
    odooPartnerId: user.odooPartnerId,
    profileComplete: user.profileComplete,
  }

  return response
})
