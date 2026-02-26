const base = '/api/cms';

/** Si Clerk está activo, el App debe llamar setClerkGetToken(getToken) para enviar el token en las peticiones de modificación. */
let clerkGetToken = null;
export function setClerkGetToken(fn) {
  clerkGetToken = fn;
}

async function authHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (clerkGetToken) {
    try {
      const token = await clerkGetToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
    } catch (_) {}
  }
  return headers;
}

export async function getPages() {
  const r = await fetch(`${base}/pages`);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function getPage(slug) {
  const r = await fetch(`${base}/pages/${encodeURIComponent(slug)}`);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function createPage(data) {
  const r = await fetch(`${base}/pages`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error((await r.json()).error || await r.text());
  return r.json();
}

export async function updatePage(slug, data) {
  const r = await fetch(`${base}/pages/${encodeURIComponent(slug)}`, {
    method: 'PUT',
    headers: await authHeaders(),
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error((await r.json()).error || await r.text());
  return r.json();
}

export async function deletePage(slug) {
  const r = await fetch(`${base}/pages/${encodeURIComponent(slug)}`, {
    method: 'DELETE',
    headers: await authHeaders(),
  });
  if (!r.ok && r.status !== 204) throw new Error((await r.json()).error || await r.text());
}

/** Configuración del sitio (navegación + logos del header) */
export async function getSiteConfig() {
  const r = await fetch(`${base}/site`);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function updateSiteConfig(data) {
  const r = await fetch(`${base}/site`, {
    method: 'PUT',
    headers: await authHeaders(),
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error((await r.json()).error || await r.text());
  return r.json();
}

/** Lista usuarios que pueden acceder al CMS (Clerk). */
export async function getCmsUsers() {
  const r = await fetch(`${base}/users`, { headers: await authHeaders() });
  if (!r.ok) throw new Error((await r.json()).error || await r.text());
  return r.json();
}

/** Crea un usuario CMS: nombre, correo, contraseña (la cambiarán después). */
export async function createCmsUser(data) {
  const r = await fetch(`${base}/users`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error((await r.json()).error || await r.text());
  return r.json();
}
