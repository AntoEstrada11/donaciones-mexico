function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export default defineEventHandler(async (event) => {
  const session = await requireActiveSession(event)
  const id = String(getRouterParam(event, 'id') || '')
  const donation = await findDonationForUser(id, session.sub)
  if (!donation) {
    throw createError({ statusCode: 404, statusMessage: 'Donación no encontrada' })
  }
  if (donation.status !== 'paid') {
    throw createError({
      statusCode: 409,
      statusMessage: 'La constancia solo está disponible cuando el donativo está pagado.',
    })
  }

  const profile = await getDonorProfile(session.sub)
  const identity = await getIdentityStatus(session.sub)
  if (!profile?.wantsReceipt || !profile.rfc || !identity.complete) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Complete datos fiscales e identificación (INE anverso y reverso) en su perfil.',
    })
  }

  const campaign = await findCampaignById(donation.campaignId)
  const church = donation.churchName || donation.churchId
  const campaignName = donation.campaignName || campaign?.name || donation.campaignId
  const amount = donation.amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const date = new Date(donation.paidAt || donation.createdAt).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const html = `<!DOCTYPE html>
<html lang="es-MX">
<head>
<meta charset="utf-8">
<title>Constancia de donativo</title>
<style>
  body { font-family: Georgia, serif; color: #1a1a1a; max-width: 640px; margin: 2rem auto; padding: 0 1rem; }
  h1 { font-size: 1.25rem; }
  .note { font-size: 0.85rem; color: #444; border-top: 1px solid #ccc; padding-top: 1rem; margin-top: 2rem; }
</style>
</head>
<body>
  <p>${escapeHtml(LEGAL.razonSocial)}</p>
  <h1>Constancia de donativo</h1>
  <p>Fecha: ${escapeHtml(date)}</p>
  <p>Donante: ${escapeHtml(profile.fiscalName || profile.name)}</p>
  <p>RFC: ${escapeHtml(profile.rfc)}</p>
  <p>Iglesia: ${escapeHtml(church)}</p>
  <p>Concepto: ${escapeHtml(campaignName)}</p>
  <p>Importe: $${escapeHtml(amount)} MXN</p>
  <p>Folio interno: ${escapeHtml(donation.id)}</p>
  <p class="note">Este documento es una constancia interna de la Iglesia. <strong>No es un CFDI timbrado por el SAT</strong>. El timbrado fiscal requiere un PAC, que aún no está conectado a este sitio.</p>
</body>
</html>`

  setHeader(event, 'content-type', 'text/html; charset=utf-8')
  setHeader(event, 'content-disposition', `attachment; filename="constancia-${donation.id.slice(0, 8)}.html"`)
  return html
})
