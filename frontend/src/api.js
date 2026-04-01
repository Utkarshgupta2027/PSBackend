// Backend URL — always points to Render deployment
export const API_BASE = 'https://psbackend-4-6amw.onrender.com';

export function apiUrl(path) {
  return `${API_BASE}${path}`;
}