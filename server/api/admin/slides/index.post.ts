import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { extname } from 'node:path'
import { FIELD_LIMITS } from '../../../../utils/fieldLimits'

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
}

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const form = await readMultipartFormData(event)
  if (!form?.length) {
    throw createError({ statusCode: 400, statusMessage: 'No se recibió ninguna imagen' })
  }

  const filePart = form.find(part => part.name === 'file' && part.data?.length)
  if (!filePart?.data) {
    throw createError({ statusCode: 400, statusMessage: 'El campo file es requerido' })
  }

  const mime = String(filePart.type || '').toLowerCase()
  if (!(FIELD_LIMITS.heroImage.mimeTypes as readonly string[]).includes(mime)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Solo se permiten imágenes JPG, PNG o WebP',
    })
  }

  if (filePart.data.length > FIELD_LIMITS.heroImage.maxBytes) {
    throw createError({
      statusCode: 400,
      statusMessage: 'La imagen no puede superar 3 MB',
    })
  }

  const altPart = form.find(part => part.name === 'alt')
  const alt = String(altPart?.data ? Buffer.from(altPart.data).toString('utf8') : '')
    .trim()
    .slice(0, FIELD_LIMITS.heroImage.maxAlt)

  const ext = MIME_TO_EXT[mime] || extname(filePart.filename || '').toLowerCase() || '.jpg'
  const filename = `${randomUUID()}${ext}`

  await mkdir(getHeroUploadDir(), { recursive: true })
  await writeFile(heroDiskPath(filename), filePart.data)

  return await createHeroSlide({ filename, alt })
})
