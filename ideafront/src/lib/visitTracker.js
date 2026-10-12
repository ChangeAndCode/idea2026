import { apiUrl } from './api.js';

const VISITOR_KEY = 'idea-anonymous-visitor-id';
const SESSION_PREFIX = 'idea-visit:';
const DEDUPE_MS = 30 * 60 * 1000;

function titleFromPath(path) {
  if (path === '/') return 'Inicio';
  if (path === '/bolsa') return 'Bolsa de empleo';
  const slug = path.startsWith('/pagina/') ? path.slice(8) : path.slice(1);
  return decodeURIComponent(slug).replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/\b\w/g, (letter) => letter.toUpperCase()) || path;
}

function getVisitorId() {
  try {
    let id = window.localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch (_) {
    return `anonymous-${Date.now()}`;
  }
}

export function trackPageVisit(path, title = '') {
  if (typeof window === 'undefined') return;
  const normalizedPath = String(path || '/').split('?')[0] || '/';
  const dedupeKey = `${SESSION_PREFIX}${normalizedPath}`;
  const now = Date.now();

  try {
    const lastVisit = Number(window.sessionStorage.getItem(dedupeKey) || 0);
    if (lastVisit && now - lastVisit < DEDUPE_MS) return;
    window.sessionStorage.setItem(dedupeKey, String(now));
  } catch (_) {}

  fetch(apiUrl('/api/analytics/visits'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      path: normalizedPath,
      title: title || titleFromPath(normalizedPath),
      referrer: document.referrer || '',
      visitorId: getVisitorId(),
    }),
    keepalive: true,
  }).catch(() => {});
}
