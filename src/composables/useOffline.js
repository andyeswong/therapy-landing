export { apiFetch as persistentFetch } from './useAuth.js'

export function isOnline() {
  return navigator.onLine
}

export function onConnectionChange(callback) {
  window.addEventListener('online',  () => callback(true))
  window.addEventListener('offline', () => callback(false))
}
