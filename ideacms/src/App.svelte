<script>
  import { route } from './stores/route.js';
  import PageList from './lib/PageList.svelte';
  import PageForm from './lib/PageForm.svelte';
  import SiteConfig from './lib/SiteConfig.svelte';

  $: path = $route.path;
  $: slug = $route.slug;

  function goList() {
    route.set({ path: 'list', slug: null });
  }
  function goSite() {
    route.set({ path: 'site', slug: null });
  }
</script>

<div class="min-h-screen bg-slate-100 flex flex-col">
  <header class="bg-white border-b border-slate-200 shadow-sm shrink-0">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-4">
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 class="text-xl font-bold text-slate-800 tracking-tight">Panel IDEA</h1>
          <p class="text-sm text-slate-500 mt-0.5">Gestiona el contenido y el menú de tu sitio</p>
        </div>
        <nav class="flex gap-1" aria-label="Dónde estás">
          <button
            type="button"
            class="px-4 py-2.5 rounded-lg text-sm font-medium transition-colors {path === 'list' || path === 'edit' || path === 'create'
              ? 'bg-slate-800 text-white'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'}"
            onclick={goList}
          >
            Contenido
          </button>
          <button
            type="button"
            class="px-4 py-2.5 rounded-lg text-sm font-medium transition-colors {path === 'site'
              ? 'bg-slate-800 text-white'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'}"
            onclick={goSite}
          >
            Menú y logos
          </button>
        </nav>
      </div>
    </div>
  </header>

  <main class="flex-1 py-6 px-4 sm:px-6">
    <div class="max-w-4xl mx-auto">
      {#if path === 'site'}
        <SiteConfig />
      {:else if path === 'list'}
        <PageList />
      {:else if path === 'edit' && slug}
        <PageForm {slug} />
      {:else if path === 'create'}
        <PageForm slug={null} />
      {:else}
        <PageList />
      {/if}
    </div>
  </main>
</div>
