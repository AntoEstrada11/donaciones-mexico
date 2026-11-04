export default defineEventHandler(async (event) => {
  requireContentEditor(event)
  return await listAllHeroSlides()
})
