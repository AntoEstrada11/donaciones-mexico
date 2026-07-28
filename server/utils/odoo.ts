import type { DonorProfile } from '~/types'

export interface OdooPartnerInput {
  name: string
  email: string
  phone?: string
  street?: string
  city?: string
  state?: string
  zip?: string
  rfc?: string
}

interface OdooRpcResult<T = unknown> {
  jsonrpc: string
  id: number
  result?: T
  error?: { message: string, data?: { message?: string } }
}

function getOdooConfig() {
  const config = useRuntimeConfig()
  return {
    url: String(config.odooUrl || '').replace(/\/$/, ''),
    db: String(config.odooDb || ''),
    username: String(config.odooUsername || ''),
    password: String(config.odooPassword || ''),
  }
}

export function isOdooConfigured() {
  const { url, db, username, password } = getOdooConfig()
  return Boolean(url && db && username && password)
}

async function jsonRpc<T>(service: string, method: string, args: unknown[]): Promise<T> {
  const { url } = getOdooConfig()
  const response = await $fetch<OdooRpcResult<T>>(`${url}/jsonrpc`, {
    method: 'POST',
    body: {
      jsonrpc: '2.0',
      method: 'call',
      params: { service, method, args },
      id: Date.now(),
    },
  })

  if (response.error) {
    throw createError({
      statusCode: 502,
      statusMessage: response.error.data?.message || response.error.message || 'Error Odoo',
    })
  }

  return response.result as T
}

async function authenticate(): Promise<number> {
  const { db, username, password } = getOdooConfig()
  const uid = await jsonRpc<number | false>('common', 'authenticate', [db, username, password, {}])

  if (!uid) {
    throw createError({
      statusCode: 502,
      statusMessage: 'No se pudo autenticar con Odoo',
    })
  }

  return uid
}

async function executeKw<T>(
  model: string,
  method: string,
  args: unknown[] = [],
  kwargs: Record<string, unknown> = {},
): Promise<T> {
  const { db, password } = getOdooConfig()
  const uid = await authenticate()
  return jsonRpc<T>('object', 'execute_kw', [db, uid, password, model, method, args, kwargs])
}

/** Busca partner por email; si no existe, lo crea. Nunca crea res.users. */
export async function upsertOdooPartner(input: OdooPartnerInput): Promise<number> {
  if (!isOdooConfigured()) {
    // Modo mock: id estable a partir del email
    let hash = 0
    for (const ch of input.email.toLowerCase()) {
      hash = ((hash << 5) - hash) + ch.charCodeAt(0)
      hash |= 0
    }
    return Math.abs(hash) || 1
  }

  const found = await executeKw<number[]>('res.partner', 'search', [
    [['email', '=', input.email.toLowerCase()]],
  ], { limit: 1 })

  const values: Record<string, unknown> = {
    name: input.name,
    email: input.email.toLowerCase(),
    phone: input.phone || false,
    is_company: false,
    customer_rank: 1,
    comment: 'Creado desde Donaciones México (sin usuario Odoo)',
  }

  if (input.street) values.street = input.street
  if (input.city) values.city = input.city
  if (input.zip) values.zip = input.zip
  if (input.rfc) values.vat = input.rfc

  if (found.length) {
    await executeKw('res.partner', 'write', [found, values])
    return found[0]
  }

  return executeKw<number>('res.partner', 'create', [values])
}

export async function readOdooPartner(partnerId: number): Promise<DonorProfile | null> {
  if (!isOdooConfigured()) {
    return null
  }

  const rows = await executeKw<Array<Record<string, unknown>>>('res.partner', 'search_read', [
    [['id', '=', partnerId]],
  ], {
    fields: ['id', 'name', 'email', 'phone', 'street', 'city', 'state_id', 'zip', 'vat'],
    limit: 1,
  })

  const row = rows[0]
  if (!row) return null

  const stateId = row.state_id
  const stateName = Array.isArray(stateId) ? String(stateId[1]) : null

  return {
    id: '',
    odooPartnerId: Number(row.id),
    name: String(row.name || ''),
    email: String(row.email || ''),
    phone: row.phone ? String(row.phone) : null,
    street: row.street ? String(row.street) : null,
    city: row.city ? String(row.city) : null,
    state: stateName,
    zip: row.zip ? String(row.zip) : null,
    rfc: row.vat ? String(row.vat) : null,
    profileComplete: Boolean(row.phone && row.street && row.city),
    source: 'odoo',
  }
}

export async function updateOdooPartner(
  partnerId: number,
  input: Partial<OdooPartnerInput>,
): Promise<void> {
  if (!isOdooConfigured()) return

  const values: Record<string, unknown> = {}
  if (input.name !== undefined) values.name = input.name
  if (input.email !== undefined) values.email = input.email.toLowerCase()
  if (input.phone !== undefined) values.phone = input.phone || false
  if (input.street !== undefined) values.street = input.street || false
  if (input.city !== undefined) values.city = input.city || false
  if (input.zip !== undefined) values.zip = input.zip || false
  if (input.rfc !== undefined) values.vat = input.rfc || false

  if (Object.keys(values).length === 0) return

  await executeKw('res.partner', 'write', [[partnerId], values])
}
