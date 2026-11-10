export default defineEventHandler(async (event) => {
  const raw = String(getRouterParam(event, 'cp') || '')
  const cp = sanitizeZipInput(raw)
  if (!isValidZip(cp) || !cp) {
    throw createError({ statusCode: 400, statusMessage: 'El código postal debe tener 5 dígitos' })
  }

  try {
    const payload = await $fetch<{
      places?: Array<{
        'place name'?: string
        state?: string
      }>
    }>(`https://api.zippopotam.us/mx/${cp}`, { timeout: 8_000 })

    const colonies = [...new Set(
      (payload.places || [])
        .map(place => String(place['place name'] || '').trim())
        .filter(Boolean),
    )]
    const state = payload.places?.[0]?.state?.trim() || null

    return { zip: cp, state, colonies }
  }
  catch (error) {
    const status = Number((error as { statusCode?: number })?.statusCode)
    if (status === 404) {
      return { zip: cp, state: null, colonies: [] }
    }
    throw createError({
      statusCode: 502,
      statusMessage: 'No se pudo consultar el código postal. Escríbalo a mano.',
    })
  }
})
