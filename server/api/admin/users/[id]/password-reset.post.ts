export default defineEventHandler(async (event) => {
  const session = requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Id requerido' })
  }

  const origin = getRequestURL(event).origin
  const result = await createPasswordResetLink(id, session.sub, origin)

  return {
    message: result.emailed
      ? 'Enviamos el enlace de restablecimiento al correo del donante. Válido 24 horas.'
      : 'No hay SMTP configurado: copie el enlace y envíelo al donante. Válido 24 horas.',
    emailed: result.emailed,
    resetUrl: result.resetUrl,
    expiresAt: result.expiresAt,
  }
})

