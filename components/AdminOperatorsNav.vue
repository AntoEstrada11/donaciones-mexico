<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()

const links = [
  { to: '/admin/operadores', label: t('admin.operators.navStaff'), exact: true },
  { to: '/admin/operadores/cobros', label: t('admin.operators.navPayments') },
]

function isActive(link: { to: string, exact?: boolean }) {
  if (link.exact) return route.path === link.to
  return route.path === link.to || route.path.startsWith(`${link.to}/`)
}
</script>

<template>
  <nav class="mb-6 flex flex-wrap gap-2" aria-label="Operadores">
    <NuxtLink
      v-for="link in links"
      :key="link.to"
      :to="link.to"
      class="rounded-md px-3 py-1.5 text-sm font-medium transition"
      :class="isActive(link)
        ? 'bg-brand-light text-brand ring-1 ring-brand/30'
        : 'text-gray-600 hover:bg-gray-100'"
    >
      {{ link.label }}
    </NuxtLink>
  </nav>
</template>
