import { mailDevReturnLink } from '../../../../utils/mail'

export default defineEventHandler(async (event) => {
  const session = await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Id requerido' })
  }

  const origin = getRequestURL(event).origin
  const result = await createPasswordResetLink(id, session.sub, origin)
  const returnLink = !result.emailed && mailDevReturnLink()

  return {
    message: result.emailed
      ? 'Enviamos el enlace de restablecimiento al correo del donante. Válido 24 horas.'
      : (returnLink
          ? 'No hay SMTP configurado: copie el enlace y envíelo al donante. Válido 24 horas.'
          : 'Se generó el restablecimiento. Configure SMTP para enviarlo al correo del donante.'),
    emailed: result.emailed,
    resetUrl: returnLink ? result.resetUrl : undefined,
    expiresAt: result.expiresAt,
  }
})
