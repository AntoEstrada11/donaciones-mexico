<script setup lang="ts">
const supabase = useSupabaseClient()
const route = useRoute()
const { refreshProfile } = useAuth()

onMounted(async () => {
  const code = typeof route.query.code === 'string' ? route.query.code : null
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      await navigateTo('/login?error=callback')
      return
    }
  }

  try {
    await $fetch('/api/auth/bootstrap', { method: 'POST' })
  }
  catch {
    // Sin sesión o ya bootstrappeado
  }

  await refreshProfile()

  const fromQuery = safeRedirectPath(route.query.redirect, '')
  const next = fromQuery || consumeAuthRedirect('/perfil')
  await navigateTo(next)
})
</script>

<template>
  <div class="mx-auto max-w-md px-4 py-16 text-center text-gray-600">
    Confirmando acceso…
  </div>
</template>
