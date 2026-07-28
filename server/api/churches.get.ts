import type { ChurchesApiResponse } from '~/types'

export default defineEventHandler(async (event): Promise<ChurchesApiResponse> => {
  const config = useRuntimeConfig()
  const query = getQuery(event)

  const latitude = Number(query.latitude ?? config.public.defaultLatitude)
  const longitude = Number(query.longitude ?? config.public.defaultLongitude)

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw createError({ statusCode: 400, statusMessage: 'Coordenadas inválidas' })
  }

  const apiUrl = String(config.public.churchesApiUrl || '')
  if (!apiUrl) {
    throw createError({ statusCode: 500, statusMessage: 'API de iglesias no configurada' })
  }

  try {
    return await $fetch<ChurchesApiResponse>(apiUrl, {
      query: { latitude, longitude },
    })
  }
  catch (e: unknown) {
    const msg = (e as { message?: string })?.message || 'No se pudieron cargar las iglesias'
    throw createError({ statusCode: 502, statusMessage: msg })
  }
})
