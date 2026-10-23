<script>
  import { route } from '../stores/route.js';
  import { getPage, createPage, updatePage } from './api.js';
  import ImageUploadField from './ImageUploadField.svelte';
  import RichTextEditor from './RichTextEditor.svelte';

  let { slug = null } = $props();

  let title = $state('');
  let body = $state('');
  let image = $state('');
  let imageLink = $state('');
  let blocks = $state([]);
  let expandedBlockId = $state(null);
  let showBlockModal = $state(false);
  let slugInput = $state('');
  let loading = $state(true);
  let saving = $state(false);
  let error = $state('');

  const isCreate = $derived(slug === null);

  function isValidLink(value) {
    const link = String(value ?? '').trim();
    if (!link || link.startsWith('/')) return true;
    try {
      const url = new URL(link);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  }

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
      imageLink = p.imageLink ?? '';
      blocks = Array.isArray(p.blocks) ? p.blocks : [];
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  function goBack() {
    route.set({ path: 'list', slug: null });
  }

  function createBlock(type) {
    const id = crypto.randomUUID();
    if (type === 'text') return { id, type, content: '' };
    if (type === 'button') return { id, type, text: '', url: '', backgroundColor: '#FBBF24', textColor: '#0F2F7A', textSize: '16px', align: 'left' };
    if (type === 'image') return { id, type, src: '', alt: '', link: '', align: 'left', width: '500', caption: '', captionTextSize: '16px' };
    return { id, type, slides: [] };
  }

  function addBlock(type, index = blocks.length) {
    const block = createBlock(type);
    blocks = [...blocks.slice(0, index), block, ...blocks.slice(index)];
    expandedBlockId = block.id;
    showBlockModal = false;
  }

  function removeBlock(id) {
    blocks = blocks.filter((block) => block.id !== id);
    if (expandedBlockId === id) expandedBlockId = null;
  }

  function moveBlock(index, direction) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    blocks = next;
  }

  function blockLabel(block) {
    if (block.type === 'text') return 'Texto';
    if (block.type === 'button') return 'Botón';
    if (block.type === 'image') return 'Imagen';
    if (block.type === 'carousel') return 'Carrusel';
    return 'Elemento';
  }

  function blockSummary(block) {
    if (block.type === 'text') return block.content ? 'Contenido de texto' : 'Sin contenido';
    if (block.type === 'button') return block.text || 'Sin texto';
    if (block.type === 'image') return block.src || 'Sin imagen';
    return `${Array.isArray(block.slides) ? block.slides.length : 0} slide(s)`;
  }

  function addSlide(block) {
    block.slides = [
      ...(Array.isArray(block.slides) ? block.slides : []),
      { id: crypto.randomUUID(), image: '', alt: '', title: '', subtitle: '', link: '' }
    ];
  }

  function removeSlide(block, slideId) {
    block.slides = (block.slides ?? []).filter((slide) => slide.id !== slideId);
  }

  async function submit() {
    const t = title.trim();
    const b = body.trim();
    const img = image.trim();
    const imgLink = imageLink.trim();
    if (!t) {
      error = 'Escribe un título para la página.';
      return;
    }
    if (!isValidLink(imgLink)) {
      error = 'La URL de la imagen no es válida. Usa una URL http(s) o una ruta interna como /pagina/ejemplo.';
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
        await createPage({ slug: s, title: t, body: b, image: img, imageLink: imgLink, blocks });
      } else {
        await updatePage(slug, { title: t, body: b, image: img, imageLink: imgLink, blocks });
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

<div class="cms-card p-6 max-w-6xl mx-auto">
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
    <form
      onsubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      class="space-y-8"
    >
      <!-- Disposición en dos columnas en pantallas grandes: meta a la izquierda, contenido a la derecha -->
      <div class="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,2.2fr)]">
        <div class="space-y-6">
          <div class="border-b border-slate-200 pb-3">
            <p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Información básica
            </p>
          </div>

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
              <p class="text-sm text-slate-500 mt-1.5">
                Así se verá el enlace. Si pones <em>emprendimiento</em>, la página será:
                <code class="bg-slate-100 px-1 rounded text-xs">…/pagina/emprendimiento</code>. Usa solo
                letras minúsculas y guiones.
              </p>
            </div>
          {:else}
            <div>
              <p class="text-sm text-slate-500">
                Enlace de esta página:
                <code class="bg-slate-100 px-1.5 py-0.5 rounded">/pagina/{slug}</code>
                (no se puede cambiar al editar).
              </p>
            </div>
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
            <p class="text-sm text-slate-500 mt-1.5">
              Es lo que se ve en el menú y arriba de la página.
            </p>
          </div>

          <div>
            <ImageUploadField
              id="image"
              label="Logo / imagen"
              value={image}
              onChange={(v) => (image = v)}
            />
            <label for="image-link" class="cms-label mt-4 block">Enlace / URL (opcional)</label>
            <input
              id="image-link"
              type="text"
              class="cms-input mt-1"
              bind:value={imageLink}
              placeholder="https://ejemplo.com o /pagina/ejemplo"
            />
            <p class="text-sm text-slate-500 mt-1.5">
              Sube una imagen para mostrarla a la derecha del texto. Déjalo sin subir si no necesitas logo.
            </p>
          </div>
        </div>

        <div class="space-y-3">
          <div class="border-b border-slate-200 pb-3">
            <p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Contenido de la página
            </p>
          </div>
          <div class="flex items-center justify-between gap-3">
            <label class="cms-label mb-0">Contenido de la página</label>
            <button type="button" class="cms-btn-secondary !py-2" onclick={() => (showBlockModal = true)}>+ Agregar elemento</button>
          </div>

          {#if blocks.length === 0}
            <div class="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
              Aún no hay bloques. Puedes usar el editor existente o agregar un elemento con el botón anterior.
            </div>
            <RichTextEditor value={body} onChange={(html) => (body = html)} placeholder="<p>Escribe aquí el texto de la página...</p>" />
          {:else}
            <div class="space-y-3">
              {#each blocks as block, index (block.id)}
                <div class="rounded-lg border border-slate-200 bg-white shadow-sm">
                  <div class="flex items-center gap-2 px-4 py-3">
                    <button type="button" class="flex min-w-0 flex-1 items-center justify-between gap-3 text-left" onclick={() => (expandedBlockId = expandedBlockId === block.id ? null : block.id)}>
                      <span class="min-w-0"><strong class="text-slate-700">{blockLabel(block)}</strong><span class="ml-2 truncate text-sm text-slate-500">{blockSummary(block)}</span></span>
                      <span class="text-slate-500">{expandedBlockId === block.id ? '⌃' : '⌄'}</span>
                    </button>
                    <div class="flex shrink-0 items-center gap-1">
                      <button type="button" class="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-idea-dark disabled:opacity-30" aria-label="Subir bloque" title="Subir bloque" disabled={index === 0} onclick={(event) => { event.stopPropagation(); moveBlock(index, -1); }}>↑</button>
                      <button type="button" class="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-idea-dark disabled:opacity-30" aria-label="Bajar bloque" title="Bajar bloque" disabled={index === blocks.length - 1} onclick={(event) => { event.stopPropagation(); moveBlock(index, 1); }}>↓</button>
                      <button type="button" class="rounded p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-30" aria-label="Eliminar bloque" title="Eliminar bloque" onclick={(event) => { event.stopPropagation(); removeBlock(block.id); }}>🗑</button>
                    </div>
                  </div>

                  {#if expandedBlockId === block.id}
                    <div class="space-y-4 border-t border-slate-200 p-4">
                      {#if block.type === 'text'}
                        <RichTextEditor value={block.content} onChange={(html) => (block.content = html)} placeholder="<p>Escribe el contenido...</p>" />
                      {:else if block.type === 'button'}
                        <div class="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label class="cms-label" for={`button-text-${block.id}`}>Texto del botón</label>
                            <input id={`button-text-${block.id}`} class="cms-input" type="text" bind:value={block.text} placeholder="Ej: Ver más" />
                          </div>
                          <div>
                            <label class="cms-label" for={`button-url-${block.id}`}>Enlace / URL</label>
                            <input id={`button-url-${block.id}`} class="cms-input" type="text" bind:value={block.url} placeholder="https://ejemplo.com o /pagina/ejemplo" />
                          </div>
                          <div>
                            <label class="cms-label" for={`button-color-${block.id}`}>Color de fondo</label>
                            <input id={`button-color-${block.id}`} class="h-11 w-full cursor-pointer rounded-lg border border-slate-200 p-1" type="color" bind:value={block.backgroundColor} />
                          </div>
                          <div>
                            <label class="cms-label" for={`button-text-color-${block.id}`}>Color del texto</label>
                            <input id={`button-text-color-${block.id}`} class="h-11 w-full cursor-pointer rounded-lg border border-slate-200 p-1" type="color" bind:value={block.textColor} />
                          </div>
                          <div>
                            <label class="cms-label" for={`button-size-${block.id}`}>Tamaño del texto</label>
                            <select id={`button-size-${block.id}`} class="cms-input" bind:value={block.textSize}>
                              <option value="10px">10</option>
                              <option value="12px">12</option>
                              <option value="14px">14</option>
                              <option value="16px">16</option>
                              <option value="18px">18</option>
                              <option value="20px">20</option>
                              <option value="24px">24</option>
                            </select>
                          </div>
                          <div>
                            <label class="cms-label" for={`button-align-${block.id}`}>Alineación</label>
                            <select id={`button-align-${block.id}`} class="cms-input" bind:value={block.align}>
                              <option value="left">Izquierda</option>
                              <option value="center">Centro</option>
                              <option value="right">Derecha</option>
                            </select>
                          </div>
                        </div>
                        <p class="text-sm text-slate-500">Puedes usar una ruta interna como <code>/pagina/contacto</code> o una URL externa http(s).</p>
                      {:else if block.type === 'image'}
                        <ImageUploadField
                          id={`block-image-${block.id}`}
                          label="Imagen del bloque"
                          value={block.src}
                          onChange={(value) => (block.src = value)}
                        />
                        <div class="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label class="cms-label" for={`image-alt-${block.id}`}>Texto alternativo</label>
                            <input id={`image-alt-${block.id}`} class="cms-input" type="text" bind:value={block.alt} placeholder="Describe la imagen" />
                          </div>
                          <div>
                            <label class="cms-label" for={`image-link-${block.id}`}>Enlace / URL opcional</label>
                            <input id={`image-link-${block.id}`} class="cms-input" type="text" bind:value={block.link} placeholder="https://ejemplo.com o /pagina/ejemplo" />
                          </div>
                          <div>
                            <label class="cms-label" for={`image-align-${block.id}`}>Alineación</label>
                            <select id={`image-align-${block.id}`} class="cms-input" bind:value={block.align}>
                              <option value="left">Izquierda</option>
                              <option value="center">Centro</option>
                              <option value="right">Derecha</option>
                            </select>
                          </div>
                          <div>
                            <label class="cms-label" for={`image-width-${block.id}`}>Ancho de imagen</label>
                            <select id={`image-width-${block.id}`} class="cms-input" bind:value={block.width}>
                              <option value="200">200 px</option>
                              <option value="300">300 px</option>
                              <option value="400">400 px</option>
                              <option value="500">500 px</option>
                              <option value="600">600 px</option>
                              <option value="800">800 px</option>
                            </select>
                          </div>
                          <div class="sm:col-span-2">
                            <label class="cms-label" for={`image-caption-${block.id}`}>Texto descriptivo opcional</label>
                            <input id={`image-caption-${block.id}`} class="cms-input" type="text" bind:value={block.caption} placeholder="Texto que aparecerá debajo de la imagen" />
                          </div>
                          <div>
                            <label class="cms-label" for={`image-caption-size-${block.id}`}>Tamaño del texto descriptivo</label>
                            <select id={`image-caption-size-${block.id}`} class="cms-input" bind:value={block.captionTextSize}>
                              <option value="10px">10</option>
                              <option value="12px">12</option>
                              <option value="14px">14</option>
                              <option value="16px">16</option>
                              <option value="18px">18</option>
                              <option value="20px">20</option>
                              <option value="24px">24</option>
                            </select>
                          </div>
                        </div>
                        <p class="text-sm text-slate-500">Si agregas un enlace, al hacer clic en la imagen se abrirá esa dirección.</p>
                      {:else if block.type === 'carousel'}
                        <div class="flex items-center justify-between gap-3">
                          <div>
                            <p class="font-medium text-slate-700">Slides del carrusel</p>
                            <p class="text-sm text-slate-500">Agrega imágenes y configura sus textos y enlaces.</p>
                          </div>
                          <button type="button" class="cms-btn-secondary !py-2" onclick={() => addSlide(block)}>+ Agregar slide</button>
                        </div>
                        {#if block.slides?.length}
                          <div class="space-y-4">
                            {#each block.slides as slide, slideIndex (slide.id)}
                              <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                <div class="mb-3 flex items-center justify-between gap-3">
                                  <strong class="text-sm text-slate-700">Slide {slideIndex + 1}</strong>
                                  <button type="button" class="flex h-7 w-7 items-center justify-center rounded-full border border-red-200 bg-white text-lg leading-none text-red-600 hover:bg-red-50" aria-label="Eliminar slide" title="Eliminar slide" onclick={() => removeSlide(block, slide.id)}>×</button>
                                </div>
                                <div class="space-y-4">
                                  <ImageUploadField
                                    id={`slide-image-${slide.id}`}
                                    label="Imagen del slide"
                                    value={slide.image}
                                    onChange={(value) => (slide.image = value)}
                                  />
                                  <div class="grid gap-4 sm:grid-cols-2">
                                    <div>
                                      <label class="cms-label" for={`slide-title-${slide.id}`}>Título</label>
                                      <input id={`slide-title-${slide.id}`} class="cms-input" type="text" bind:value={slide.title} placeholder="Título opcional" />
                                    </div>
                                    <div>
                                      <label class="cms-label" for={`slide-alt-${slide.id}`}>Texto alternativo</label>
                                      <input id={`slide-alt-${slide.id}`} class="cms-input" type="text" bind:value={slide.alt} placeholder="Describe la imagen" />
                                    </div>
                                  </div>
                                  <div>
                                    <label class="cms-label" for={`slide-subtitle-${slide.id}`}>Descripción</label>
                                    <input id={`slide-subtitle-${slide.id}`} class="cms-input" type="text" bind:value={slide.subtitle} placeholder="Descripción opcional" />
                                  </div>
                                  <div>
                                    <label class="cms-label" for={`slide-link-${slide.id}`}>Enlace / URL opcional</label>
                                    <input id={`slide-link-${slide.id}`} class="cms-input" type="text" bind:value={slide.link} placeholder="https://ejemplo.com o /pagina/ejemplo" />
                                  </div>
                                </div>
                              </div>
                            {/each}
                          </div>
                        {:else}
                          <p class="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">Este carrusel todavía no tiene slides.</p>
                        {/if}
                      {:else}
                        <p class="text-sm text-slate-500">El formulario de {blockLabel(block).toLowerCase()} se agregará en el siguiente paso.</p>
                      {/if}
                    </div>
                  {/if}
                </div>
                <button type="button" class="w-full rounded-lg border border-dashed border-slate-300 py-2 text-sm text-slate-500 hover:border-idea-dark hover:text-idea-dark" onclick={() => (showBlockModal = true)}>+ Agregar elemento aquí</button>
              {/each}
            </div>
          {/if}

          <p class="text-sm text-slate-500">Los bloques se guardan junto con la página. El contenido antiguo permanece disponible para no romper páginas existentes.</p>
        </div>
      </div>

      <div class="flex flex-wrap gap-2 pt-4 border-t border-slate-200">
        <button type="submit" class="cms-btn-primary" disabled={saving}>
          {saving ? 'Guardando…' : (isCreate ? 'Crear página' : 'Guardar cambios')}
        </button>
        <button type="button" class="cms-btn-secondary" onclick={goBack}>
          Cancelar
        </button>
      </div>
    </form>
  {/if}
</div>

{#if showBlockModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" role="presentation" onclick={(event) => event.target === event.currentTarget && (showBlockModal = false)}>
    <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="block-modal-title">
      <div class="flex items-center justify-between gap-4">
        <h3 id="block-modal-title" class="text-lg font-semibold text-slate-800">Agregar elemento</h3>
        <button type="button" class="text-2xl text-slate-500" aria-label="Cerrar" onclick={() => (showBlockModal = false)}>×</button>
      </div>
      <p class="mt-2 text-sm text-slate-500">Selecciona el tipo de contenido que deseas agregar.</p>
      <div class="mt-5 grid gap-3 sm:grid-cols-2">
        {#each [['text', 'Texto'], ['button', 'Botón'], ['image', 'Imagen'], ['carousel', 'Carrusel']] as option}
          <button type="button" class="rounded-lg border border-slate-200 p-4 text-left font-medium text-slate-700 hover:border-idea-dark hover:bg-slate-50" onclick={() => addBlock(option[0])}>{option[1]}</button>
        {/each}
      </div>
    </div>
  </div>
{/if}
