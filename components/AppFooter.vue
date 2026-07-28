<script setup lang="ts">
const { t } = useI18n()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="mt-auto border-t border-gray-200 bg-white">
    <div class="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <div class="grid gap-8 md:grid-cols-2">
        <div>
          <h2 class="mb-3 text-sm font-bold uppercase tracking-wider text-brand">
            {{ t('footer.contact') }}
          </h2>
          <ul class="space-y-2 text-sm text-gray-600">
            <li>
              <span class="font-medium text-ink">{{ t('footer.phone') }}</span>
            </li>
            <li>
              <a
                href="mailto:donaciones@mx.universal.org"
                class="text-brand hover:underline"
              >
                {{ t('footer.email') }}
              </a>
            </li>
          </ul>
          <p class="mt-4 text-sm italic text-gray-500">
            {{ t('footer.blessing') }}
          </p>
        </div>

        <div>
          <h2 class="mb-3 text-sm font-bold uppercase tracking-wider text-brand">
            SPEI
          </h2>
          <ul class="space-y-1 text-sm text-gray-600">
            <li>{{ t('footer.bank') }}</li>
            <li class="font-mono font-medium text-ink">{{ t('footer.clabe') }}</li>
            <li>{{ t('footer.concept') }}</li>
          </ul>
        </div>
      </div>

      <div class="mt-8 border-t border-gray-100 pt-6 text-center text-xs text-gray-400">
        <p>{{ t('footer.security') }}</p>
        <p class="mt-2">
          {{ t('footer.rights', { year }) }}
        </p>
      </div>
    </div>
  </footer>
</template>
