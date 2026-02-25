<script>
  import { getStaticPage } from '../cms-static-data.js';

  export let slug = '';
  let title = '';
  let body = '';
  let loading = true;
  let notFound = false;

  async function load(s) {
    if (!s) return;
    loading = true;
    notFound = false;
    const staticPage = getStaticPage(s);
    if (staticPage) {
      title = staticPage.title || '';
      body = staticPage.body || '';
      loading = false;
      return;
    }
    try {
      const res = await fetch(`/api/cms/pages/${encodeURIComponent(s)}`);
      if (!res.ok) {
        notFound = true;
        return;
      }
      const data = await res.json();
      title = data.title || '';
      body = data.body || '';
    } catch {
      notFound = true;
    } finally {
      loading = false;
    }
  }

  $: load(slug || 'inicio');
</script>

{#if loading}
  <p class="text-slate-500">Cargando...</p>
{:else if notFound}
  <p class="text-slate-500">Página no encontrada.</p>
{:else}
  <article class="prose prose-slate max-w-none">
    <h1 class="text-2xl font-bold text-slate-800">{title}</h1>
    <div class="mt-4 text-slate-700">
      {@html body || '<p>Sin contenido.</p>'}
    </div>
  </article>
{/if}
