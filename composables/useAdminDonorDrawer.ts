/**
 * Ficha operativa del donante en panel (drawer) sin abandonar la lista actual.
 */
export function useAdminDonorDrawer() {
  const donorId = useState<string | null>('admin-donor-drawer-id', () => null)

  const isOpen = computed(() => Boolean(donorId.value))

  function openDonor(id: string) {
    const next = String(id || '').trim()
    if (!next) return
    donorId.value = next
  }

  function closeDonor() {
    donorId.value = null
  }

  return {
    donorId,
    isOpen,
    openDonor,
    closeDonor,
  }
}
