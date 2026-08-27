export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const body = await readBody(event)

  return await updateSiteSettings({
    contactPhone: body?.contactPhone !== undefined ? String(body.contactPhone) : undefined,
    contactEmail: body?.contactEmail !== undefined ? String(body.contactEmail) : undefined,
    speiBank: body?.speiBank !== undefined ? String(body.speiBank) : undefined,
    speiBeneficiary: body?.speiBeneficiary !== undefined ? String(body.speiBeneficiary) : undefined,
    speiClabe: body?.speiClabe !== undefined ? String(body.speiClabe) : undefined,
    speiConcept: body?.speiConcept !== undefined ? String(body.speiConcept) : undefined,
  })
})
