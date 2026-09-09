import type { AuthResponse } from '~/types'
import {
  FIELD_LIMITS,
  isValidEmail,
  isValidPassword,
  sanitizeEmailInput,
  sanitizeNameInput,
} from '../../../utils/fieldLimits'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const email = sanitizeEmailInput(String(body?.email || ''))
  const password = String(body?.password || '')
  const name = sanitizeNameInput(
    String(body?.name || '').trim() || email.split('@')[0] || 'Donante',
  )

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

  if (!isValidPassword(password)) {
    throw createError({
      statusCode: 400,
      statusMessage: `La contraseña debe tener entre ${FIELD_LIMITS.password.min} y ${FIELD_LIMITS.password.max} caracteres`,
    })
  }

  if (!name.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El nombre es requerido',
    })
  }

  // Datos sensibles (creencias religiosas): sin consentimiento expreso no hay tratamiento.
  if (body?.consent !== true) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Debe aceptar el aviso de privacidad para crear su cuenta',
    })
  }

  let user
  try {
    user = await createUser({
      email,
      name: name.trim(),
      passwordHash: hashPassword(password),
    })
  }
  catch (error) {
    throwIfDatabaseError(error)
  }

  if (!user) {
    throw createError({
      statusCode: 503,
      statusMessage: 'El servicio de datos no está disponible. Intente más tarde.',
    })
  }

  await recordConsentBundle({
    event,
    userId: user.id,
    marketing: body?.marketing === true,
  })

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
