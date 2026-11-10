export default defineNuxtRouteMiddleware((to) => {
  const { isLoggedIn, isStaff, isAdmin, isEditor } = useAuth()

  if (!isLoggedIn.value) {
    return navigateTo('/login?redirect=/admin')
  }

  if (!isStaff.value) {
    return navigateTo('/')
  }

  // Editor: solo Personalizar (carrusel / pie). Sin cobros ni operación.
  if (isEditor.value && !isAdmin.value) {
    const path = to.path
    const allowed
      = path === '/admin/personalizar'
      || path.startsWith('/admin/personalizar/carrusel')
      || path.startsWith('/admin/personalizar/pie')
      || path === '/admin/slides'
      || path.startsWith('/admin/slides')

    if (!allowed) {
      return navigateTo('/admin/personalizar/carrusel')
    }
  }
})
