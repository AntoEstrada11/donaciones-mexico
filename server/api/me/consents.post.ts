import type { ConsentType } from '~/types'

/**
 * Derecho de oposición y revocación sobre finalidades secundarias.
 * Las finalidades necesarias no se revocan aquí: para eso está la baja de cuenta.
 */
const REVOCABLE: ConsentType[] = ['marketing']

export default defineEventHandler(async (event) => {
  const session = await requireActiveSession(event)
  const body = await readBody(event)
  const type = String(body?.type || '') as ConsentType

  if (!REVOCABLE.includes(type)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Esta finalidad no se puede cambiar desde aquí. Elimine su cuenta o escríbanos.',
    })
  }

  if (typeof body?.granted !== 'boolean') {
    throw createError({ statusCode: 400, statusMessage: 'Indique si otorga o retira el consentimiento' })
  }

  await recordConsent({ event, userId: session.sub, type, granted: body.granted })

  return await getLatestConsents(session.sub)
})
