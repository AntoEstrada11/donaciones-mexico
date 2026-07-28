<script setup lang="ts">
const { t } = useI18n()
const { selectedChurch } = useDonation()
const { isLoggedIn, user, logout } = useAuth()

const mobileOpen = ref(false)

const navLinks = computed(() => [
  { to: '/', label: t('nav.home') },
  { to: '/iglesias', label: t('nav.churches') },
  {
    to: selectedChurch.value ? '/donaciones' : '/iglesias',
    label: t('nav.donate'),
  },
  ...(isLoggedIn.value
    ? [
        { to: '/perfil', label: t('nav.profile') },
        { to: '/historial', label: t('nav.history') },
      ]
    : [
        { to: '/login', label: t('nav.login') },
        { to: '/registro', label: t('nav.register') },
      ]),
])

function closeMobile() {
  mobileOpen.value = false
}

async function handleLogout() {
  await logout()
  closeMobile()
  navigateTo('/')
}
</script>

<template>
  <header class="sticky top-0 z-50 bg-brand text-white shadow-md">
    <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
      <NuxtLink to="/" class="flex items-center gap-3" @click="closeMobile">
        <div
          class="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-lg font-bold text-accent"
          aria-hidden="true"
        >
          IU
        </div>
        <div class="leading-tight">
          <span class="block text-sm font-bold tracking-wide md:text-base">Donaciones</span>
          <span class="hidden text-xs text-white/70 sm:block">{{ t('header.tagline') }}</span>
        </div>
      </NuxtLink>

      <nav class="hidden items-center gap-1 md:flex" aria-label="Navegación principal">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="rounded-md px-3 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
          active-class="bg-white/15 text-white"
        >
          {{ link.label }}
        </NuxtLink>
        <button
          v-if="isLoggedIn"
          type="button"
          class="rounded-md px-3 py-2 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
          @click="handleLogout"
        >
          {{ t('nav.logout') }} ({{ user?.name }})
        </button>
      </nav>

      <button
        type="button"
        class="rounded-md p-2 text-white hover:bg-white/10 md:hidden"
        :aria-expanded="mobileOpen"
        :aria-label="mobileOpen ? t('nav.close') : t('nav.menu')"
        @click="mobileOpen = !mobileOpen"
      >
        <svg v-if="!mobileOpen" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <svg v-else class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <nav
      v-if="mobileOpen"
      class="border-t border-white/10 bg-brand-dark px-4 py-3 md:hidden"
      aria-label="Navegación móvil"
    >
      <NuxtLink
        v-for="link in navLinks"
        :key="link.to"
        :to="link.to"
        class="block rounded-md px-3 py-2.5 text-sm font-medium text-white/90 hover:bg-white/10"
        active-class="bg-white/15 text-white"
        @click="closeMobile"
      >
        {{ link.label }}
      </NuxtLink>
      <button
        v-if="isLoggedIn"
        type="button"
        class="block w-full rounded-md px-3 py-2.5 text-left text-sm font-medium text-white/70 hover:bg-white/10"
        @click="handleLogout"
      >
        {{ t('nav.logout') }}
      </button>
    </nav>
  </header>
</template>
