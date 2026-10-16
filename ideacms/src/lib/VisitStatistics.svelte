<script>
  import { onMount } from 'svelte';
  import { getAnalyticsHistory, getAnalyticsPages, getAnalyticsSummary, getAnalyticsTimeseries } from './api.js';

  const iso = (date) => date.toISOString().slice(0, 10);
  let to = $state(iso(new Date()));
  let from = $state(iso(new Date(Date.now() - 29 * 86400000)));
  let path = $state('');
  let summary = $state({ total: 0, today: 0, uniqueVisitors: 0 });
  let pages = $state([]);
  let series = $state([]);
  let history = $state({ items: [], total: 0, page: 1, limit: 25 });
  let loading = $state(true);
  let error = $state('');
  let searchTimer;

  async function load() {
    loading = true;
    error = '';
    const params = { from, to, path };
    try {
      [summary, pages, series, history] = await Promise.all([
        getAnalyticsSummary(params),
        getAnalyticsPages(params),
        getAnalyticsTimeseries(params),
        getAnalyticsHistory({ ...params, page: history.page, limit: history.limit }),
      ]);
    } catch (e) {
      error = e.message || 'No se pudieron cargar las estadísticas.';
    } finally {
      loading = false;
    }
  }

  function setPeriod(days) {
    to = iso(new Date());
    from = iso(new Date(Date.now() - (days - 1) * 86400000));
    history = { ...history, page: 1 };
    load();
  }

  function onPathInput() {
    clearTimeout(searchTimer);
  }

  function applyPathFilter() {
    history = { ...history, page: 1 };
    load();
  }

  function formatDate(value) {
    return value ? new Date(value).toLocaleString('es-MX') : '—';
  }

  function chartDate(value) {
    const [, month, day] = value.split('-');
    return `${day}/${month}`;
  }

  function pageTitle(item) {
    if (item.title && item.title !== 'IDEA - Municipio de Chihuahua') return item.title;
    if (item.path === '/') return 'Inicio';
    if (item.path === '/bolsa') return 'Bolsa de empleo';
    return item.path.replace('/pagina/', '').replace(/^\//, '').replace(/[-_]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) || item.path;
  }

  const maxVisits = $derived(Math.max(...series.map((item) => item.visits), 1));
  onMount(load);
</script>

<div class="space-y-6">
  <div class="flex flex-wrap items-end justify-between gap-4">
    <div>
      <h3 class="text-xl font-semibold text-slate-800">Estadísticas de visitas</h3>
      <p class="mt-1 text-sm text-slate-500">Actividad anónima registrada en el sitio público.</p>
    </div>
    <div class="flex flex-wrap items-end gap-2">
      <button type="button" class="cms-btn-secondary !py-2 text-sm" onclick={() => setPeriod(7)}>7 días</button>
      <button type="button" class="cms-btn-secondary !py-2 text-sm" onclick={() => setPeriod(30)}>30 días</button>
      <label class="text-xs text-slate-500">Desde<input type="date" class="cms-input !py-2 text-sm" bind:value={from} /></label>
      <label class="text-xs text-slate-500">Hasta<input type="date" class="cms-input !py-2 text-sm" bind:value={to} /></label>
      <button type="button" class="cms-btn-primary !py-2 text-sm" onclick={() => { history = { ...history, page: 1 }; load(); }}>Filtrar</button>
    </div>
  </div>

  {#if error}<div class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>{/if}

  <div class="grid gap-4 sm:grid-cols-3">
    <div class="cms-card p-5"><p class="text-sm text-slate-500">Visitas del periodo</p><p class="mt-2 text-3xl font-bold text-idea-dark">{summary.total ?? 0}</p></div>
    <div class="cms-card p-5"><p class="text-sm text-slate-500">Visitas de hoy</p><p class="mt-2 text-3xl font-bold text-idea-dark">{summary.today ?? 0}</p></div>
    <div class="cms-card p-5"><p class="text-sm text-slate-500">Visitantes únicos</p><p class="mt-2 text-3xl font-bold text-idea-dark">{summary.uniqueVisitors ?? 0}</p></div>
  </div>

  {#if loading}<div class="cms-card p-8 text-center text-slate-500">Cargando estadísticas…</div>{:else}
    <div class="grid gap-6 lg:grid-cols-2">
      <section class="cms-card p-6">
        <h4 class="font-semibold text-slate-800">Actividad diaria</h4>
        <div class="mt-6 overflow-x-auto border-b border-l border-slate-200 px-2 pb-1">
          <div class="flex h-64 min-w-full items-end gap-2">
            {#each series as item}
              {@const barHeight = Math.max((item.visits / maxVisits) * 100, 4)}
              <div class="group relative flex h-full min-w-10 flex-1 flex-col items-center justify-end" title={`${item.date}: ${item.visits} visitas`}>
                <span class="mb-1 text-xs font-semibold text-idea-dark">{item.visits}</span>
                <div class="w-full rounded-t bg-idea-bright transition hover:bg-idea-dark" style={`height: ${barHeight}%`}></div>
                <span class="mt-3 whitespace-nowrap text-[10px] text-slate-500">{chartDate(item.date)}</span>
              </div>
            {/each}
          </div>
        </div>
        <p class="mt-8 text-xs text-slate-500">{series.length ? `Escala: 0 a ${maxVisits} visitas por día` : 'Sin datos en el periodo'}</p>
        {#if series.length}<p class="mt-1 text-xs text-slate-500">Año: {series[0].date.slice(0, 4)}</p>{/if}
      </section>
      <section class="cms-card p-6">
        <h4 class="font-semibold text-slate-800">Páginas más visitadas</h4>
        <ul class="mt-4 divide-y divide-slate-100">{#each pages as item}<li class="flex justify-between gap-4 py-3 text-sm"><span class="min-w-0 truncate text-slate-600" title={item.path}>{item.title && item.title !== 'IDEA - Municipio de Chihuahua' ? item.title : item.path === '/' ? 'Inicio' : item.path === '/bolsa' ? 'Bolsa de empleo' : item.path.replace('/pagina/', '').replace(/[-_]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())}</span><strong class="text-idea-dark">{item.visits}</strong></li>{:else}<li class="py-3 text-sm text-slate-500">Sin datos.</li>{/each}</ul>
      </section>
    </div>

    <section class="cms-card overflow-hidden">
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-6"><h4 class="font-semibold text-slate-800">Historial de visitas</h4><div class="flex gap-2"><input class="cms-input !w-auto !py-2 text-sm" placeholder="Filtrar por ruta" bind:value={path} onkeydown={(event) => event.key === 'Enter' && applyPathFilter()} /><button type="button" class="cms-btn-primary !py-2 text-sm" onclick={applyPathFilter}>Buscar</button></div></div>
      <div class="overflow-x-auto"><table class="w-full text-left text-sm"><thead class="bg-slate-50 text-xs uppercase text-slate-500"><tr><th class="px-6 py-3">Fecha y hora</th><th class="px-6 py-3">Página</th><th class="px-6 py-3">Fuente</th></tr></thead><tbody class="divide-y divide-slate-100">{#each history.items as item}<tr><td class="whitespace-nowrap px-6 py-3 text-slate-500">{formatDate(item.visitedAt)}</td><td class="px-6 py-3"><div class="text-base font-semibold text-slate-700">{pageTitle(item)}</div><div class="mt-1 text-xs text-slate-400">{item.path}</div></td><td class="px-6 py-3 text-slate-500">{item.source || 'direct'}</td></tr>{:else}<tr><td colspan="3" class="px-6 py-8 text-center text-slate-500">Sin visitas registradas.</td></tr>{/each}</tbody></table></div>
      <div class="flex items-center justify-between border-t border-slate-200 px-6 py-3 text-sm text-slate-500"><span>{history.total ?? 0} registros</span><div class="flex gap-2"><button class="cms-btn-secondary !px-3 !py-1.5" disabled={history.page <= 1} onclick={() => { history = { ...history, page: history.page - 1 }; load(); }}>Anterior</button><span class="px-2 py-1.5">Página {history.page}</span><button class="cms-btn-secondary !px-3 !py-1.5" disabled={history.page * history.limit >= history.total} onclick={() => { history = { ...history, page: history.page + 1 }; load(); }}>Siguiente</button></div></div>
    </section>
  {/if}
</div>
