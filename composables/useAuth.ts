import type { AuthResponse, Donation, DonorProfile } from '~/types'

const USER_KEY = 'auth-user'

export interface AuthUser {
  token: string
  id: string
  name: string
  email: string
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
      id: response.id,
      name: response.name,
      email: response.email,
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

  return {
    user,
    isLoggedIn,
    register,
    login,
    logout,
    fetchProfile,
    updateProfile,
    fetchDonations,
    optionalAuthHeaders,
  }
}
