export default defineNuxtPlugin(() => {
  const router = useRouter()
  const { isStaff } = useAuth()

  router.beforeEach((to) => {
    if (!isStaff.value) return
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
