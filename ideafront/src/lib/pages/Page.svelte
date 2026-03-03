<script>
  import { apiUrl } from '../api.js';

  export let slug = '';
  let title = '';
  let body = '';
  let image = '';
  let loading = true;
  let notFound = false;

  /** Extrae la primera imagen del body y devuelve { imgSrc, bodyWithoutImg } */
  function extractImageFromBody(html) {
    if (!html || !html.includes('<img')) return { imgSrc: null, bodyWithoutImg: html };
    const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    const imgSrc = imgMatch ? imgMatch[1] : null;
    // Quita el primer bloque que contiene solo la imagen (p+strong+img o p+img)
    const bodyWithoutImg = html
      .replace(/<p[^>]*>\s*(?:<strong[^>]*>\s*)?<img[^>]*>(?:\s*<\/strong>)?\s*<\/p>/i, '')
      .replace(/<p[^>]*>\s*<img[^>]*>\s*<\/p>/i, '')
      .trim();
    return { imgSrc, bodyWithoutImg };
  }

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
  $: extracted = extractImageFromBody(body);
  $: imgSrc = extracted.imgSrc;
  $: bodyWithoutImg = extracted.bodyWithoutImg;
  $: displayImage = image || imgSrc;
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
            class="page-body text-white/95 text-base leading-relaxed prose prose-invert max-w-none prose-headings:text-white prose-headings:font-bold prose-headings:text-lg prose-p:text-white/95 prose-a:text-white prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-idea-yellow prose-strong:text-white prose-ul:text-white/95 prose-li:text-white/95 prose-ul:my-4 prose-li:my-1"
          >
            {@html bodyWithoutImg || body || '<p>Sin contenido.</p>'}
          </div>
        </div>

        <!-- Columna derecha: contenedor de imagen separado -->
        {#if displayImage}
          <div class="flex-shrink-0 order-1 md:order-2 w-full md:w-[28rem] lg:w-[34rem] xl:w-[40rem]">
            <div class="bg-white p-4 rounded-lg">
              <img src={displayImage} alt="" class="w-full object-contain" />
            </div>
          </div>
        {/if}
      </div>
    </div>
  </section>
{/if}

