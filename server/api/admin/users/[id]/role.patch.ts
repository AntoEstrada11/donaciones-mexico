import type { DonorStatus } from '~/types'

export default defineEventHandler(() => {
  throw createError({
    statusCode: 410,
    statusMessage: 'La asignación de rol admin ya no está disponible desde el panel. Use el servicio externo o db:promote-admin.',
  })
})
