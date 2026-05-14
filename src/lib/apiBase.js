/**
 * Absolute API path for `fetch`.
 * Dev: leave `VITE_API_URL` unset — Vite proxies `/api` to Spring on 3001.
 * Prod (e.g. Railway): set `VITE_API_URL` to the backend origin, no trailing slash
 * (e.g. `https://your-api.up.railway.app`).
 */
export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`
  const raw = String(import.meta.env.VITE_API_URL ?? '')
    .trim()
    .replace(/\/$/, '')
  if (!raw) return p
  return `${raw}${p}`
}
