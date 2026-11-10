export default defineEventHandler(async (event) => {
  await requireContentEditor(event)
  return await listAllHeroSlides()
})
