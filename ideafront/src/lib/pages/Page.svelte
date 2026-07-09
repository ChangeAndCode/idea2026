<script>
  import { apiUrl, mediaUrl } from '../api.js';

  export let slug = '';
  let title = '';
  let body = '';
  let image = '';
  let loading = true;
  let notFound = false;

  async function load(s) {
    if (!s) return;
    loading = true;
    notFound = false;

    // 1) Intentar siempre primero el CMS (cms_pages)
    try {
      const res = await fetch(apiUrl(`/api/cms/pages/${encodeURIComponent(s)}`));
      if (res.ok) {
        const data = await res.json();
        title = data.title || '';
        body = data.body || '';
        image = data.image || '';
        loading = false;
        return;
      }
    } catch (e) {
      // si falla la llamada, probamos con estático
    }

    // 2) Si no existe en CMS, marcar como no encontrada
    notFound = true;
    loading = false;
  }
  $: load(slug || 'inicio');
  $: displayImage = image;
  $: displayImageSrc = displayImage ? mediaUrl(displayImage) : '';

</script>

{#if loading}
  <section class="min-h-[50vh] flex items-center justify-center bg-white py-16">
    <p class="text-slate-600">Cargando...</p>
  </section>
{:else if notFound}
  <section class="min-h-[50vh] flex items-center justify-center bg-white py-16">
    <p class="text-slate-600">Página no encontrada.</p>
  </section>
{:else}
  <section class="bg-white py-12 sm:py-16 px-8 sm:px-10 min-h-[calc(100vh-12rem)]">
    <!-- Contenedor azul: casi todo el ancho -->
    <div class="relative w-full rounded-2xl overflow-hidden bg-idea-dark px-10 py-12 sm:px-14 sm:py-16 shadow-xl">
      <!-- Título: contenedor separado, alineado a la izquierda -->
      <header class="mb-8 sm:mb-10">
        <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold text-white uppercase tracking-tight text-left">
          {title}
        </h1>
      </header>

      <!-- Contenido: flex en dos columnas - texto izquierda, imagen derecha (contenedores separados) -->
      <div class="flex flex-col md:flex-row md:items-start md:gap-12 lg:gap-16 pb-8 sm:pb-10 md:pb-12">
        <!-- Columna izquierda: solo texto (sin imagen embebida) -->
        <div class="flex-1 min-w-0 order-2 md:order-1 md:flex-[1_1_55%]">
          <div
            class="page-body prose prose-invert max-w-none text-white/95
            prose-p:text-white/95
            prose-strong:text-white
            prose-em:text-white/95
            prose-headings:text-white
            prose-headings:font-bold
            prose-h2:text-3xl
            prose-h2:mt-8
            prose-h2:mb-3
            prose-h3:text-2xl
            prose-h3:mt-6
            prose-h3:mb-2
            prose-h4:text-xl
            prose-h4:mt-5
            prose-h4:mb-2
            prose-h5:text-lg
            prose-h5:mt-4
            prose-h5:mb-2
            prose-a:text-white
            prose-a:underline
            prose-a:underline-offset-2
            hover:prose-a:text-idea-yellow
            prose-ul:text-white/95
            prose-ol:text-white/95
            prose-li:text-white/95
            prose-table:w-full
            prose-table:border-collapse
            prose-th:border
            prose-th:border-white/25
            prose-th:p-3
            prose-th:text-white
            prose-td:border
            prose-td:border-white/25
            prose-td:p-3
            prose-td:text-white/95"
          >
            {@html body || '<p>Sin contenido.</p>'}
          </div>
        </div>

        <!-- Columna derecha: contenedor de imagen separado -->
        {#if displayImageSrc}
          <div class="flex-shrink-0 order-1 md:order-2 w-full md:w-[28rem] lg:w-[34rem] xl:w-[40rem]">
            <div class="bg-white p-4 rounded-lg">
              <img src={displayImageSrc} alt="" class="w-full object-contain" />
            </div>
          </div>
        {/if}
      </div>
    </div>
  </section>
{/if}

<style>
  .page-body :global(mark) {
    background: #fee68a;
    color: #0f2f7a;
    padding: 0 0.15rem;
    border-radius: 0.2rem;
  }
</style>