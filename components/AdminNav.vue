<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()

const links = computed(() => [
  { to: '/admin', label: t('admin.nav.overview'), exact: true },
  { to: '/admin/slides', label: t('admin.nav.slides') },
  { to: '/admin/donations', label: t('admin.nav.donations') },
  { to: '/admin/users', label: t('admin.nav.users') },
])

function isActive(to: string, exact?: boolean) {
  if (exact) return route.path === to
  return route.path === to || route.path.startsWith(`${to}/`)
}
</script>

<template>
  <nav class="mb-8 flex flex-wrap gap-2 border-b border-gray-200 pb-3" aria-label="Admin">
    <NuxtLink
      v-for="link in links"
      :key="link.to"
      :to="link.to"
      class="rounded-md px-3 py-2 text-sm font-medium transition"
      :class="isActive(link.to, link.exact)
        ? 'bg-brand text-white'
        : 'text-ink hover:bg-brand-light'"
    >
      {{ link.label }}
    </NuxtLink>
  </nav>
</template>
