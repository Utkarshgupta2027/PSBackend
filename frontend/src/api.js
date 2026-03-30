/**
 * Central API configuration.
 * In development: VITE_API_URL is empty → requests go to Vite proxy (localhost:8080)
 * In production:  VITE_API_URL = your Railway backend URL
 */
export const API_BASE = 'https://psbackend-4-6amw.onrender.com' || ''

/** Build a full API URL. Usage: apiUrl('/user/login') */
export function apiUrl(path) {
  return `${API_BASE}${path}`
}