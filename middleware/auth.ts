export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()
  if (!user.value) {
    const redirect = safeRedirectPath(to.fullPath, to.path)
    return navigateTo(`/login?redirect=${encodeURIComponent(redirect)}`)
  }
})
