/**
 * Derecho de cancelación. Pide la contraseña para evitar que una sesión robada
 * borre la cuenta, y deja constancia de la revocación antes de eliminar.
 */
export default defineEventHandler(async (event) => {
  const session = await requireActiveSession(event)
  const body = await readBody(event)
  const password = String(body?.password || '')

  if (!password) {
    throw createError({ statusCode: 400, statusMessage: 'Ingrese su contraseña para confirmar' })
  }

  const user = await findUserById(session.sub)
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'Usuario no encontrado' })
  }

  if (!verifyPassword(password, user.passwordHash)) {
    throw createError({ statusCode: 401, statusMessage: 'La contraseña no es correcta' })
  }

  await recordConsent({ event, userId: user.id, type: 'privacy_notice', granted: false })
  await recordConsent({ event, userId: user.id, type: 'sensitive_data', granted: false })
  await recordConsent({ event, userId: user.id, type: 'marketing', granted: false })

  await deleteUserAccount(user.id)

  return { deleted: true }
})
