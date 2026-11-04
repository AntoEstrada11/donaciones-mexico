<script setup lang="ts">
/**
 * Captura de INE solo con cámara en vivo (getUserMedia + canvas).
 * No ofrece selector de archivos ni galería.
 */
import { FIELD_LIMITS } from '~/utils/fieldLimits'
import type { IdentitySide } from '~/types'

const open = defineModel<boolean>('open', { required: true })

const props = defineProps<{
  side: IdentitySide
  busy?: boolean
}>()

const emit = defineEmits<{
  captured: [file: File]
}>()

const { t } = useI18n()

const videoEl = ref<HTMLVideoElement | null>(null)
const stream = ref<MediaStream | null>(null)
const phase = ref<'live' | 'preview'>('live')
const previewUrl = ref('')
const pendingBlob = ref<Blob | null>(null)
const cameraError = ref('')
const starting = ref(false)

const titleId = useId()
const dialogEl = ref<HTMLDialogElement | null>(null)

function stopStream() {
  stream.value?.getTracks().forEach(track => track.stop())
  stream.value = null
  if (videoEl.value) videoEl.value.srcObject = null
}

function revokePreview() {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = ''
  }
  pendingBlob.value = null
}

function closeDialog() {
  stopStream()
  revokePreview()
  phase.value = 'live'
  cameraError.value = ''
  open.value = false
}

async function startCamera() {
  cameraError.value = ''
  starting.value = true
  stopStream()
  try {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('unsupported')
    }
    const media = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
    })
    stream.value = media
    await nextTick()
    const video = videoEl.value
    if (!video) {
      stopStream()
      return
    }
    video.srcObject = media
    await video.play()
    phase.value = 'live'
  }
  catch {
    cameraError.value = t('profile.identityCameraDenied')
    stopStream()
  }
  finally {
    starting.value = false
  }
}

function captureFrame() {
  const video = videoEl.value
  if (!video || !stream.value || video.videoWidth < 2) return

  const maxEdge = 1920
  let w = video.videoWidth
  let h = video.videoHeight
  if (Math.max(w, h) > maxEdge) {
    const scale = maxEdge / Math.max(w, h)
    w = Math.round(w * scale)
    h = Math.round(h * scale)
  }

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.drawImage(video, 0, 0, w, h)

  canvas.toBlob(
    (blob) => {
      if (!blob) {
        cameraError.value = t('profile.identityCameraCaptureFail')
        return
      }
      if (blob.size > FIELD_LIMITS.identityImage.maxBytes) {
        cameraError.value = t('profile.identityCameraTooLarge')
        return
      }
      revokePreview()
      pendingBlob.value = blob
      previewUrl.value = URL.createObjectURL(blob)
      phase.value = 'preview'
      cameraError.value = ''
    },
    'image/jpeg',
    0.92,
  )
}

async function retake() {
  revokePreview()
  phase.value = 'live'
  cameraError.value = ''
  if (!stream.value) await startCamera()
  else await videoEl.value?.play().catch(() => undefined)
}

function confirmCapture() {
  const blob = pendingBlob.value
  if (!blob || props.busy) return
  const file = new File([blob], `ine-${props.side}.jpg`, { type: 'image/jpeg' })
  emit('captured', file)
}

watch(open, async (isOpen) => {
  await nextTick()
  const el = dialogEl.value
  if (!el) return
  if (isOpen) {
    if (!el.open) el.showModal()
    phase.value = 'live'
    revokePreview()
    await startCamera()
  }
  else if (el.open) {
    el.close()
    stopStream()
    revokePreview()
  }
})

onBeforeUnmount(() => {
  stopStream()
  revokePreview()
})
</script>

<template>
  <dialog
    ref="dialogEl"
    class="fixed inset-0 z-50 m-auto w-[min(100vw-1.5rem,28rem)] max-h-[min(100vh-2rem,40rem)] overflow-y-auto rounded-xl border border-gray-200 bg-white p-0 shadow-xl backdrop:bg-ink/50"
    :aria-labelledby="titleId"
    @cancel.prevent="!busy && closeDialog()"
  >
    <div class="border-b border-gray-100 px-4 py-3">
      <h2 :id="titleId" class="text-base font-semibold text-ink">
        {{ side === 'front' ? t('profile.identityFront') : t('profile.identityBack') }}
      </h2>
      <p class="mt-0.5 text-xs text-gray-600">
        {{ t('profile.identityCameraHint') }}
      </p>
    </div>

    <div class="space-y-3 px-4 py-3">
      <div class="relative aspect-[4/3] overflow-hidden rounded-lg bg-ink">
        <video
          v-show="phase === 'live'"
          ref="videoEl"
          class="h-full w-full object-cover"
          playsinline
          muted
          autoplay
        />
        <img
          v-if="phase === 'preview' && previewUrl"
          :src="previewUrl"
          alt=""
          class="h-full w-full object-cover"
        >
        <p
          v-if="starting"
          class="absolute inset-0 flex items-center justify-center bg-ink/70 text-sm text-white"
        >
          {{ t('profile.identityCameraStarting') }}
        </p>
      </div>

      <p v-if="cameraError" class="text-sm text-red-600">
        {{ cameraError }}
      </p>

      <div class="flex flex-wrap gap-2">
        <template v-if="phase === 'live'">
          <button
            type="button"
            class="btn-primary flex-1"
            :disabled="busy || starting || !stream || !!cameraError"
            @click="captureFrame"
          >
            {{ t('profile.identityCameraShoot') }}
          </button>
          <button
            type="button"
            class="rounded-lg border border-gray-300 px-4 py-2 text-sm text-ink hover:bg-gray-50"
            :disabled="busy"
            @click="closeDialog"
          >
            {{ t('profile.identityCameraCancel') }}
          </button>
        </template>
        <template v-else>
          <button
            type="button"
            class="btn-primary flex-1"
            :disabled="busy || !pendingBlob"
            @click="confirmCapture"
          >
            {{ busy ? t('profile.identityCameraUploading') : t('profile.identityCameraUse') }}
          </button>
          <button
            type="button"
            class="rounded-lg border border-gray-300 px-4 py-2 text-sm text-ink hover:bg-gray-50"
            :disabled="busy"
            @click="retake"
          >
            {{ t('profile.identityCameraRetake') }}
          </button>
        </template>
      </div>
    </div>
  </dialog>
</template>
