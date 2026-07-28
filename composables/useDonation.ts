import type { Church } from '~/types'

const CHURCH_KEY = 'donation-church'
const DRAFT_KEY = 'donation-draft'

export interface DonationDraft {
  campaignId: string | null
  amount: number | null
  customAmount: string
  paymentMethod: 'spei' | 'card'
}

const emptyDraft = (): DonationDraft => ({
  campaignId: null,
  amount: null,
  customAmount: '',
  paymentMethod: 'spei',
})

function readStoredChurch(): Church | null {
  if (!import.meta.client) return null
  try {
    const raw = sessionStorage.getItem(CHURCH_KEY) || localStorage.getItem(CHURCH_KEY)
    return raw ? JSON.parse(raw) as Church : null
  }
  catch {
    return null
  }
}

function readStoredDraft(): DonationDraft {
  if (!import.meta.client) return emptyDraft()
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    if (!raw) return emptyDraft()
    return { ...emptyDraft(), ...JSON.parse(raw) as Partial<DonationDraft> }
  }
  catch {
    return emptyDraft()
  }
}

export function useDonation() {
  const selectedChurch = useState<Church | null>('donation-church', () => null)
  const draft = useState<DonationDraft>('donation-draft', emptyDraft)
  const hydrated = useState('donation-hydrated', () => false)

  onMounted(() => {
    if (!selectedChurch.value) {
      selectedChurch.value = readStoredChurch()
    }
    draft.value = readStoredDraft()
    hydrated.value = true
  })

  function persistChurch(church: Church | null) {
    if (!import.meta.client) return
    if (!church) {
      sessionStorage.removeItem(CHURCH_KEY)
      localStorage.removeItem(CHURCH_KEY)
      return
    }
    const raw = JSON.stringify(church)
    sessionStorage.setItem(CHURCH_KEY, raw)
    localStorage.setItem(CHURCH_KEY, raw)
  }

  function persistDraft() {
    if (!import.meta.client) return
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft.value))
  }

  function selectChurch(church: Church) {
    selectedChurch.value = church
    persistChurch(church)
  }

  function clearChurch() {
    selectedChurch.value = null
    persistChurch(null)
  }

  function updateDraft(partial: Partial<DonationDraft>) {
    draft.value = { ...draft.value, ...partial }
    persistDraft()
  }

  function clearDraft() {
    draft.value = emptyDraft()
    if (import.meta.client) {
      sessionStorage.removeItem(DRAFT_KEY)
    }
  }

  return {
    selectedChurch,
    draft,
    hydrated,
    selectChurch,
    clearChurch,
    updateDraft,
    clearDraft,
  }
}
