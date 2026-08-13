export default defineNuxtRouteMiddleware(() => {
  const { isLoggedIn, isAdmin } = useAuth()

  if (!isLoggedIn.value) {
    return navigateTo('/login?redirect=/admin')
  }

  if (!isAdmin.value) {
    return navigateTo('/')
  }
})
