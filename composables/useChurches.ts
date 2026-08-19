import type { Ref } from 'vue'
import type { ChurchesListResponse } from '~/types'

const CACHE_TTL = 15 * 60 * 1000 // 15 minutos

function cacheKey(lat: number, lng: number) {
  return `churches:${lat.toFixed(2)}:${lng.toFixed(2)}`
}

function readCache(lat: number, lng: number): ChurchesListResponse | null {
  if (!import.meta.client) return null

  try {
    const raw = sessionStorage.getItem(cacheKey(lat, lng))
    if (!raw) return null

    const { savedAt, data } = JSON.parse(raw) as {
      savedAt: number
      data: ChurchesListResponse
    }

    if (Date.now() - savedAt > CACHE_TTL) {
      sessionStorage.removeItem(cacheKey(lat, lng))
      return null
    }

    if (!data || !Array.isArray(data.churches)) return null

    return data
  }
  catch {
    return null
  }
}

function writeCache(lat: number, lng: number, data: ChurchesListResponse) {
  if (!import.meta.client) return

  try {
    sessionStorage.setItem(cacheKey(lat, lng), JSON.stringify({
      savedAt: Date.now(),
      data,
    }))
  }
  catch {
    // sessionStorage lleno o bloqueado — ignorar
  }
}

async function fetchChurches(
  latitude: number,
  longitude: number,
): Promise<ChurchesListResponse> {
  const cached = readCache(latitude, longitude)
  if (cached) return cached

  const response = await $fetch<ChurchesListResponse>('/api/churches', {
    query: { latitude, longitude },
  })

  writeCache(latitude, longitude, response)
  return response
}

export function useChurches(coords: Ref<{ latitude: number, longitude: number }>) {
  const dataKey = computed(
    () => `churches-${coords.value.latitude.toFixed(2)}-${coords.value.longitude.toFixed(2)}`,
  )

  const { data, pending, error, refresh } = useAsyncData(
    dataKey,
    () => fetchChurches(
      coords.value.latitude,
      coords.value.longitude,
    ),
    {
      watch: [coords],
      getCachedData(key) {
        const nuxtCached = useNuxtData<ChurchesListResponse>(key).data.value
        if (nuxtCached) return nuxtCached

        return readCache(coords.value.latitude, coords.value.longitude) ?? undefined
      },
    },
  )

  return { data, pending, error, refresh }
}
