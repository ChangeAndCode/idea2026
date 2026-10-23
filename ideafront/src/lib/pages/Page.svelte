<script>
  import { onDestroy } from 'svelte';
  import { apiUrl, mediaUrl } from '../api.js';

  export let slug = '';
  let title = '';
  let body = '';
  let image = '';
  let imageLink = '';
  let blocks = [];
  let carouselIndexes = {};
  let carouselTimer;
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
        imageLink = data.imageLink || '';
        blocks = Array.isArray(data.blocks) ? data.blocks : [];
        carouselIndexes = {};
        startCarouselAutoplay();
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
  function imageSrc(src) { return src ? mediaUrl(src) : ''; }
  function currentSlideIndex(block) {
    const count = Array.isArray(block.slides) ? block.slides.length : 0;
    return count ? Math.min(carouselIndexes[block.id] ?? 0, count - 1) : 0;
  }
  function setSlide(block, index) {
    carouselIndexes = { ...carouselIndexes, [block.id]: index };
    blocks = [...blocks];
  }
  function changeSlide(block, direction) {
    const count = Array.isArray(block.slides) ? block.slides.length : 0;
    if (!count) return;
    setSlide(block, (currentSlideIndex(block) + direction + count) % count);
  }

  function startCarouselAutoplay() {
    if (carouselTimer) clearInterval(carouselTimer);
    carouselTimer = setInterval(() => {
      blocks.forEach((block) => {
        if (block.type === 'carousel' && Array.isArray(block.slides) && block.slides.length > 1) {
          changeSlide(block, 1);
        }
      });
    }, 10000);
  }

  function resetCarouselAutoplay() {
    startCarouselAutoplay();
  }

  onDestroy(() => {
    if (carouselTimer) clearInterval(carouselTimer);
  });

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
          {#if blocks.length}
            <div class="flex flex-col gap-8">
              {#each blocks as block (block.id)}
                {#if block.type === 'text'}
                  <div class="page-body prose prose-invert max-w-none text-white/95">{@html block.content || '<p>Sin contenido.</p>'}</div>
                {:else if block.type === 'button'}
                  <div class="flex" style={`justify-content: ${block.align || 'left'};`}>
                    <a href={block.url || '#'} class="inline-flex rounded-lg px-5 py-3 font-semibold hover:brightness-95" style={`background-color: ${block.backgroundColor || '#FBBF24'}; color: ${block.textColor || '#0F2F7A'}; font-size: ${block.textSize || '16px'};`}>{block.text || 'Ver más'}</a>
                  </div>
                {:else if block.type === 'image' && imageSrc(block.src)}
                  {@const imageAlign = block.align === 'center' ? 'mx-auto' : block.align === 'right' ? 'ml-auto' : 'mr-auto'}
                  <figure class={`flex w-full flex-col ${imageAlign}`} style={`max-width: ${block.width || '500'}px;`}>
                    {#if block.link}<a href={block.link}><img src={imageSrc(block.src)} alt={block.alt || ''} class="h-auto w-full rounded-lg object-contain" /></a>{:else}<img src={imageSrc(block.src)} alt={block.alt || ''} class="h-auto w-full rounded-lg object-contain" />{/if}
                    {#if block.caption}<figcaption class="mt-2 text-white/80" style={`font-size: ${block.captionTextSize || '16px'};`}>{block.caption}</figcaption>{/if}
                  </figure>
                {:else if block.type === 'carousel'}
                  {@const slides = block.slides ?? []}
                  {@const slide = slides[currentSlideIndex(block)]}
                  {#if slide}
                    <div class="relative rounded-lg bg-white p-4 text-idea-dark">
                      {#if imageSrc(slide.image)}
                        {#if slide.link}<a href={slide.link}><img src={imageSrc(slide.image)} alt={slide.alt || ''} class="mx-auto max-h-[28rem] w-full object-contain" /></a>{:else}<img src={imageSrc(slide.image)} alt={slide.alt || ''} class="mx-auto max-h-[28rem] w-full object-contain" />{/if}
                      {/if}
                      {#if slide.title}<h3 class="mt-3 text-xl font-bold">{slide.title}</h3>{/if}
                      {#if slide.subtitle}<p class="mt-1">{slide.subtitle}</p>{/if}
                      {#if slides.length > 1}
                        <button type="button" class="absolute left-4 top-1/2 z-10 rounded-full bg-idea-dark/80 px-3 py-2 text-xl text-white" aria-label="Slide anterior" on:click|stopPropagation={() => { changeSlide(block, -1); resetCarouselAutoplay(); }}>‹</button>
                        <button type="button" class="absolute right-4 top-1/2 z-10 rounded-full bg-idea-dark/80 px-3 py-2 text-xl text-white" aria-label="Siguiente slide" on:click|stopPropagation={() => { changeSlide(block, 1); resetCarouselAutoplay(); }}>›</button>
                        <div class="mt-4 flex justify-center gap-2" aria-label="Seleccionar slide">
                          {#each slides as item, index (item.id)}
                            <button type="button" class="h-2.5 w-2.5 rounded-full {index === currentSlideIndex(block) ? 'bg-idea-dark' : 'bg-slate-300'}" aria-label={`Ir al slide ${index + 1}`} on:click|stopPropagation={() => { setSlide(block, index); resetCarouselAutoplay(); }}></button>
                          {/each}
                        </div>
                      {/if}
                    </div>
                  {/if}
                {/if}
              {/each}
            </div>
          {:else}
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
          {/if}
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
