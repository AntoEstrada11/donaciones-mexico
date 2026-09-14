export default defineNuxtRouteMiddleware((to) => {
  const { isLoggedIn, isAdmin } = useAuth()

  if (!isLoggedIn.value) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  }

  if (isAdmin.value) {
    return navigateTo('/admin')
  }
})
