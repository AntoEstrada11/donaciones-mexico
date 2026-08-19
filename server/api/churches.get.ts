export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const config = useRuntimeConfig()

  const rawLat = Number(query.latitude)
  const rawLng = Number(query.longitude)

  const latitude = Number.isFinite(rawLat)
    ? Math.min(90, Math.max(-90, rawLat))
    : Number(config.public.defaultLatitude)

  const longitude = Number.isFinite(rawLng)
    ? Math.min(180, Math.max(-180, rawLng))
    : Number(config.public.defaultLongitude)

  return await listChurches(latitude, longitude)
})
