import { isValidEmail, sanitizeEmailInput } from '../../../utils/fieldLimits'
import { tryOperatorAuth } from '../../utils/operatorAuth'

/** Conservado por compatibilidad; el personal usa el mismo POST /api/auth/login. */
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

  if (!isAuthHubEnabled()) {
    throw createError({
      statusCode: 503,
      statusMessage: 'El acceso de operación no está configurado',
    })
  }

  let operator
  try {
    operator = await tryOperatorAuth(email, password)
  }
  catch (error) {
    throwIfDatabaseError(error)
    throw error
  }

  if (!operator) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Correo o contraseña incorrectos',
    })
  }

  return operator
})
