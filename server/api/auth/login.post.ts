import type { AuthResponse } from '~/types'
import { isValidEmail, sanitizeEmailInput } from '../../../utils/fieldLimits'
import { tryOperatorAuth } from '../../utils/operatorAuth'

/**
 * Una sola puerta: donante local o operador del Auth Hub.
 * Si el correo ya es donante, no se consulta el hub.
 */
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

  let user
  try {
    user = await findUserByEmail(email)
  }
  catch (error) {
    throwIfDatabaseError(error)
  }

  if (user?.role === 'donor') {
    if (!verifyPassword(password, user.passwordHash)) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Correo o contraseña incorrectos',
      })
    }

    if (user.status === 'deactivated') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Su cuenta está dada de baja. Contacte a la iglesia si necesita reactivarla.',
      })
    }

    const response: AuthResponse = {
      token: signToken({
        sub: user.id,
        email: user.email,
        name: user.name,
        role: 'donor',
      }),
      id: user.id,
      name: user.name,
      email: user.email,
      role: 'donor',
      profileComplete: user.profileComplete,
    }
    return response
  }

  let operator: AuthResponse | null = null
  try {
    operator = await tryOperatorAuth(email, password)
  }
  catch (error) {
    throwIfDatabaseError(error)
    throw error
  }

  if (operator) return operator

  throw createError({
    statusCode: 401,
    statusMessage: 'Correo o contraseña incorrectos',
  })
})
