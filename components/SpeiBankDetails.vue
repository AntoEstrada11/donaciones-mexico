<script setup lang="ts">
const { t } = useI18n()

const copiedId = ref<string | null>(null)
let copyTimer: ReturnType<typeof setTimeout> | undefined

const fields = computed(() => [
  { id: 'beneficiary', label: t('spei.beneficiaryLabel'), value: t('spei.beneficiary') },
  { id: 'bank', label: t('spei.bankLabel'), value: t('spei.bank') },
  { id: 'clabe', label: t('spei.clabeLabel'), value: t('spei.clabe'), mono: true },
  { id: 'concept', label: t('spei.conceptLabel'), value: t('spei.concept') },
])

async function copy(id: string, value: string) {
  try {
    await navigator.clipboard.writeText(value)
    copiedId.value = id
    if (copyTimer) clearTimeout(copyTimer)
    copyTimer = setTimeout(() => {
      copiedId.value = null
    }, 2000)
  }
  catch {
    copiedId.value = null
  }
}

onBeforeUnmount(() => {
  if (copyTimer) clearTimeout(copyTimer)
})
</script>

<template>
  <dl class="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
    <div
      v-for="field in fields"
      :key="field.id"
      class="flex flex-wrap items-start justify-between gap-2 px-4 py-3"
    >
      <div class="min-w-0">
        <dt class="text-xs font-semibold uppercase tracking-wider text-gray-500">
          {{ field.label }}
        </dt>
        <dd
          class="mt-0.5 break-all text-sm text-ink"
          :class="field.mono ? 'font-mono font-medium tracking-wide' : 'font-medium'"
        >
          {{ field.value }}
        </dd>
      </div>
      <button
        type="button"
        class="shrink-0 rounded-md border border-gray-200 px-2.5 py-1 text-xs font-semibold text-brand hover:bg-brand-light"
        @click="copy(field.id, field.value)"
      >
        {{ copiedId === field.id ? t('spei.copied') : t('spei.copy') }}
      </button>
    </div>
  </dl>
</template>
