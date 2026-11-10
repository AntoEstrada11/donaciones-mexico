export default defineEventHandler(async (event) => {
  const session = await requireContentEditor(event)
  const body = await readBody(event)

  const touchesSpei = [
    body?.speiBank,
    body?.speiBeneficiary,
    body?.speiClabe,
    body?.speiConcept,
  ].some(value => value !== undefined)

  if (touchesSpei && session.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Solo un administrador puede cambiar los datos SPEI (CLABE / banco)',
    })
  }

  const patch: {
    contactPhone?: string
    contactEmail?: string
    speiBank?: string
    speiBeneficiary?: string
    speiClabe?: string
    speiConcept?: string
  } = {
    contactPhone: body?.contactPhone !== undefined ? String(body.contactPhone) : undefined,
    contactEmail: body?.contactEmail !== undefined ? String(body.contactEmail) : undefined,
  }

  if (session.role === 'admin') {
    patch.speiBank = body?.speiBank !== undefined ? String(body.speiBank) : undefined
    patch.speiBeneficiary = body?.speiBeneficiary !== undefined ? String(body.speiBeneficiary) : undefined
    patch.speiClabe = body?.speiClabe !== undefined ? String(body.speiClabe) : undefined
    patch.speiConcept = body?.speiConcept !== undefined ? String(body.speiConcept) : undefined
  }

  return await updateSiteSettings(patch)
})
