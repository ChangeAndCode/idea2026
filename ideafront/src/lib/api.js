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

/**
 * URL para mostrar imágenes: rutas /uploads/* las resuelve contra el backend.
 * Las rutas /assets/* y las URLs absolutas se dejan igual.
 */
export function mediaUrl(pathOrUrl) {
  if (pathOrUrl == null || String(pathOrUrl).trim() === '') return '';
  const s = String(pathOrUrl).trim();
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith('/uploads')) return apiBase ? `${apiBase}${s}` : s;
  return s;
}
