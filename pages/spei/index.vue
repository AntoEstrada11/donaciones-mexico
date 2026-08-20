<script setup lang="ts">
const { t } = useI18n()
const { isLoggedIn } = useAuth()

const donateEntry = computed(() =>
  isLoggedIn.value ? '/iglesias' : '/login?redirect=/iglesias',
)

useHead({
  title: t('spei.title'),
})

const steps = computed(() => [
  { title: t('spei.step1Title'), desc: t('spei.step1Desc') },
  { title: t('spei.step2Title'), desc: t('spei.step2Desc') },
  { title: t('spei.step3Title'), desc: t('spei.step3Desc') },
  { title: t('spei.step4Title'), desc: t('spei.step4Desc') },
  { title: t('spei.step5Title'), desc: t('spei.step5Desc') },
])
</script>

<template>
  <div class="mx-auto max-w-2xl px-4 py-10 md:px-6">
    <NuxtLink to="/" class="mb-6 inline-flex items-center gap-1 text-sm text-brand hover:underline">
      ← {{ t('common.back') }}
    </NuxtLink>

    <header class="mb-8">
      <h1 class="section-title">
        {{ t('spei.title') }}
      </h1>
      <p class="mt-2 text-gray-600">
        {{ t('spei.subtitle') }}
      </p>
    </header>

    <section class="mb-10">
      <h2 class="mb-3 font-semibold text-ink">
        {{ t('spei.dataTitle') }}
      </h2>
      <SpeiBankDetails />
      <p class="mt-3 text-sm text-gray-500">
        {{ t('spei.warning') }}
      </p>
    </section>

    <section class="mb-10">
      <h2 class="mb-4 font-semibold text-ink">
        {{ t('spei.stepsTitle') }}
      </h2>
      <ol class="space-y-4">
        <li
          v-for="(step, i) in steps"
          :key="i"
          class="flex gap-4"
        >
          <span
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white"
            aria-hidden="true"
          >
            {{ i + 1 }}
          </span>
          <div>
            <h3 class="font-semibold text-ink">
              {{ step.title }}
            </h3>
            <p class="mt-1 text-sm text-gray-600">
              {{ step.desc }}
            </p>
          </div>
        </li>
      </ol>
    </section>

    <div class="flex flex-wrap gap-3">
      <NuxtLink :to="donateEntry" class="btn-primary">
        {{ t('spei.ctaDonate') }}
      </NuxtLink>
      <NuxtLink to="/" class="btn-secondary">
        {{ t('spei.ctaHome') }}
      </NuxtLink>
    </div>
  </div>
</template>
