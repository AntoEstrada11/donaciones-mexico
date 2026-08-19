/**
 * Descarga el catálogo de iglesias desde Odoo y escribe server/data/churches.json.
 * Ejecutar cuando Odoo esté disponible, antes de un despliegue o tras cambios en el directorio.
 *
 *   npm run db:sync-churches
 */
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { Church, ChurchApiItem, ChurchesApiResponse } from '../../types/index.ts'
import { mapChurch } from '../../utils/mapChurch.ts'

const OUTPUT_PATH = join(process.cwd(), 'server', 'data', 'churches.json')
const FETCH_TIMEOUT_MS = 30_000
const DEFAULT_LAT = 19.392531016453
const DEFAULT_LNG = -99.18114903857942
const ALLOWED_HOST = (process.env.NUXT_CHURCHES_API_ALLOWED_HOST || 'miembros.iurdsys.net').toLowerCase()

function assertSecureUrl(urlString: string): URL {
  const parsed = new URL(urlString)
  if (parsed.protocol !== 'https:') {
    throw new Error('NUXT_CHURCHES_API_URL debe usar HTTPS')
  }
  if (parsed.hostname.toLowerCase() !== ALLOWED_HOST) {
    throw new Error(`Host no permitido: ${parsed.hostname}`)
  }
  return parsed
}

function toFallbackRecord(church: Church): Church {
  const { distance: _distance, ...rest } = church
  return rest
}

async function fetchCatalog(url: string, apiKey: string, latitude: number, longitude: number): Promise<Church[]> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (apiKey) {
    headers['X-API-Key'] = apiKey
  }

  const remote = await fetch(`${url}?latitude=${latitude}&longitude=${longitude}`, {
    headers,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    redirect: 'error',
  })

  if (!remote.ok) {
    throw new Error(`Odoo respondió HTTP ${remote.status}`)
  }

  const body = await remote.json() as ChurchesApiResponse
  if (!Array.isArray(body.results) || body.results.length === 0) {
    throw new Error('Odoo devolvió results vacío')
  }

  return body.results.map((item: ChurchApiItem) => mapChurch(item))
}

const apiUrl = process.env.NUXT_CHURCHES_API_URL || 'https://miembros.iurdsys.net/api/churches'
const apiKey = process.env.NUXT_CHURCHES_API_KEY || ''

assertSecureUrl(apiUrl)

const churches = await fetchCatalog(apiUrl, apiKey, DEFAULT_LAT, DEFAULT_LNG)
const fallback = churches.map(toFallbackRecord)

fallback.sort((a, b) => a.name.localeCompare(b.name, 'es-MX'))

await writeFile(OUTPUT_PATH, `${JSON.stringify(fallback, null, 2)}\n`, 'utf8')

console.log(`Plan B actualizado: ${fallback.length} iglesias en ${OUTPUT_PATH}`)
