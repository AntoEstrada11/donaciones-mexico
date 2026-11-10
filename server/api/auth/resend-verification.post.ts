export default defineEventHandler(async (event) => {
  const session = await requireActiveSession(event)
  const origin = getRequestURL(event).origin
  const result = await issueEmailVerification(session.sub, origin)
  return {
    ok: true,
    sent: result.sent,
    verifyUrl: result.verifyUrl,
    message: result.sent
      ? 'Enviamos un nuevo enlace a su correo.'
      : (result.verifyUrl
          ? 'Correo no configurado en el servidor; use el enlace de desarrollo.'
          : 'Su correo ya está confirmado o no fue posible reenviar.'),
  }
})
