import type { AuthResponse, Donation, DonorProfile } from '~/types'

const USER_KEY = 'auth-user'
const HISTORY_KEY = 'donation-history'

export interface AuthUser {
  token: string
  name: string
  email: string
  odooPartnerId: number
  profileComplete: boolean
}

function readStoredUser(): AuthUser | null {
  if (!import.meta.client) return null
  try {
    const raw = sessionStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) as AuthUser : null
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

function readLocalHistory(): Donation[] {
  if (!import.meta.client) return []
  try {
    const raw = sessionStorage.getItem(HISTORY_KEY)
    return raw ? JSON.parse(raw) as Donation[] : []
  }
  catch {
    return []
  }
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

  function setSession(response: AuthResponse) {
    user.value = {
      token: response.token,
      name: response.name,
      email: response.email,
      odooPartnerId: response.odooPartnerId,
      profileComplete: response.profileComplete,
    }
    persistUser(user.value)
  }

  async function register(payload: {
    email: string
    password: string
    name?: string
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
    if (!user.value?.token) {
      throw new Error('No autenticado')
    }
    return await $fetch<DonorProfile>('/api/me', {
      headers: authHeaders(user.value.token),
    })
  }

  async function updateProfile(payload: Partial<DonorProfile>) {
    if (!user.value?.token) {
      throw new Error('No autenticado')
    }
    const profile = await $fetch<DonorProfile>('/api/me', {
      method: 'PATCH',
      headers: authHeaders(user.value.token),
      body: payload,
    })
    user.value = {
      ...user.value,
      name: profile.name,
      profileComplete: profile.profileComplete,
    }
    persistUser(user.value)
    return profile
  }

  function addDonationToHistory(donation: Donation) {
    if (!import.meta.client) return
    const history = readLocalHistory()
    history.unshift(donation)
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  }

  function getLocalHistory(): Donation[] {
    return readLocalHistory()
  }

  return {
    user,
    isLoggedIn,
    register,
    login,
    logout,
    fetchProfile,
    updateProfile,
    addDonationToHistory,
    getLocalHistory,
  }
}
