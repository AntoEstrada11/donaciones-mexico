<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const { isAdmin, isEditor } = useAuth()

const links = computed(() => {
  if (isEditor.value && !isAdmin.value) {
    return [
      { to: '/admin/personalizar/carrusel', label: t('admin.nav.personalize'), match: '/admin/personalizar' },
    ]
  }

  return [
    { to: '/admin', label: t('admin.nav.overview'), exact: true },
    { to: '/admin/spei', label: t('admin.nav.spei') },
    { to: '/admin/alertas', label: t('admin.nav.alerts') },
    { to: '/admin/donations', label: t('admin.nav.donations') },
    { to: '/admin/campanas', label: t('admin.nav.campaigns') },
    { to: '/admin/users', label: t('admin.nav.users') },
    { to: '/admin/operadores', label: t('admin.nav.operators') },
    { to: '/admin/personalizar', label: t('admin.nav.personalize'), match: '/admin/personalizar' },
  ]
})

function isActive(link: { to: string, exact?: boolean, match?: string }) {
  if (link.exact) return route.path === link.to
  const base = link.match || link.to
  return route.path === base || route.path.startsWith(`${base}/`)
}
</script>

<template>
  <nav class="mb-8 flex flex-wrap gap-2 border-b border-gray-200 pb-3" aria-label="Admin">
    <NuxtLink
      v-for="link in links"
      :key="link.to"
      :to="link.to"
      class="rounded-md px-3 py-2 text-sm font-medium transition"
      :class="isActive(link)
        ? 'bg-brand text-white'
        : 'text-ink hover:bg-brand-light'"
    >
      {{ link.label }}
    </NuxtLink>
  </nav>
</template>
