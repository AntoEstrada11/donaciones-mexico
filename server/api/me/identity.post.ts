import { eq } from 'drizzle-orm'
import { donorProfiles } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const session = await requireActiveSession(event)
  const form = await readMultipartFormData(event)
  if (!form?.length) {
    throw createError({ statusCode: 400, statusMessage: 'Adjunte la foto de la credencial' })
  }

  const sidePart = form.find(part => part.name === 'side')
  const consentPart = form.find(part => part.name === 'consent')
  const filePart = form.find(part => part.name === 'file' && part.data?.length)

  const side = String(sidePart?.data?.toString('utf8') || '')
  if (!isIdentitySide(side)) {
    throw createError({ statusCode: 400, statusMessage: 'Indique anverso o reverso' })
  }

  if (String(consentPart?.data?.toString('utf8') || '') !== 'true') {
    throw createError({
      statusCode: 422,
      statusMessage: 'Debe aceptar el tratamiento de su identificación para adjuntarla',
    })
  }

  if (!filePart) {
    throw createError({ statusCode: 400, statusMessage: 'Adjunte la foto de la credencial' })
  }

  const mime = filePart.type || 'application/octet-stream'
  await saveIdentityImage({
    userId: session.sub,
    side,
    mime,
    bytes: Buffer.from(filePart.data),
  })

  const status = await getIdentityStatus(session.sub)
  if (status.complete) {
    const db = useDatabase()
    await db
      .update(donorProfiles)
      .set({ identityVerifiedAt: new Date(), updatedAt: new Date() })
      .where(eq(donorProfiles.userId, session.sub))
  }

  await recordConsent({
    event,
    userId: session.sub,
    type: 'identity_document',
    granted: true,
  })

  return await getIdentityStatus(session.sub)
})
