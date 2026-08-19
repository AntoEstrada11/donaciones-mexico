import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { Church, ChurchesApiResponse, ChurchesListResponse } from '~/types'
import { mapChurch } from '../../utils/mapChurch'

const SAMPLE_PATH = join(process.cwd(), 'server', 'data', 'churches.json')
const FETCH_TIMEOUT_MS = 8000

function churchesApiUrl() {
  return String(useRuntimeConfig().churchesApiUrl || '')
}

async function fetchWordPress(latitude: number, longitude: number): Promise<Church[]> {
  const url = churchesApiUrl()
  if (!url) {
    throw new Error('Falta churchesApiUrl')
  }

  const remote = await $fetch<ChurchesApiResponse>(url, {
    query: { latitude, longitude },
    timeout: FETCH_TIMEOUT_MS,
  })

  if (!Array.isArray(remote?.results)) {
    throw new Error('Respuesta de iglesias sin results')
  }

  return remote.results.map(mapChurch)
}

async function loadSample(): Promise<Church[]> {
  const raw = await readFile(SAMPLE_PATH, 'utf8')
  const parsed = JSON.parse(raw) as Church[]
  if (!Array.isArray(parsed)) {
    throw new Error('churches.json inválido')
  }
  return parsed
}

export async function listChurches(latitude: number, longitude: number): Promise<ChurchesListResponse> {
  try {
    const churches = await fetchWordPress(latitude, longitude)
    return { churches, source: 'wordpress' }
  }
  catch {
    const churches = await loadSample()
    return { churches, source: 'sample' }
  }
}
