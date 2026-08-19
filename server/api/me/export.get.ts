import type { DataExport } from '~/types'
import { LEGAL } from '../../../utils/legal'

/** Derecho de acceso: copia completa y portable de los datos del titular. */
export default defineEventHandler(async (event): Promise<DataExport> => {
  const session = requireSession(event)

  const user = await findUserById(session.sub)
  const profile = await getDonorProfile(session.sub)

  if (!user || !profile) {
    throw createError({ statusCode: 404, statusMessage: 'Usuario no encontrado' })
  }

  const [donations, consents] = await Promise.all([
    listDonationsByUser(session.sub),
    listConsentsByUser(session.sub),
  ])

  setHeader(event, 'content-disposition', 'attachment; filename="mis-datos.json"')

  return {
    exportedAt: new Date().toISOString(),
    noticeVersion: LEGAL.noticeVersion,
    account: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    },
    profile: {
      phone: profile.phone,
      wantsReceipt: profile.wantsReceipt,
      street: profile.street,
      city: profile.city,
      state: profile.state,
      zip: profile.zip,
      rfc: profile.rfc,
    },
    donations,
    consents,
  }
})
