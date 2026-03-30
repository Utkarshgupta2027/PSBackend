/**
 * Central API configuration.
 * In development: VITE_API_URL is empty, so requests go to the Vite proxy (localhost:8080)
 * In production: VITE_API_URL is set to the Railway backend URL
 */
export const API_BASE = import.meta.env.VITE_API_URL || ''

/**
 * Helper to build a full API URL
 * Usage: apiUrl('/user/login') 
 */
export function apiUrl(path) {
  return `${API_BASE}${path}`
}
