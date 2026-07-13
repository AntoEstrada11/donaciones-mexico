import type { Church } from '~/types'

const STORAGE_KEY = 'donation-church'

function readStoredChurch(): Church | null {
  if (!import.meta.client) return null
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) as Church : null
  }
  catch {
    return null
  }
}

export function useDonation() {
  const selectedChurch = useState<Church | null>('donation-church', () => null)
  const hydrated = useState('donation-hydrated', () => false)

  onMounted(() => {
    if (!selectedChurch.value) {
      selectedChurch.value = readStoredChurch()
    }
    hydrated.value = true
  })

  function selectChurch(church: Church) {
    selectedChurch.value = church
    if (import.meta.client) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(church))
    }
  }

  function clearChurch() {
    selectedChurch.value = null
    if (import.meta.client) {
      sessionStorage.removeItem(STORAGE_KEY)
    }
  }

  return { selectedChurch, hydrated, selectChurch, clearChurch }
}
