<script>
  let query = '';
  let jobs = [];
  let loading = false;
  let error = '';

  async function search() {
    if (!query.trim()) return;
    loading = true;
    error = '';
    try {
      const params = new URLSearchParams({ query: query.trim(), limit: 10 });
      const res = await fetch(`/api/jobs?${params}`);
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

<div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
  <h2 class="text-lg font-semibold text-slate-800">Buscar ofertas</h2>
  <form on:submit|preventDefault={search} class="mt-4 flex gap-2">
    <input
      type="search"
      bind:value={query}
      placeholder="Ej. administración, Chihuahua..."
      class="flex-1 rounded-lg border border-slate-300 px-4 py-2 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
    />
    <button
      type="submit"
      disabled={loading}
      class="rounded-lg bg-sky-600 px-4 py-2 font-medium text-white transition hover:bg-sky-700 disabled:opacity-50"
    >
      {loading ? 'Buscando...' : 'Buscar'}
    </button>
  </form>
  {#if error}
    <p class="mt-2 text-sm text-red-600">{error}</p>
  {/if}
  <ul class="mt-6 space-y-4">
    {#each jobs as job}
      <li class="rounded-lg border border-slate-100 bg-slate-50 p-4">
        <h3 class="font-medium text-slate-800">{job.title}</h3>
        <p class="text-sm text-slate-600">{job.companyName} · {job.location || 'Varios'}</p>
        {#if job.applyLink}
          <a
            href={job.applyLink}
            target="_blank"
            rel="noopener noreferrer"
            class="mt-2 inline-block text-sm font-medium text-sky-600 hover:underline"
          >
            Ver oferta →
          </a>
        {/if}
      </li>
    {:else}
      <li class="text-center text-slate-500">
        {#if query && !loading}
          Sin resultados.
        {:else}
          Escribe y busca para ver resultados.
        {/if}
      </li>
    {/each}
  </ul>
</div>
