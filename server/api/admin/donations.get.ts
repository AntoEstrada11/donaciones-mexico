import { parseDonationMethod, parseDonationStatus } from '../../utils/admin'

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const query = getQuery(event)
  const dateFromRaw = typeof query.dateFrom === 'string' ? query.dateFrom : ''
  const dateToRaw = typeof query.dateTo === 'string' ? query.dateTo : ''
  const dateFrom = dateFromRaw ? new Date(dateFromRaw) : undefined
  const dateTo = dateToRaw ? new Date(dateToRaw) : undefined

  if (dateFrom && Number.isNaN(dateFrom.getTime())) {
    throw createError({ statusCode: 400, statusMessage: 'dateFrom inválido' })
  }
  if (dateTo && Number.isNaN(dateTo.getTime())) {
    throw createError({ statusCode: 400, statusMessage: 'dateTo inválido' })
  }

  const minAmount = query.minAmount != null ? Number(query.minAmount) : undefined
  const maxAmount = query.maxAmount != null ? Number(query.maxAmount) : undefined
  const limit = query.limit != null ? Number(query.limit) : 500

  if (minAmount != null && !Number.isFinite(minAmount)) {
    throw createError({ statusCode: 400, statusMessage: 'minAmount inválido' })
  }
  if (maxAmount != null && !Number.isFinite(maxAmount)) {
    throw createError({ statusCode: 400, statusMessage: 'maxAmount inválido' })
  }

  return await listAdminDonations({
    status: parseDonationStatus(query.status),
    method: parseDonationMethod(query.method),
    churchId: typeof query.churchId === 'string' && query.churchId ? query.churchId : undefined,
    dateFrom,
    dateTo: dateTo
      ? new Date(dateTo.getFullYear(), dateTo.getMonth(), dateTo.getDate(), 23, 59, 59, 999)
      : undefined,
    minAmount,
    maxAmount,
    limit: Number.isFinite(limit) ? limit : 500,
  })
})
