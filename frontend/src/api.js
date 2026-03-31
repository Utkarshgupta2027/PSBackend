// Production backend URL - fallback if VITE_API_URL env var is not set in Vercel
export const API_BASE = import.meta.env.VITE_API_URL || 'https://psbackend-4-6amw.onrender.com';

export function apiUrl(path) {
  return `${API_BASE}${path}`;
}