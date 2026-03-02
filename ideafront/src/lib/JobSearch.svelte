<script>
  import { onMount } from 'svelte';
  import { apiUrl } from './api.js';

  const STORAGE_KEY = 'ideafront-job-search-history';
  const MAX_HISTORY = 8;

  let query = '';
  let jobs = [];
  let loading = false;
  let error = '';
  let searchHistory = [];

  onMount(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        searchHistory = Array.isArray(parsed) ? parsed.slice(0, MAX_HISTORY) : [];
      }
    } catch (_) {
      searchHistory = [];
    }
  });

  function saveHistory() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(searchHistory));
    } catch (_) {}
  }

  function addToHistory(term) {
    const t = term.trim();
    if (!t) return;
    searchHistory = [t, ...searchHistory.filter((h) => h.toLowerCase() !== t.toLowerCase())].slice(0, MAX_HISTORY);
    saveHistory();
  }

  function removeFromHistory(term) {
    searchHistory = searchHistory.filter((h) => h !== term);
    saveHistory();
  }

  function clearHistory() {
    searchHistory = [];
    saveHistory();
  }

  function searchFromHistory(term) {
    query = term;
    search();
  }

  async function search() {
    if (!query.trim()) return;
    const term = query.trim();
    loading = true;
    error = '';
    addToHistory(term);
    try {
      const params = new URLSearchParams({ query: term, limit: 10 });
      const res = await fetch(apiUrl(`/api/jobs?${params}`));
      if (!res.ok) throw new Error('Error al buscar');
      jobs = await res.json();
    } catch (e) {
      error = e.message || 'Error al cargar ofertas';
      jobs = [];
    } finally {
      loading = false;
    }
  }
</script>

<div class="flex h-full min-h-[420px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:min-h-[480px]">
  <!-- Cabecera igual que el chat: mismo estilo -->
  <div class="flex shrink-0 items-center gap-3 border-b border-white/10 bg-gradient-to-br from-idea-navy to-idea-dark px-4 py-4 text-white">
    <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 sm:h-12 sm:w-12">
      <svg class="h-5 w-5 text-white sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
    <div>
      <h2 class="font-bold uppercase tracking-wide">Buscar ofertas</h2>
      <p class="mt-0.5 text-xs text-white/80">Palabras clave, puesto o ciudad</p>
    </div>
  </div>

  <!-- Búsqueda: compacta y clara -->
  <div class="shrink-0 border-b border-slate-200 bg-slate-50/50 p-4">
    <form onsubmit={(e) => { e.preventDefault(); search(); }} class="flex flex-col gap-2 sm:flex-row sm:gap-2">
      <input
        type="search"
        bind:value={query}
        placeholder="Ej. administración, Chihuahua..."
        class="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:border-idea-bright focus:outline-none focus:ring-2 focus:ring-idea-bright/30"
      />
      <button
        type="submit"
        disabled={loading}
        class="shrink-0 rounded-xl bg-idea-bright px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-50"
      >
        {loading ? 'Buscando...' : 'Buscar'}
      </button>
    </form>
    {#if error}
      <p class="mt-2 text-xs text-red-600">{error}</p>
    {/if}

    <!-- Historial de búsqueda -->
    {#if searchHistory.length > 0}
      <div class="mt-3 pt-3 border-t border-slate-200">
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs font-medium text-slate-500">Historial de búsqueda</span>
          <button
            type="button"
            class="text-xs text-slate-400 hover:text-slate-600"
            onclick={clearHistory}
          >
            Borrar todo
          </button>
        </div>
        <div class="mt-2 flex flex-wrap gap-1.5">
          {#each searchHistory as term}
            <div
              class="group flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 transition hover:border-idea-bright hover:bg-idea-light/50 hover:text-idea-navy"
              role="group"
            >
              <button
                type="button"
                class="flex-1 text-left"
                onclick={() => searchFromHistory(term)}
              >
                {term}
              </button>
              <button
                type="button"
                class="rounded p-0.5 opacity-60 hover:opacity-100 hover:bg-slate-200"
                onclick={(e) => { e.stopPropagation(); removeFromHistory(term); }}
                aria-label="Quitar del historial"
              >
                <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>

  <!-- Resultados: lista simple, sin cajas dentro de cajas -->
  <div class="flex-1 overflow-y-auto p-4">
    {#if jobs.length > 0}
      <ul class="space-y-3">
        {#each jobs as job}
          <li class="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
            <h3 class="font-semibold text-idea-navy">{job.title}</h3>
            <p class="mt-0.5 text-xs text-slate-500">{job.companyName} · {job.location || 'Varios'}</p>
            {#if job.applyLink}
              <a
                href={job.applyLink}
                target="_blank"
                rel="noopener noreferrer"
                class="mt-2 inline-block text-sm font-medium text-idea-bright hover:underline"
              >
                Ver oferta →
              </a>
            {/if}
          </li>
        {/each}
      </ul>
    {:else}
      <div class="flex flex-col items-center justify-center py-10 text-center">
        <p class="text-sm text-slate-500">
          {#if query && !loading}
            Sin resultados. Prueba otras palabras.
          {:else}
            Escribe y pulsa <strong>Buscar</strong> para ver ofertas.
          {/if}
        </p>
      </div>
    {/if}
  </div>
</div>
