<script setup lang="ts">
const open = defineModel<boolean>('open', { required: true })

const props = defineProps<{
  title: string
  description: string
  confirmLabel: string
  cancelLabel: string
  busy?: boolean
  busyLabel?: string
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const titleId = useId()
const descId = useId()
const dialogEl = ref<HTMLDialogElement | null>(null)
const confirmBtn = ref<HTMLButtonElement | null>(null)

watch(open, async (isOpen) => {
  await nextTick()
  const el = dialogEl.value
  if (!el) return
  if (isOpen) {
    if (!el.open) el.showModal()
    confirmBtn.value?.focus()
  }
  else if (el.open) {
    el.close()
  }
})

function onEscape(event: Event) {
  if (props.busy) event.preventDefault()
}

function onNativeClose() {
  if (!open.value) return
  open.value = false
  emit('cancel')
}

function onBackdropClick(event: MouseEvent) {
  if (props.busy) return
  if (event.target !== dialogEl.value) return
  dialogEl.value?.close()
}

function onCancelClick() {
  dialogEl.value?.close()
}

function onConfirmClick() {
  emit('confirm')
}
</script>

<template>
  <dialog
    ref="dialogEl"
    class="confirm-dialog"
    :aria-labelledby="titleId"
    :aria-describedby="descId"
    @close="onNativeClose"
    @cancel="onEscape"
    @click="onBackdropClick"
  >
    <div
      class="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-xl"
      @click.stop
    >
      <header class="bg-brand px-6 py-3">
        <h2 :id="titleId" class="text-sm font-semibold text-white">
          {{ title }}
        </h2>
      </header>
      <div class="px-6 py-5">
        <p :id="descId" class="text-sm leading-relaxed text-gray-600">
          {{ description }}
        </p>
        <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            class="btn-secondary"
            :disabled="busy"
            @click="onCancelClick"
          >
            {{ cancelLabel }}
          </button>
          <button
            ref="confirmBtn"
            type="button"
            class="btn-primary"
            :disabled="busy"
            @click="onConfirmClick"
          >
            {{ busy ? (busyLabel || confirmLabel) : confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </dialog>
</template>

<style scoped>
.confirm-dialog {
  margin: 0;
  padding: 1rem;
  max-width: none;
  max-height: none;
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
}

.confirm-dialog[open] {
  display: grid;
  place-items: center;
}

.confirm-dialog:focus {
  outline: none;
}
</style>

<style>
.confirm-dialog::backdrop {
  background: rgb(0 34 68 / 0.52);
}
</style>
