<script>
  import { apiUrl, mediaUrl } from '../api.js';

  export let slug = '';
  let title = '';
  let body = '';
  let image = '';
  let imageLink = '';
  let loading = true;
  let notFound = false;
  let sectionTitle = '';
  let sectionLinks = [];

  /** Secciones del menú que no tienen página propia. Solo enlaza slugs que ya existen en el CMS. */
  const sectionPages = {
    capacitacion: { title: 'Capacitación', slugs: ['ences', 'mifam'] },
    'ferias-y-eventos': { title: 'Ferias y eventos', slugs: [] },
    'sector-industrial': { title: 'Sector industrial', slugs: [] },
    'apoyos-y-financiamientos': {
      title: 'Apoyos y financiamientos',
      slugs: ['fomech', 'impulso-municipal', 'proyectos-productivos'],
    },
  };

  /** Ruta pública anidada o alias → slug que ya existe en el CMS, sin modificar esos datos. */
  function lookupSlugs(raw) {
    const slug = decodeURIComponent(String(raw || '')).replace(/^\/+|\/+$/g, '');
    const candidates = [];
    const add = (value) => {
      if (value && !candidates.includes(value)) candidates.push(value);
    };
    add(slug);
    add(slug.toLowerCase());
    const last = slug.split('/').filter(Boolean).pop();
    add(last);
    add(last ? last.toLowerCase() : '');
    if (slug === 'vende-tu-proyecto' || last === 'vende-tu-proyecto') add('proyectos-productivos');
    return candidates;
  }

  async function load(s) {
    if (!s) return;
    loading = true;
    notFound = false;
    sectionTitle = '';
    sectionLinks = [];

    for (const candidate of lookupSlugs(s)) {
      try {
        const res = await fetch(apiUrl(`/api/cms/pages/${encodeURIComponent(candidate)}`));
        if (!res.ok) continue;
        const data = await res.json();
        title = data.title || '';
        body = data.body || '';
        image = data.image || '';
        imageLink = data.imageLink || '';
        loading = false;
        return;
      } catch (_) {
        /* probar el siguiente candidato */
      }
    }

    const key = decodeURIComponent(String(s || '')).replace(/^\/+|\/+$/g, '').toLowerCase();
    const section = sectionPages[key];
    if (section) {
      let pages = [];
      try {
        const res = await fetch(apiUrl('/api/cms/pages'));
        if (res.ok) pages = await res.json();
      } catch (_) {
        pages = [];
      }
      const bySlug = new Map((Array.isArray(pages) ? pages : []).map((page) => [page.slug, page]));
      sectionTitle = section.title;
      sectionLinks = section.slugs
        .filter((item) => bySlug.has(item))
        .map((item) => ({ slug: item, title: bySlug.get(item).title || item }));
      notFound = false;
      loading = false;
      return;
    }

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
{:else if sectionLinks.length > 0 || sectionTitle}
  <section class="bg-white py-12 sm:py-16 px-8 sm:px-10 min-h-[calc(100vh-12rem)]">
    <div class="w-full rounded-2xl bg-idea-dark px-10 py-12 sm:px-14 sm:py-16 shadow-xl text-white">
      <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-tight">{sectionTitle}</h1>
      {#if sectionLinks.length > 0}
        <ul class="mt-8 space-y-3">
          {#each sectionLinks as item}
            <li>
              <a href={`/pagina/${item.slug}`} class="text-lg underline underline-offset-2 hover:text-idea-yellow">{item.title}</a>
            </li>
          {/each}
        </ul>
      {:else}
        <p class="mt-8 text-white/80">Aún no hay páginas publicadas en esta sección.</p>
      {/if}
    </div>
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
              {#if imageLink}
                <a href={imageLink} aria-label="Abrir enlace de la imagen"><img src={displayImageSrc} alt="" class="w-full object-contain" /></a>
              {:else}
                <img src={displayImageSrc} alt="" class="w-full object-contain" />
              {/if}
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

  .page-body :global(img) {
    display: block;
    width: auto;
    max-width: min(100%, 42rem);
    height: auto;
    margin-top: 1rem;
    margin-bottom: 1rem;
    border-radius: 0.5rem;
  }

  .page-body :global(img[data-align='left']) {
    margin-left: 0;
    margin-right: auto;
  }

  .page-body :global(img[data-align='center']) {
    margin-left: auto;
    margin-right: auto;
  }

  .page-body :global(img[data-align='right']) {
    margin-left: auto;
    margin-right: 0;
  }
</style>
