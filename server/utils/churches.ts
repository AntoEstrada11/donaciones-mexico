import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { Church, ChurchApiItem, ChurchesApiResponse, ChurchesListResponse } from '~/types'
import { mapChurch } from '../../utils/mapChurch'

const SAMPLE_PATH = join(process.cwd(), 'server', 'data', 'churches.json')
const FETCH_TIMEOUT_MS = 8000
const MAX_REMOTE_CHURCHES = 1000
const API_KEY_HEADER = 'X-API-Key'

interface ChurchesCacheEntry {
  expiresAt: number
  churches: Church[]
}

/** Caché en memoria del proceso; reduce llamadas a Odoo y protege la API key. */
const remoteCache = new Map<string, ChurchesCacheEntry>()

function runtimeChurchesConfig() {
  const config = useRuntimeConfig()
  return {
    url: String(config.churchesApiUrl || '').trim(),
    apiKey: String(config.churchesApiKey || '').trim(),
    allowedHost: String(config.churchesApiAllowedHost || 'miembros.iurdsys.net').trim().toLowerCase(),
    cacheTtlMs: Number(config.churchesCacheTtlMs) || 3_600_000,
  }
}

/** Solo HTTPS hacia un host explícitamente permitido (anti-SSRF). */
function assertSecureChurchesUrl(urlString: string, allowedHost: string): URL {
  let parsed: URL
  try {
    parsed = new URL(urlString)
  }
  catch {
    throw new Error('churchesApiUrl inválida')
  }

  if (parsed.protocol !== 'https:') {
    throw new Error('churchesApiUrl debe usar HTTPS')
  }

  const hostname = parsed.hostname.toLowerCase()
  if (hostname !== allowedHost) {
    throw new Error('Host de iglesias no permitido')
  }

  // Credenciales embebidas en la URL quedarían en logs de red/proxy.
  if (parsed.username || parsed.password) {
    throw new Error('churchesApiUrl no debe incluir credenciales')
  }

  return parsed
}

function buildOdooHeaders(apiKey: string): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  }
  if (apiKey) {
    headers[API_KEY_HEADER] = apiKey
  }
  return headers
}

function validateRemoteResults(raw: unknown): ChurchApiItem[] {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Respuesta de iglesias inválida')
  }

  const results = (raw as ChurchesApiResponse).results
  if (!Array.isArray(results)) {
    throw new Error('Respuesta de iglesias sin results')
  }

  if (results.length > MAX_REMOTE_CHURCHES) {
    throw new Error('Respuesta de iglesias demasiado grande')
  }

  for (const item of results) {
    if (!item || typeof item !== 'object') {
      throw new Error('Ítem de iglesia inválido')
    }
    if (typeof item.id !== 'number' || !Number.isFinite(item.id)) {
      throw new Error('Ítem de iglesia sin id')
    }
    if (typeof item.name !== 'string' || !item.name.trim()) {
      throw new Error('Ítem de iglesia sin nombre')
    }
  }

  return results
}

function readCache(key: string): Church[] | null {
  const entry = remoteCache.get(key)
  if (!entry) return null
  if (Date.now() >= entry.expiresAt) {
    remoteCache.delete(key)
    return null
  }
  return entry.churches
}

function writeCache(key: string, churches: Church[], ttlMs: number) {
  remoteCache.set(key, {
    churches,
    expiresAt: Date.now() + ttlMs,
  })
}

async function fetchOdoo(latitude: number, longitude: number): Promise<Church[]> {
  const { url, apiKey, allowedHost, cacheTtlMs } = runtimeChurchesConfig()
  if (!url) {
    throw new Error('Falta churchesApiUrl')
  }

  assertSecureChurchesUrl(url, allowedHost)

  const cacheKey = `${latitude.toFixed(2)}:${longitude.toFixed(2)}`
  const cached = readCache(cacheKey)
  if (cached) return cached

  const remote = await $fetch<ChurchesApiResponse>(url, {
    query: { latitude, longitude },
    headers: buildOdooHeaders(apiKey),
    timeout: FETCH_TIMEOUT_MS,
    redirect: 'error',
  })

  const churches = validateRemoteResults(remote).map(mapChurch)
  writeCache(cacheKey, churches, cacheTtlMs)
  return churches
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
    const churches = await fetchOdoo(latitude, longitude)
    return { churches, source: 'odoo' }
  }
  catch {
    // Sin registrar detalle: la respuesta remota puede contener direcciones.
    const churches = await loadSample()
    return { churches, source: 'sample' }
  }
}

/** Nombres para el panel: caché de Odoo si ya existe; si no, JSON local. No espera a Odoo. */
export async function churchNamesWithoutRemoteFetch(): Promise<Map<string, string>> {
  const names = new Map<string, string>()
  const now = Date.now()
  for (const entry of remoteCache.values()) {
    if (entry.expiresAt > now) {
      for (const church of entry.churches) {
        names.set(church.id, church.name)
      }
      if (names.size) return names
    }
  }
  for (const church of await loadSample()) {
    names.set(church.id, church.name)
  }
  return names
}

// Para tests internos / invalidación manual si hiciera falta en el futuro.
export function clearChurchesRemoteCache() {
  remoteCache.clear()
}
