import { and, asc, eq, gte, isNull, lte, or, sql } from 'drizzle-orm'
import { campaigns } from '../database/schema'
import type { AdminCampaign, Campaign } from '~/types'
function mapPublic(row: typeof campaigns.$inferSelect): Campaign {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    type: row.type,
  }
}

function mapAdmin(row: typeof campaigns.$inferSelect): AdminCampaign {
  return {
    ...mapPublic(row),
    sortOrder: row.sortOrder,
    active: row.active,
    startsAt: row.startsAt?.toISOString() ?? null,
    endsAt: row.endsAt?.toISOString() ?? null,
  }
}

/** Activa y dentro de la ventana (si hay fechas). */
export function campaignWindowSql(now = new Date()) {
  return and(
    eq(campaigns.active, true),
    or(isNull(campaigns.startsAt), lte(campaigns.startsAt, now)),
    or(isNull(campaigns.endsAt), gte(campaigns.endsAt, now)),
  )
}

export async function listPublicCampaigns(): Promise<Campaign[]> {
  const db = useDatabase()
  const rows = await db
    .select()
    .from(campaigns)
    .where(campaignWindowSql())
    .orderBy(asc(campaigns.sortOrder), asc(campaigns.name))
  return rows.map(mapPublic)
}

export async function findAvailableCampaign(id: string) {
  const db = useDatabase()
  const [row] = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.id, id), campaignWindowSql()))
    .limit(1)
  return row ? mapPublic(row) : null
}

export async function listAdminCampaigns(): Promise<AdminCampaign[]> {
  const db = useDatabase()
  const rows = await db
    .select()
    .from(campaigns)
    .orderBy(asc(campaigns.sortOrder), asc(campaigns.name))
  return rows.map(mapAdmin)
}

export function slugifyCampaignName(name: string) {
  const base = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
  return base || 'campana'
}

async function uniqueSlug(base: string, excludeId?: string) {
  const db = useDatabase()
  let candidate = base.slice(0, 70)
  for (let i = 0; i < 20; i += 1) {
    const [hit] = await db
      .select({ id: campaigns.id })
      .from(campaigns)
      .where(eq(campaigns.slug, candidate))
      .limit(1)
    if (!hit || hit.id === excludeId) return candidate
    candidate = `${base.slice(0, 60)}-${i + 2}`.slice(0, 80)
  }
  return `${base.slice(0, 50)}-${Date.now().toString(36)}`.slice(0, 80)
}

function parseWindow(startsAt?: string | null, endsAt?: string | null) {
  const start = startsAt ? new Date(startsAt) : null
  const end = endsAt ? new Date(endsAt) : null
  if (start && Number.isNaN(start.getTime())) {
    throw createError({ statusCode: 400, statusMessage: 'Fecha de inicio inválida' })
  }
  if (end && Number.isNaN(end.getTime())) {
    throw createError({ statusCode: 400, statusMessage: 'Fecha de fin inválida' })
  }
  if (start && end && end < start) {
    throw createError({ statusCode: 400, statusMessage: 'La fecha de fin debe ser posterior al inicio' })
  }
  return { start, end }
}

export async function createAdminCampaign(input: {
  name: string
  description?: string
  startsAt?: string | null
  endsAt?: string | null
  active?: boolean
}): Promise<AdminCampaign> {
  const name = String(input.name || '').trim().replace(/\s+/g, ' ').slice(0, 120)
  if (name.length < 2) {
    throw createError({ statusCode: 400, statusMessage: 'Indique el nombre del tipo de donación' })
  }
  const description = String(input.description || name).trim().slice(0, 500) || name
  const { start, end } = parseWindow(input.startsAt, input.endsAt)
  const slug = await uniqueSlug(slugifyCampaignName(name))

  const db = useDatabase()
  const [maxSort] = await db
    .select({ max: sql<number>`coalesce(max(${campaigns.sortOrder}), 0)`.mapWith(Number) })
    .from(campaigns)

  const [row] = await db
    .insert(campaigns)
    .values({
      name,
      slug,
      description,
      type: 'temporal',
      sortOrder: Number(maxSort?.max ?? 0) + 1,
      active: input.active !== false,
      startsAt: start,
      endsAt: end,
    })
    .returning()

  if (!row) {
    throw createError({ statusCode: 500, statusMessage: 'No se pudo crear la campaña' })
  }
  return mapAdmin(row)
}

export async function updateAdminCampaign(
  id: string,
  input: {
    name?: string
    description?: string
    active?: boolean
    startsAt?: string | null
    endsAt?: string | null
    sortOrder?: number
  },
): Promise<AdminCampaign> {
  const db = useDatabase()
  const [current] = await db.select().from(campaigns).where(eq(campaigns.id, id)).limit(1)
  if (!current) {
    throw createError({ statusCode: 404, statusMessage: 'Tipo de donación no encontrado' })
  }

  const patch: Partial<typeof campaigns.$inferInsert> = {}
  if (input.name !== undefined) {
    const name = String(input.name || '').trim().replace(/\s+/g, ' ').slice(0, 120)
    if (name.length < 2) {
      throw createError({ statusCode: 400, statusMessage: 'Indique el nombre del tipo de donación' })
    }
    patch.name = name
  }
  if (input.description !== undefined) {
    patch.description = String(input.description || '').trim().slice(0, 500) || current.description
  }
  if (input.active !== undefined) patch.active = Boolean(input.active)
  if (input.sortOrder !== undefined && Number.isFinite(input.sortOrder)) {
    patch.sortOrder = Number(input.sortOrder)
  }
  if (input.startsAt !== undefined || input.endsAt !== undefined) {
    const { start, end } = parseWindow(
      input.startsAt !== undefined ? input.startsAt : current.startsAt?.toISOString() ?? null,
      input.endsAt !== undefined ? input.endsAt : current.endsAt?.toISOString() ?? null,
    )
    patch.startsAt = start
    patch.endsAt = end
  }

  const [row] = await db
    .update(campaigns)
    .set(patch)
    .where(eq(campaigns.id, id))
    .returning()

  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'Tipo de donación no encontrado' })
  }
  return mapAdmin(row)
}
