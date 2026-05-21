import { ref } from 'vue'

const TOKEN_KEY = 'ian_app_token'
export const authenticated = ref(!!localStorage.getItem(TOKEN_KEY))

export const getToken = () => localStorage.getItem(TOKEN_KEY)

export async function apiFetch(url, options = {}) {
  const token = getToken()
  const isFormData = options.body instanceof FormData
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  if (res.status === 401) {
    localStorage.removeItem(TOKEN_KEY)
    authenticated.value = false
  }
  return res
}

export async function login(pin) {
  const res = await fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin: String(pin) }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || 'PIN incorrecto')
  }
  const { token } = await res.json()
  localStorage.setItem(TOKEN_KEY, token)
  authenticated.value = true
}

export async function logout() {
  const token = getToken()
  if (token) {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {})
  }
  localStorage.removeItem(TOKEN_KEY)
  authenticated.value = false
}
