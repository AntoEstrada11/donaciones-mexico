<script setup lang="ts">
const { t } = useI18n()
const { user, isAdmin, isEditor, logout } = useAuth()
const route = useRoute()
const router = useRouter()

const collapsed = useState('admin-sidebar-collapsed', () => false)
const mobileOpen = ref(false)
const search = ref('')

watch(() => route.fullPath, () => {
  mobileOpen.value = false
})

const links = computed(() => {
  if (isEditor.value && !isAdmin.value) {
    return [
      { to: '/admin/personalizar/carrusel', label: t('admin.nav.personalize'), match: '/admin/personalizar', icon: 'palette' },
    ]
  }
  return [
    { to: '/admin', label: t('admin.nav.overview'), exact: true, icon: 'home' },
    { to: '/admin/spei', label: t('admin.nav.spei'), icon: 'bank' },
    { to: '/admin/alertas', label: t('admin.nav.alerts'), icon: 'alert' },
    { to: '/admin/donations', label: t('admin.nav.donations'), icon: 'heart' },
    { to: '/admin/campanas', label: t('admin.nav.campaigns'), icon: 'flag' },
    { to: '/admin/users', label: t('admin.nav.users'), icon: 'users' },
    { to: '/admin/operadores', label: t('admin.nav.operators'), match: '/admin/operadores', icon: 'shield' },
    { to: '/admin/personalizar', label: t('admin.nav.personalize'), match: '/admin/personalizar', icon: 'palette' },
  ]
})

function isActive(link: { to: string, exact?: boolean, match?: string }) {
  if (link.exact) return route.path === link.to
  const base = link.match || link.to
  return route.path === base || route.path.startsWith(`${base}/`)
}

function onSearch() {
  const q = search.value.trim()
  if (!q) return
  router.push({ path: '/admin/users', query: { q } })
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || '')
    .join('') || 'AD'
}

async function onLogout() {
  logout()
  await navigateTo('/login')
}
</script>

<template>
  <div class="admin-shell min-h-screen bg-[radial-gradient(ellipse_at_top,_#e8f0f8_0%,_#f5f7fa_45%,_#eef1f6_100%)] text-ink">
    <div
      v-if="mobileOpen"
      class="fixed inset-0 z-40 bg-brand-dark/40 backdrop-blur-[2px] lg:hidden"
      @click="mobileOpen = false"
    />

    <aside
      class="fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/10 bg-brand-dark text-white transition-all duration-300 ease-out"
      :class="[
        collapsed ? 'w-[4.5rem]' : 'w-64',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ]"
    >
      <div class="flex h-16 items-center gap-3 border-b border-white/10 px-4">
        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/20 text-sm font-bold text-accent">
          D
        </div>
        <div v-show="!collapsed" class="min-w-0">
          <p class="truncate text-sm font-semibold tracking-wide">
            {{ t('admin.shell.brand') }}
          </p>
          <p class="truncate text-[11px] text-white/55">
            {{ t('admin.shell.brandHint') }}
          </p>
        </div>
      </div>

      <nav class="flex-1 space-y-1 overflow-y-auto px-2 py-4" :aria-label="t('admin.shell.navLabel')">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200"
          :class="isActive(link)
            ? 'bg-white/10 text-white shadow-lg shadow-black/20'
            : 'text-white/70 hover:bg-white/5 hover:text-white'"
          :title="collapsed ? link.label : undefined"
        >
          <span
            v-if="isActive(link)"
            class="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-accent"
          />
          <AdminNavIcon :name="link.icon" class="h-5 w-5 shrink-0 opacity-90" />
          <span v-show="!collapsed" class="truncate font-medium">
            {{ link.label }}
          </span>
        </NuxtLink>
      </nav>

      <div class="border-t border-white/10 p-3">
        <button
          type="button"
          class="hidden w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs text-white/70 transition hover:bg-white/5 hover:text-white lg:flex"
          @click="collapsed = !collapsed"
        >
          <AdminNavIcon :name="collapsed ? 'chevron-right' : 'chevron-left'" class="h-4 w-4" />
          <span v-show="!collapsed">{{ t('admin.shell.collapse') }}</span>
        </button>
        <NuxtLink
          to="/"
          class="mt-1 flex items-center gap-3 rounded-xl px-3 py-2 text-xs text-white/60 transition hover:bg-white/5 hover:text-white"
        >
          <AdminNavIcon name="external" class="h-4 w-4 shrink-0" />
          <span v-show="!collapsed">{{ t('admin.shell.viewSite') }}</span>
        </NuxtLink>
      </div>
    </aside>

    <div
      class="flex min-h-screen flex-col transition-[padding] duration-300"
      :class="collapsed ? 'lg:pl-[4.5rem]' : 'lg:pl-64'"
    >
      <header class="sticky top-0 z-30 border-b border-brand/5 bg-white/75 backdrop-blur-xl">
        <div class="flex h-16 items-center gap-3 px-4 md:px-6">
          <button
            type="button"
            class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-ink shadow-sm lg:hidden"
            :aria-label="t('admin.shell.openMenu')"
            @click="mobileOpen = true"
          >
            <AdminNavIcon name="menu" class="h-5 w-5" />
          </button>

          <form class="relative min-w-0 flex-1 max-w-xl" @submit.prevent="onSearch">
            <AdminNavIcon name="search" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              v-model="search"
              type="search"
              class="w-full rounded-2xl border border-gray-200/80 bg-white/90 py-2.5 pl-10 pr-4 text-sm shadow-sm shadow-brand/5 outline-none transition focus:border-brand/30 focus:ring-2 focus:ring-brand/15"
              :placeholder="t('admin.shell.searchPh')"
            >
          </form>

          <div class="ml-auto flex items-center gap-2 md:gap-3">
            <NuxtLink
              to="/admin/alertas"
              class="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200/80 bg-white text-ink shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              :title="t('admin.nav.alerts')"
            >
              <AdminNavIcon name="bell" class="h-5 w-5" />
            </NuxtLink>

            <div class="flex items-center gap-2 rounded-2xl border border-gray-200/80 bg-white py-1.5 pl-1.5 pr-3 shadow-sm">
              <div class="flex h-8 w-8 items-center justify-center rounded-xl bg-brand text-[11px] font-semibold text-white">
                {{ initials(user?.name || '') }}
              </div>
              <div class="hidden min-w-0 sm:block">
                <p class="truncate text-xs font-semibold text-ink">
                  {{ user?.name }}
                </p>
                <p class="truncate text-[10px] text-gray-500">
                  {{ isAdmin ? t('admin.users.roleAdmin') : t('admin.users.roleEditor') }}
                </p>
              </div>
              <button
                type="button"
                class="ml-1 text-[11px] font-medium text-gray-500 transition hover:text-brand"
                @click="onLogout"
              >
                {{ t('admin.shell.logout') }}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main class="flex-1 px-4 py-6 md:px-6 md:py-8">
        <slot />
      </main>
    </div>

    <AdminDonorDrawer />
  </div>
</template>
