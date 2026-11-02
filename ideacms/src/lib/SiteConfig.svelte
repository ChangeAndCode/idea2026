<script>
  import { route } from '../stores/route.js';
  import { getPages, getSiteConfig, updateSiteConfig } from './api.js';
  import ImageUploadField from './ImageUploadField.svelte';

  let navItems = $state([]);
  let pages = $state([]);
  let logoMunicipio = $state('');
  let logoIdea = $state('');
  let logoChihuahua = $state('');
  let logoMunicipioLink = $state('');
  let logoIdeaLink = $state('');
  let logoChihuahuaLink = $state('');
  let loading = $state(true);
  let saving = $state(false);
  let error = $state('');
  let message = $state('');
  let draggingChild = $state(null);
  let dragOverChild = $state(null);
  let expandedNavItems = $state([]);

  async function load() {
    loading = true;
    error = '';
    message = '';
    try {
      const data = await getSiteConfig();
      pages = await getPages();
      navItems = Array.isArray(data.navItems)
        ? data.navItems.map((i) => ({ ...i, children: Array.isArray(i.children) ? i.children.map((c) => ({ ...c })) : [] }))
        : [];
      logoMunicipio = data.logoMunicipio ?? '';
      logoIdea = data.logoIdea ?? '';
      logoChihuahua = data.logoChihuahua ?? '';
      logoMunicipioLink = data.logoMunicipioLink ?? '';
      logoIdeaLink = data.logoIdeaLink ?? '';
      logoChihuahuaLink = data.logoChihuahuaLink ?? '';
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  function goBack() {
    route.set({ path: 'list', slug: null });
  }

  function addNavItem() {
    navItems = [...navItems, { label: '', path: '', children: [] }];
  }

  function addChild(index) {
    navItems[index].children = [...(navItems[index].children || []), { label: '', path: '' }];
    navItems = [...navItems];
  }

  function removeChild(index, childIndex) {
    navItems[index].children = (navItems[index].children || []).filter((_, i) => i !== childIndex);
    navItems = [...navItems];
  }

  function setChild(index, childIndex, key, value) {
    navItems[index].children = (navItems[index].children || []).map((child, i) => i === childIndex ? { ...child, [key]: value } : child);
    navItems = [...navItems];
  }

  function startChildDrag(event, navIndex, childIndex) {
    draggingChild = { navIndex, childIndex };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function endChildDrag(event) {
    if (!draggingChild) return;
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-child-row]');
    if (target) {
      const navIndex = Number(target.dataset.navIndex);
      const childIndex = Number(target.dataset.childIndex);
      const { navIndex: fromNavIndex, childIndex: fromChildIndex } = draggingChild;
      if (navIndex === fromNavIndex && childIndex !== fromChildIndex) {
        const children = [...(navItems[navIndex].children || [])];
        const [moved] = children.splice(fromChildIndex, 1);
        children.splice(childIndex, 0, moved);
        navItems[navIndex].children = children;
        navItems = [...navItems];
      }
    }
    draggingChild = null;
    dragOverChild = null;
  }

  function moveOverChild(event, navIndex, childIndex) {
    if (!draggingChild || draggingChild.navIndex !== navIndex) return;
    dragOverChild = { navIndex, childIndex };
  }

  function leaveChildRow(navIndex, childIndex) {
    if (dragOverChild?.navIndex === navIndex && dragOverChild?.childIndex === childIndex) {
      dragOverChild = null;
    }
  }

  function removeNavItem(index) {
    navItems = navItems.filter((_, i) => i !== index);
    expandedNavItems = expandedNavItems.filter((i) => i !== index).map((i) => i > index ? i - 1 : i);
  }

  function toggleNavChildren(index) {
    expandedNavItems = expandedNavItems.includes(index)
      ? expandedNavItems.filter((i) => i !== index)
      : [...expandedNavItems, index];
  }

  function moveNavItem(index, delta) {
    const next = index + delta;
    if (next < 0 || next >= navItems.length) return;
    const arr = [...navItems];
    const t = arr[index];
    arr[index] = arr[next];
    arr[next] = t;
    navItems = arr;
  }

  function pagePath(page) {
    return `/pagina/${page.slug}`;
  }

  function selectNavPage(index, slug) {
    const selected = pages.find((page) => page.slug === slug);
    if (!selected) return;
    navItems = navItems.map((item, i) => i === index
      ? { ...item, label: selected.title, path: pagePath(selected) }
      : item);
  }

  function selectChildPage(index, childIndex, slug) {
    const selected = pages.find((page) => page.slug === slug);
    if (!selected) return;
    navItems[index].children = (navItems[index].children || []).map((child, i) => i === childIndex
      ? { ...child, label: selected.title, path: pagePath(selected) }
      : child);
    navItems = [...navItems];
  }

  function pageSlugFromPath(path) {
    const value = String(path ?? '').replace(/^\/pagina\//, '').replace(/\/$/, '');
    return value;
  }

  async function submit() {
    saving = true;
    error = '';
    message = '';
    try {
      await updateSiteConfig({
        navItems: navItems.filter((i) => (i.label ?? '').trim() || (i.path ?? '').trim()),
        logoMunicipio: logoMunicipio.trim(),
        logoIdea: logoIdea.trim(),
        logoChihuahua: logoChihuahua.trim(),
        logoMunicipioLink: logoMunicipioLink.trim(),
        logoIdeaLink: logoIdeaLink.trim(),
        logoChihuahuaLink: logoChihuahuaLink.trim(),
      });
      message = 'Listo. Los cambios ya se ven en el sitio.';
      setTimeout(() => { message = ''; }, 4000);
    } catch (e) {
      error = e.message;
    } finally {
      saving = false;
    }
  }

  $effect(() => {
    load();
  });
</script>

<div class="cms-card p-6">
  <button
    type="button"
    class="text-slate-600 hover:text-slate-800 font-medium text-sm mb-4 flex items-center gap-1"
    onclick={goBack}
  >
    ← Volver
  </button>

  <h2 class="text-lg font-semibold text-slate-800 mb-1">Menú y logos</h2>
  <p class="text-sm text-slate-500 mb-6">Aquí cambias los enlaces de la barra superior y las imágenes del encabezado del sitio.</p>

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
    <div class="space-y-4">
      <div class="h-8 rounded-lg bg-slate-100 animate-pulse w-1/2"></div>
      <div class="h-24 rounded-lg bg-slate-100 animate-pulse"></div>
      <div class="h-24 rounded-lg bg-slate-100 animate-pulse"></div>
    </div>
  {:else}
    <form onsubmit={(e) => { e.preventDefault(); submit(); }} class="space-y-8">
      <section class="p-5 rounded-xl bg-slate-50 border border-slate-200">
        <h3 class="font-semibold text-slate-800 mb-1">Enlaces del menú</h3>
        <p class="text-sm text-slate-500 mb-4">Cada fila es un botón del menú. <strong>Texto</strong> = lo que se ve. <strong>Ruta</strong> = a dónde lleva al hacer clic. Usa las flechas ↑↓ para cambiar el orden. El enlace «Bolsa» siempre aparece al final en el sitio.</p>
        <ul class="space-y-2">
          {#each navItems as item, i}
            <li class="flex flex-wrap items-center gap-2 p-3 rounded-lg bg-white border border-slate-200">
              <select
                class="flex-1 min-w-[120px] cms-input !py-2 text-sm"
                value={pageSlugFromPath(item.path)}
                onchange={(e) => selectNavPage(i, e.target.value)}
              >
                <option value="">Selecciona una página</option>
                {#each pages as page}
                  <option value={page.slug}>{page.title}</option>
                {/each}
              </select>
              <div class="flex gap-1 shrink-0">
                <button
                  type="button"
                  class="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Subir"
                  onclick={() => moveNavItem(i, -1)}
                  disabled={i === 0}
                >↑</button>
                <button
                  type="button"
                  class="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Bajar"
                  onclick={() => moveNavItem(i, 1)}
                  disabled={i === navItems.length - 1}
                >↓</button>
                <button
                  type="button"
                  class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Quitar este enlace"
                  onclick={() => removeNavItem(i)}
                >✕</button>
                <button
                  type="button"
                  class="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100"
                  title={expandedNavItems.includes(i) ? 'Ocultar opciones desplegables' : 'Mostrar opciones desplegables'}
                  aria-expanded={expandedNavItems.includes(i)}
                  onclick={() => toggleNavChildren(i)}
                >
                  {#if expandedNavItems.includes(i)}
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 4.2A10.8 10.8 0 0 1 12 4c5 0 8.7 4.1 10 8a11.8 11.8 0 0 1-3.2 5.1M6.2 6.2C4.5 7.7 3.3 9.8 2 12c1.3 3.9 5 8 10 8 1.2 0 2.3-.2 3.3-.6" />
                    </svg>
                  {:else}
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2 12s3.7-8 10-8 10 8 10 8-3.7 8-10 8S2 12 2 12Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  {/if}
                </button>
              </div>
              {#if expandedNavItems.includes(i)}
              <div class="w-full border-t border-slate-100 pt-3 mt-1 space-y-2">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Opciones desplegables</p>
                {#each item.children || [] as child, childIndex}
                  <div
                    class="flex flex-wrap items-center gap-2 rounded-lg border-2 pl-1 transition-colors {draggingChild?.navIndex === i && draggingChild?.childIndex === childIndex ? 'opacity-50 border-transparent' : dragOverChild?.navIndex === i && dragOverChild?.childIndex === childIndex ? 'border-idea-blue bg-blue-50' : 'border-transparent'}"
                    data-child-row
                    data-nav-index={i}
                    data-child-index={childIndex}
                    onpointermove={(e) => moveOverChild(e, i, childIndex)}
                    onpointerleave={() => leaveChildRow(i, childIndex)}
                  >
                    <button
                      type="button"
                      class="cursor-grab touch-none select-none px-1 text-slate-400 hover:text-slate-700 active:cursor-grabbing"
                      title="Arrastra para reordenar"
                      aria-label="Arrastra para reordenar"
                      onpointerdown={(e) => startChildDrag(e, i, childIndex)}
                      onpointerup={endChildDrag}
                    >⠿</button>
                    <select class="flex-1 min-w-[120px] cms-input !py-2 text-sm" value={pageSlugFromPath(child.path)} onchange={(e) => selectChildPage(i, childIndex, e.target.value)}>
                      <option value="">Selecciona una página</option>
                      {#each pages as page}
                        <option value={page.slug}>{page.title}</option>
                      {/each}
                    </select>
                    <button type="button" class="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Quitar opción" onclick={() => removeChild(i, childIndex)}>✕</button>
                  </div>
                {/each}
                <button type="button" class="cms-btn-secondary !py-1.5 !px-3 text-sm" onclick={() => addChild(i)}>+ Añadir opción</button>
              </div>
              {/if}
            </li>
          {/each}
        </ul>
        <button
          type="button"
          class="mt-3 cms-btn-secondary !py-2 !px-3 text-sm"
          onclick={addNavItem}
        >
          + Añadir enlace
        </button>
      </section>

      <section class="p-5 rounded-xl bg-slate-50 border border-slate-200">
        <h3 class="font-semibold text-slate-800 mb-1">Logos del encabezado</h3>
        <p class="text-sm text-slate-500 mb-4">
          Sube una imagen para cada logo del encabezado. Si no subes nada en un espacio, en el sitio se sigue usando la imagen por defecto.
        </p>
        <div class="space-y-6">
          <ImageUploadField
            id="logo-municipio"
            label="Logo 1 (Municipio)"
            value={logoMunicipio}
            onChange={(v) => (logoMunicipio = v)}
          />
          <input type="text" class="cms-input mt-2" placeholder="Enlace / URL (opcional)" bind:value={logoMunicipioLink} />
          <ImageUploadField
            id="logo-idea"
            label="Logo 2 (IDEA)"
            value={logoIdea}
            onChange={(v) => (logoIdea = v)}
          />
          <input type="text" class="cms-input mt-2" placeholder="Enlace / URL (opcional)" bind:value={logoIdeaLink} />
          <ImageUploadField
            id="logo-chihuahua"
            label="Logo 3 (Chihuahua)"
            value={logoChihuahua}
            onChange={(v) => (logoChihuahua = v)}
          />
          <input type="text" class="cms-input mt-2" placeholder="Enlace / URL (opcional)" bind:value={logoChihuahuaLink} />
        </div>
      </section>

      <div class="flex flex-wrap gap-2 pt-2">
        <button
          type="submit"
          class="cms-btn-primary"
          disabled={saving}
        >
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
        <button type="button" class="cms-btn-secondary" onclick={goBack}>
          Cancelar
        </button>
      </div>
    </form>
  {/if}
</div>
