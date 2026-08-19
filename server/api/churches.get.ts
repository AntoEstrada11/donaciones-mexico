export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const config = useRuntimeConfig()
  const latitude = Number(query.latitude)
  const longitude = Number(query.longitude)

  return await listChurches(
    Number.isFinite(latitude) ? latitude : Number(config.public.defaultLatitude),
    Number.isFinite(longitude) ? longitude : Number(config.public.defaultLongitude),
  )
})
