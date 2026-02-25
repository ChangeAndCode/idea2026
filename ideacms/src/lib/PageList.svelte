<script>
  import { route } from '../stores/route.js';
  import { getPages, deletePage } from './api.js';

  let list = $state([]);
  let loading = $state(true);
  let error = $state('');
  let deleting = $state(null);
  let message = $state('');

  async function load() {
    loading = true;
    error = '';
    try {
      list = await getPages();
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  function goEdit(slug) {
    route.set({ path: 'edit', slug });
  }

  function goCreate() {
    route.set({ path: 'create', slug: null });
  }

  async function remove(slug) {
    if (!confirm('¿Eliminar esta página? No se puede deshacer.')) return;
    deleting = slug;
    message = '';
    try {
      await deletePage(slug);
      list = list.filter((p) => p.slug !== slug);
      message = 'Página eliminada.';
      setTimeout(() => { message = ''; }, 3000);
    } catch (e) {
      error = e.message;
    } finally {
      deleting = null;
    }
  }

  load();
</script>

<div class="cms-card p-6">
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
    <div>
      <h2 class="text-lg font-semibold text-slate-800">Tu contenido</h2>
      <p class="text-sm text-slate-500 mt-1">Estas son las secciones que aparecen en el menú. Haz clic en <strong>Editar</strong> para cambiar el texto o en <strong>Crear página</strong> para agregar una nueva.</p>
    </div>
    <button
      type="button"
      class="cms-btn-primary shrink-0"
      onclick={goCreate}
    >
      Crear página
    </button>
  </div>

  {#if message}
    <p class="mb-4 py-2 px-3 rounded-lg bg-green-50 text-green-800 text-sm border border-green-200" role="status">
      {message}
    </p>
  {/if}
  {#if error}
    <p class="mb-4 py-2 px-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200" role="alert">
      {error}
    </p>
  {/if}

  {#if loading}
    <ul class="space-y-2">
      {#each [1, 2, 3, 4, 5] as _}
        <li class="h-14 rounded-lg bg-slate-100 animate-pulse"></li>
      {/each}
    </ul>
  {:else if list.length === 0}
    <div class="text-center py-12 px-4 rounded-xl bg-slate-50 border border-slate-200">
      <p class="text-slate-600 font-medium">No hay páginas todavía</p>
      <p class="text-slate-500 text-sm mt-1">Crea la primera con el botón de abajo. Luego podrás editarla cuando quieras.</p>
      <button
        type="button"
        class="cms-btn-primary mt-4"
        onclick={goCreate}
      >
        Crear página
      </button>
    </div>
  {:else}
    <ul class="divide-y divide-slate-100">
      {#each list as p (p.slug)}
        <li class="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
          <div class="min-w-0 flex-1">
            <p class="font-medium text-slate-800 truncate">{p.title}</p>
            <p class="text-sm text-slate-500 truncate">Enlace: /pagina/{p.slug}</p>
          </div>
          <div class="flex gap-2 shrink-0">
            <button
              type="button"
              class="cms-btn-primary !py-2 !px-4 text-sm"
              onclick={() => goEdit(p.slug)}
            >
              Editar
            </button>
            <button
              type="button"
              class="py-2 px-4 text-sm text-red-600 hover:bg-red-50 rounded-lg border border-red-200 disabled:opacity-50 transition-colors"
              onclick={() => remove(p.slug)}
              disabled={deleting === p.slug}
              title="Eliminar esta página"
            >
              {deleting === p.slug ? '…' : 'Eliminar'}
            </button>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</div>
