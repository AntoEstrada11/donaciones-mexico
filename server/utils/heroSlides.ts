import { asc, eq } from 'drizzle-orm'
import { unlink } from 'node:fs/promises'
import { join } from 'node:path'
import { heroSlides } from '../database/schema'
import type { HeroSlide } from '~/types'

const HERO_DIR = join(process.cwd(), 'public', 'uploads', 'hero')

export function heroPublicUrl(filename: string) {
  return `/uploads/hero/${filename}`
}

export function heroDiskPath(filename: string) {
  return join(HERO_DIR, filename)
}

export function getHeroUploadDir() {
  return HERO_DIR
}

function toSlide(row: typeof heroSlides.$inferSelect): HeroSlide {
  return {
    id: row.id,
    url: heroPublicUrl(row.filename),
    alt: row.alt,
    sortOrder: row.sortOrder,
    active: row.active,
    createdAt: row.createdAt.toISOString(),
  }
}

export async function listActiveHeroSlides(): Promise<HeroSlide[]> {
  const db = useDatabase()
  const rows = await db
    .select()
    .from(heroSlides)
    .where(eq(heroSlides.active, true))
    .orderBy(asc(heroSlides.sortOrder), asc(heroSlides.createdAt))

  return rows.map(toSlide)
}

export async function listAllHeroSlides(): Promise<HeroSlide[]> {
  const db = useDatabase()
  const rows = await db
    .select()
    .from(heroSlides)
    .orderBy(asc(heroSlides.sortOrder), asc(heroSlides.createdAt))

  return rows.map(toSlide)
}

export async function createHeroSlide(input: {
  filename: string
  alt: string
  sortOrder?: number
}): Promise<HeroSlide> {
  const db = useDatabase()

  let sortOrder = input.sortOrder
  if (sortOrder === undefined) {
    const existing = await db.select({ sortOrder: heroSlides.sortOrder }).from(heroSlides)
    sortOrder = existing.reduce((max, row) => Math.max(max, row.sortOrder), -1) + 1
  }

  const [row] = await db
    .insert(heroSlides)
    .values({
      filename: input.filename,
      alt: input.alt,
      sortOrder,
      active: true,
    })
    .returning()

  return toSlide(row)
}

export async function updateHeroSlide(
  id: string,
  patch: { alt?: string, active?: boolean, sortOrder?: number },
): Promise<HeroSlide> {
  const db = useDatabase()
  const values: Partial<typeof heroSlides.$inferInsert> = {}
  if (patch.alt !== undefined) values.alt = patch.alt
  if (patch.active !== undefined) values.active = patch.active
  if (patch.sortOrder !== undefined) values.sortOrder = patch.sortOrder

  const [row] = await db
    .update(heroSlides)
    .set(values)
    .where(eq(heroSlides.id, id))
    .returning()

  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'Slide no encontrado' })
  }

  return toSlide(row)
}

export async function deleteHeroSlide(id: string): Promise<void> {
  const db = useDatabase()
  const [row] = await db
    .delete(heroSlides)
    .where(eq(heroSlides.id, id))
    .returning()

  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'Slide no encontrado' })
  }

  try {
    await unlink(heroDiskPath(row.filename))
  }
  catch {
    // El archivo pudo haberse perdido en disco; la fila ya se eliminó.
  }
}
