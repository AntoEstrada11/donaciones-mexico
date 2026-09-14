/** Solo `nuxt dev`. En build/producción el handler responde 404. */
export function assertNuxtDevOnly() {
  if (!import.meta.dev) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }
}
