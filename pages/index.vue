<script setup lang="ts">
const { t } = useI18n()

interface Campaign {
  id: string
  name: string
  slug: string
  description: string
  type: string
}

const { data: campaigns, pending } = await useFetch<Campaign[]>('/api/campaigns')

const steps = computed(() => [
  { title: t('home.step1Title'), desc: t('home.step1Desc'), n: '1' },
  { title: t('home.step2Title'), desc: t('home.step2Desc'), n: '2' },
  { title: t('home.step3Title'), desc: t('home.step3Desc'), n: '3' },
])

const trustItems = computed(() => [
  { title: t('home.trustAuthTitle'), desc: t('home.trustAuthDesc') },
  { title: t('home.trustDataTitle'), desc: t('home.trustDataDesc') },
  { title: t('home.trustResetTitle'), desc: t('home.trustResetDesc') },
])
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden bg-brand text-white">
      <div
        class="pointer-events-none absolute inset-0 opacity-30"
        style="background: radial-gradient(ellipse at 20% 20%, #1a4a7a 0%, transparent 55%), radial-gradient(ellipse at 90% 80%, #002244 0%, transparent 50%);"
        aria-hidden="true"
      />
      <div class="relative mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <p class="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          {{ t('header.tagline') }}
        </p>
        <h1 class="max-w-2xl text-3xl font-bold leading-tight md:text-5xl">
          {{ t('home.heroTitle') }}
        </h1>
        <p class="mt-4 max-w-xl text-base text-white/80 md:text-lg">
          {{ t('home.heroSubtitle') }}
        </p>
        <div class="mt-8 flex flex-wrap gap-4">
          <NuxtLink to="/iglesias" class="btn-primary bg-accent text-ink hover:bg-accent-dark">
            {{ t('home.ctaDonate') }}
          </NuxtLink>
          <NuxtLink to="/registro" class="btn-secondary border-white/30 bg-transparent text-white hover:bg-white/10">
            {{ t('home.ctaAccount') }}
          </NuxtLink>
        </div>
        <p class="mt-6 text-xs text-white/60">
          {{ t('home.heroSecureNote') }}
        </p>
      </div>
    </section>

    <!-- Trust -->
    <section class="border-b border-gray-200 bg-white">
      <div class="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3 md:px-6">
        <div v-for="item in trustItems" :key="item.title">
          <h2 class="text-sm font-semibold text-brand">
            {{ item.title }}
          </h2>
          <p class="mt-1 text-sm text-gray-600">
            {{ item.desc }}
          </p>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section class="mx-auto max-w-6xl px-4 py-14 md:px-6">
      <h2 class="section-title mb-10 text-center">
        {{ t('home.howTitle') }}
      </h2>
      <div class="grid gap-8 md:grid-cols-3">
        <div
          v-for="step in steps"
          :key="step.n"
          class="text-center"
        >
          <div
            class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-lg font-bold text-white"
            aria-hidden="true"
          >
            {{ step.n }}
          </div>
          <h3 class="mb-2 font-semibold text-ink">
            {{ step.title }}
          </h3>
          <p class="text-sm text-gray-600">
            {{ step.desc }}
          </p>
        </div>
      </div>
    </section>

    <!-- Campaign types -->
    <section class="bg-white py-14">
      <div class="mx-auto max-w-6xl px-4 md:px-6">
        <h2 class="section-title mb-8 text-center">
          {{ t('home.campaignsTitle') }}
        </h2>

        <div v-if="pending" class="text-center text-gray-500">
          {{ t('common.loading') }}
        </div>

        <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <article
            v-for="campaign in campaigns"
            :key="campaign.id"
            class="rounded-lg border border-gray-100 bg-surface p-6 text-center"
          >
            <h3 class="mb-2 font-semibold text-brand">
              {{ campaign.name }}
            </h3>
            <p class="text-sm text-gray-600">
              {{ campaign.description }}
            </p>
          </article>
        </div>
      </div>
    </section>

    <!-- CTA account -->
    <section class="bg-brand-light/40 py-14">
      <div class="mx-auto max-w-3xl px-4 text-center md:px-6">
        <h2 class="section-title">
          {{ t('home.accountTitle') }}
        </h2>
        <p class="mt-3 text-sm text-gray-600 md:text-base">
          {{ t('home.accountDesc') }}
        </p>
        <div class="mt-8 flex flex-wrap justify-center gap-4">
          <NuxtLink to="/registro" class="btn-primary">
            {{ t('nav.register') }}
          </NuxtLink>
          <NuxtLink to="/login" class="btn-secondary">
            {{ t('nav.login') }}
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Recurring + SPEI -->
    <section class="mx-auto max-w-6xl px-4 py-14 md:px-6">
      <div class="grid gap-8 md:grid-cols-2">
        <article>
          <h3 class="mb-2 font-semibold text-ink">
            {{ t('home.recurringTitle') }}
          </h3>
          <p class="mb-3 text-sm text-gray-600">
            {{ t('home.recurringDesc') }}
          </p>
          <span class="text-xs font-medium text-gray-500">
            {{ t('home.recurringSoon') }}
          </span>
        </article>

        <article>
          <h3 class="mb-2 font-semibold text-brand">
            {{ t('home.speiTitle') }}
          </h3>
          <p class="mb-3 text-sm text-gray-600">
            {{ t('home.speiDesc') }}
          </p>
          <span class="text-xs font-medium text-gray-500">
            {{ t('home.recurringSoon') }}
          </span>
        </article>
      </div>
    </section>
  </div>
</template>
