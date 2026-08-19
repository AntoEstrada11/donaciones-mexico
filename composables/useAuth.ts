import type { AuthResponse, ConsentType, DataExport, Donation, DonorProfile, UserRole } from '~/types'

const USER_KEY = 'auth-user'

export interface AuthUser {
  token: string
  id: string
  name: string
  email: string
  role: UserRole
  profileComplete: boolean
}

function readStoredUser(): AuthUser | null {
  if (!import.meta.client) return null
  try {
    const raw = sessionStorage.getItem(USER_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AuthUser
    return {
      ...parsed,
      role: parsed.role === 'admin' ? 'admin' : 'donor',
    }
  }
  catch {
    return null
  }
}

function persistUser(user: AuthUser | null) {
  if (!import.meta.client) return
  if (!user) {
    sessionStorage.removeItem(USER_KEY)
    return
  }
  sessionStorage.setItem(USER_KEY, JSON.stringify(user))
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` }
}

export function useAuth() {
  const user = useState<AuthUser | null>('auth-user', () => null)

  if (import.meta.client && !user.value) {
    user.value = readStoredUser()
  }

  const isLoggedIn = computed(() => !!user.value?.token)
  const isAdmin = computed(() => user.value?.role === 'admin')

  function setSession(response: AuthResponse) {
    user.value = {
      token: response.token,
      id: response.id,
      name: response.name,
      email: response.email,
      role: response.role === 'admin' ? 'admin' : 'donor',
      profileComplete: response.profileComplete,
    }
    persistUser(user.value)
  }

  function requireToken() {
    const token = user.value?.token
    if (!token) throw new Error('No autenticado')
    return token
  }

  async function register(payload: {
    email: string
    password: string
    name?: string
    consent: boolean
    marketing?: boolean
  }) {
    const response = await $fetch<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: payload,
    })
    setSession(response)
    return response
  }

  async function login(email: string, password: string) {
    const response = await $fetch<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    setSession(response)
    return response
  }

  function logout() {
    user.value = null
    persistUser(null)
  }

  async function fetchProfile(): Promise<DonorProfile> {
    return await $fetch<DonorProfile>('/api/me', {
      headers: authHeaders(requireToken()),
    })
  }

  async function updateProfile(payload: Partial<DonorProfile>) {
    const profile = await $fetch<DonorProfile>('/api/me', {
      method: 'PATCH',
      headers: authHeaders(requireToken()),
      body: payload,
    })
    user.value = {
      ...user.value!,
      name: profile.name,
      profileComplete: profile.profileComplete,
    }
    persistUser(user.value)
    return profile
  }

  async function fetchDonations(): Promise<Donation[]> {
    return await $fetch<Donation[]>('/api/donations', {
      headers: authHeaders(requireToken()),
    })
  }

  /** Token para adjuntar la donación al donante cuando hay sesión iniciada. */
  function optionalAuthHeaders(): Record<string, string> {
    const token = user.value?.token
    return token ? authHeaders(token) : {}
  }

  function adminHeaders(): Record<string, string> {
    return authHeaders(requireToken())
  }

  /** Derecho de acceso: dispara la descarga del JSON con todos los datos del titular. */
  async function downloadMyData() {
    const data = await $fetch<DataExport>('/api/me/export', {
      headers: authHeaders(requireToken()),
    })

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'mis-datos.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  async function fetchConsents() {
    return await $fetch<Partial<Record<ConsentType, boolean>>>('/api/me/consents', {
      headers: authHeaders(requireToken()),
    })
  }

  async function setConsent(type: ConsentType, granted: boolean) {
    return await $fetch<Partial<Record<ConsentType, boolean>>>('/api/me/consents', {
      method: 'POST',
      headers: authHeaders(requireToken()),
      body: { type, granted },
    })
  }

  async function deleteAccount(password: string) {
    await $fetch('/api/me', {
      method: 'DELETE',
      headers: authHeaders(requireToken()),
      body: { password },
    })
    logout()
  }

  return {
    user,
    isLoggedIn,
    isAdmin,
    register,
    login,
    logout,
    fetchProfile,
    updateProfile,
    fetchDonations,
    optionalAuthHeaders,
    adminHeaders,
    downloadMyData,
    fetchConsents,
    setConsent,
    deleteAccount,
  }
}
