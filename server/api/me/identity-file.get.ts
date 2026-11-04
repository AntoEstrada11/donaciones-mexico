/**
 * Derecho de acceso: el binario sale solo con sesión del titular.
 * MinIO no es alcanzable desde Internet; Nitro actúa de proxy.
 */
export default defineEventHandler(async (event) => {
  const session = await requireActiveSession(event)
  const side = String(getQuery(event).side || '')
  if (!isIdentitySide(side)) {
    throw createError({ statusCode: 400, statusMessage: 'Indique anverso o reverso' })
  }

  const file = await getIdentityFile(session.sub, side)
  if (!file) {
    throw createError({ statusCode: 404, statusMessage: 'No hay imagen de ese lado' })
  }

  setHeader(event, 'content-type', file.mime)
  setHeader(event, 'cache-control', 'private, no-store')
  setHeader(event, 'content-disposition', `attachment; filename="identificacion-${side}"`)
  return file.bytes
})
