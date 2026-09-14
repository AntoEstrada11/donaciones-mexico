export default defineNuxtPlugin(() => {
  const router = useRouter()
  const { isAdmin } = useAuth()

  router.beforeEach((to) => {
    if (!isAdmin.value) return
    const path = to.path
    if (
      path.startsWith('/donaciones')
      || path.startsWith('/iglesias')
      || path.startsWith('/historial')
      || path.startsWith('/perfil')
    ) {
      return '/admin'
    }
  })
})
