<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const { selectedChurch } = useDonation()
const { isLoggedIn, isAdmin, user, logout } = useAuth()

const mobileOpen = ref(false)

interface NavLink {
  id: string
  to: string
  label: string
  /** Ruta que marca el ítem como activo (puede diferir de `to`). */
  match: string
}

const navLinks = computed<NavLink[]>(() => {
  const links: NavLink[] = [
    { id: 'home', to: '/', label: t('nav.home'), match: '/' },
  ]

  if (isLoggedIn.value) {
    if (isAdmin.value) {
      links.push({ id: 'admin', to: '/admin', label: t('nav.admin'), match: '/admin' })
    }
    else {
      links.push(
        { id: 'churches', to: '/iglesias', label: t('nav.churches'), match: '/iglesias' },
        {
          id: 'donate',
          to: selectedChurch.value ? '/donaciones' : '/iglesias',
          label: t('nav.donate'),
          match: selectedChurch.value ? '/donaciones' : '/iglesias',
        },
        { id: 'profile', to: '/perfil', label: t('nav.profile'), match: '/perfil' },
        { id: 'history', to: '/historial', label: t('nav.history'), match: '/historial' },
      )
    }
  }
  else {
    links.push(
      {
        id: 'donate',
        to: '/login?redirect=/iglesias',
        label: t('nav.donate'),
        match: '/iglesias',
      },
      { id: 'login', to: '/login', label: t('nav.login'), match: '/login' },
    )
  }

  return links
})

function isActive(link: NavLink) {
  if (link.match === '/') return route.path === '/'
  return route.path === link.match || route.path.startsWith(`${link.match}/`)
}

function closeMobile() {
  mobileOpen.value = false
}

function handleLogout() {
  logout()
  closeMobile()
  navigateTo('/')
}
</script>

<template>
  <header class="sticky top-0 z-50 bg-brand text-white shadow-md">
    <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
      <NuxtLink to="/" class="flex items-center" @click="closeMobile">
        <img
          src="/logo-universal.png"
          alt="Universal"
          class="h-7 w-auto object-contain md:h-8"
        >
      </NuxtLink>

      <nav class="hidden items-center gap-1 md:flex" aria-label="Navegación principal">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.id"
          :to="link.to"
          class="rounded-md px-3 py-2 text-sm font-medium transition hover:bg-white/10 hover:text-white"
          :class="isActive(link) ? 'bg-white/15 text-white' : 'text-white/90'"
          :aria-current="isActive(link) ? 'page' : undefined"
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
        :key="link.id"
        :to="link.to"
        class="block rounded-md px-3 py-2.5 text-sm font-medium hover:bg-white/10"
        :class="isActive(link) ? 'bg-white/15 text-white' : 'text-white/90'"
        :aria-current="isActive(link) ? 'page' : undefined"
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
