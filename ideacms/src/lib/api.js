const base = '/api/cms';

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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error((await r.json()).error || await r.text());
  return r.json();
}

export async function updatePage(slug, data) {
  const r = await fetch(`${base}/pages/${encodeURIComponent(slug)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error((await r.json()).error || await r.text());
  return r.json();
}

export async function deletePage(slug) {
  const r = await fetch(`${base}/pages/${encodeURIComponent(slug)}`, { method: 'DELETE' });
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error((await r.json()).error || await r.text());
  return r.json();
}
