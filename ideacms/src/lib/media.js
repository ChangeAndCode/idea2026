const apiBase = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');
/** URL del sitio público (ideafront), donde viven /assets. En build del CMS debe coincidir con el dominio del front en producción. */
const siteBase = (import.meta.env.VITE_SITE_URL || import.meta.env.VITE_FRONTEND_URL || '').trim().replace(/\/$/, '');

/**
 * Vista previa en el CMS: resuelve rutas contra el origen correcto.
 * - /uploads/* → backend (apiBase)
 * - /assets/* → sitio público (siteBase); en local el proxy de Vite también sirve /assets si no hay siteBase
 */
export function mediaUrl(pathOrUrl) {
  if (pathOrUrl == null || String(pathOrUrl).trim() === '') return '';
  const s = String(pathOrUrl).trim();
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith('/uploads')) return apiBase ? `${apiBase}${s}` : s;
  if (s.startsWith('/assets')) return siteBase ? `${siteBase}${s}` : s;
  return s;
}
