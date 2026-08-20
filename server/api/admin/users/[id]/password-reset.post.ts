export default defineEventHandler(async (event) => {
  const session = requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Id requerido' })
  }

  const origin = getRequestURL(event).origin
  const result = await createPasswordResetLink(id, session.sub, origin)

  // Sin servicio de correo aún: el admin copia el enlace y lo reenvía al donante.
  return {
    message: 'Enlace de restablecimiento generado. Válido 24 horas.',
    resetUrl: result.resetUrl,
    expiresAt: result.expiresAt,
  }
})
