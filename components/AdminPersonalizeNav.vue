<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()

const links = computed(() => [
  { to: '/admin/personalizar/carrusel', label: t('admin.nav.carousel') },
  { to: '/admin/personalizar/pie', label: t('admin.nav.footer') },
  { to: '/admin/personalizar/cobros', label: t('admin.nav.payments') },
])

function isActive(to: string) {
  return route.path === to || route.path.startsWith(`${to}/`)
}
</script>

<template>
  <nav class="mb-6 flex flex-wrap gap-2" aria-label="Personalizar">
    <NuxtLink
      v-for="link in links"
      :key="link.to"
      :to="link.to"
      class="rounded-md px-3 py-1.5 text-sm font-medium transition"
      :class="isActive(link.to)
        ? 'bg-brand-light text-brand ring-1 ring-brand/30'
        : 'text-gray-600 hover:bg-gray-100'"
    >
      {{ link.label }}
    </NuxtLink>
  </nav>
</template>
