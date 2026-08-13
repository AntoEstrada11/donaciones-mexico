<script setup lang="ts">
import type { Campaign, HeroSlide } from '~/types'

const { t } = useI18n()

const { data: campaigns, pending } = await useFetch<Campaign[]>('/api/campaigns')
const { data: heroSlides } = await useFetch<HeroSlide[]>('/api/hero-slides')

const steps = computed(() => [
  { title: t('home.step1Title'), desc: t('home.step1Desc'), icon: '⛪' },
  { title: t('home.step2Title'), desc: t('home.step2Desc'), icon: '💝' },
  { title: t('home.step3Title'), desc: t('home.step3Desc'), icon: '🔒' },
])
</script>

<template>
  <div>
    <!-- Hero full-bleed con carrusel y degradado -->
    <section class="relative isolate overflow-hidden text-white">
      <HeroCarousel :slides="heroSlides ?? []" />

      <div class="relative mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <div class="max-w-2xl">
          <h1 class="text-3xl font-bold leading-tight md:text-5xl">
            {{ t('home.heroTitle') }}
          </h1>
          <p class="mt-4 text-base text-white/85 md:text-lg">
            {{ t('home.heroSubtitle') }}
          </p>
          <div class="mt-8 flex flex-wrap gap-4">
            <NuxtLink to="/iglesias" class="btn-primary bg-accent text-ink hover:bg-accent-dark">
              {{ t('home.ctaDonate') }}
            </NuxtLink>
            <NuxtLink to="/iglesias" class="btn-secondary border-white/30 bg-transparent text-white hover:bg-white/10">
              {{ t('home.ctaChurches') }}
            </NuxtLink>
          </div>
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
          v-for="(step, i) in steps"
          :key="i"
          class="text-center"
        >
          <div
            class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-light text-2xl"
            aria-hidden="true"
          >
            {{ step.icon }}
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
            class="card text-center"
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

    <!-- Recurring + SPEI -->
    <section class="mx-auto max-w-6xl px-4 py-14 md:px-6">
      <div class="grid gap-6 md:grid-cols-2">
        <article class="card border-dashed">
          <h3 class="mb-2 font-semibold text-ink">
            {{ t('home.recurringTitle') }}
          </h3>
          <p class="mb-4 text-sm text-gray-600">
            {{ t('home.recurringDesc') }}
          </p>
          <span class="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
            {{ t('home.recurringSoon') }}
          </span>
        </article>

        <article class="card bg-brand-light border-brand/20">
          <h3 class="mb-2 font-semibold text-brand">
            {{ t('home.speiTitle') }}
          </h3>
          <p class="mb-4 text-sm text-gray-600">
            {{ t('home.speiDesc') }}
          </p>
          <span class="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
            {{ t('home.recurringSoon') }}
          </span>
        </article>
      </div>
    </section>
  </div>
</template>
