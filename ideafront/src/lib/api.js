/**
 * URL base de la API. En producción debe ser la URL del backend (ej. Render).
 * En desarrollo queda vacío para usar el proxy de Vite.
 */
const apiBase = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');

/** Devuelve la URL completa para una ruta de la API (ej. /api/search-combo) */
export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return apiBase ? `${apiBase}${p}` : p;
}
