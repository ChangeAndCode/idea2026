<script>
  import { route } from '../stores/route.js';
  import { getPage, createPage, updatePage } from './api.js';

  let { slug = null } = $props();

  let title = $state('');
  let body = $state('');
  let image = $state('');
  let slugInput = $state('');
  let loading = $state(true);
  let saving = $state(false);
  let error = $state('');

  const isCreate = $derived(slug === null);

  async function load() {
    if (!slug) {
      loading = false;
      return;
    }
    loading = true;
    error = '';
    try {
      const p = await getPage(slug);
      title = p.title ?? '';
      body = p.body ?? '';
      image = p.image ?? '';
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  function goBack() {
    route.set({ path: 'list', slug: null });
  }

  async function submit() {
    const t = title.trim();
    const b = body.trim();
    const img = image.trim();
    if (!t) {
      error = 'Escribe un título para la página.';
      return;
    }
    saving = true;
    error = '';
    try {
      if (isCreate) {
        const s = (slugInput || t).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        if (!s) {
          error = 'El nombre en la URL no es válido. Usa solo letras minúsculas y guiones (por ejemplo: mi-seccion).';
          saving = false;
          return;
        }
        await createPage({ slug: s, title: t, body: b, image: img });
      } else {
        await updatePage(slug, { title: t, body: b, image: img });
      }
      goBack();
    } catch (e) {
      error = e.message;
    } finally {
      saving = false;
    }
  }

  $effect(() => {
    if (slug !== undefined) load();
  });
</script>

<div class="cms-card p-6">
  <button
    type="button"
    class="text-slate-600 hover:text-slate-800 font-medium text-sm mb-6 flex items-center gap-1"
    onclick={goBack}
  >
    ← Ver todas las páginas
  </button>

  <h2 class="text-lg font-semibold text-slate-800 mb-4">
    {isCreate ? 'Nueva página' : 'Editar: ' + (title || '…')}
  </h2>

  {#if error}
    <p class="mb-4 py-2 px-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200" role="alert">
      {error}
    </p>
  {/if}
  {#if loading}
    <div class="space-y-4">
      <div class="h-10 rounded-lg bg-slate-100 animate-pulse w-3/4"></div>
      <div class="h-64 rounded-lg bg-slate-100 animate-pulse"></div>
    </div>
  {:else}
    <form onsubmit={(e) => { e.preventDefault(); submit(); }} class="space-y-6">
      {#if isCreate}
        <div>
          <label for="slug" class="cms-label">Nombre en la URL</label>
          <input
            id="slug"
            type="text"
            class="cms-input"
            bind:value={slugInput}
            placeholder="ej: emprendimiento"
          />
          <p class="text-sm text-slate-500 mt-1.5">Así se verá el enlace. Si pones <em>emprendimiento</em>, la página será: …/pagina/emprendimiento. Usa solo letras minúsculas y guiones.</p>
        </div>
      {:else}
        <p class="text-sm text-slate-500">Enlace de esta página: <code class="bg-slate-100 px-1.5 py-0.5 rounded">/pagina/{slug}</code> (no se puede cambiar al editar)</p>
      {/if}

      <div>
        <label for="title" class="cms-label">Título</label>
        <input
          id="title"
          type="text"
          class="cms-input"
          bind:value={title}
          placeholder="Ej: Emprendimiento"
        />
        <p class="text-sm text-slate-500 mt-1.5">Es lo que se ve en el menú y arriba de la página.</p>
      </div>

      <div>
        <label for="image" class="cms-label">Logo / imagen (ruta)</label>
        <input
          id="image"
          type="text"
          class="cms-input"
          bind:value={image}
          placeholder="Ej: /assets/contenido/logo-mifam.png"
        />
        <p class="text-sm text-slate-500 mt-1.5">Ruta de la imagen que se muestra a la derecha del texto (ej: /assets/contenido/mi-logo.png). Déjalo vacío si no hay logo.</p>
      </div>

      <div>
        <label for="body" class="cms-label">Contenido</label>
        <textarea
          id="body"
          class="cms-input font-mono text-sm min-h-[14rem]"
          bind:value={body}
          placeholder="<p>Escribe aquí el texto de la página...</p>"
        ></textarea>
        <p class="text-sm text-slate-500 mt-1.5">El texto e imágenes de la página. Puedes usar etiquetas como &lt;p&gt;, &lt;strong&gt;, &lt;a href="..."&gt; para enlaces y listas. Si no usas HTML, escribe normal y envuelve cada párrafo en &lt;p&gt;…&lt;/p&gt;.</p>
      </div>

      <div class="flex flex-wrap gap-2 pt-2">
        <button
          type="submit"
          class="cms-btn-primary"
          disabled={saving}
        >
          {saving ? 'Guardando…' : (isCreate ? 'Crear página' : 'Guardar cambios')}
        </button>
        <button type="button" class="cms-btn-secondary" onclick={goBack}>
          Cancelar
        </button>
      </div>
    </form>
  {/if}
</div>
