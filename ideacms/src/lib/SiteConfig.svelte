<script>
  import { route } from '../stores/route.js';
  import { getSiteConfig, updateSiteConfig } from './api.js';

  let navItems = $state([]);
  let logoMunicipio = $state('');
  let logoIdea = $state('');
  let logoChihuahua = $state('');
  let loading = $state(true);
  let saving = $state(false);
  let error = $state('');
  let message = $state('');

  async function load() {
    loading = true;
    error = '';
    message = '';
    try {
      const data = await getSiteConfig();
      navItems = Array.isArray(data.navItems) ? data.navItems.map((i) => ({ ...i })) : [];
      logoMunicipio = data.logoMunicipio ?? '';
      logoIdea = data.logoIdea ?? '';
      logoChihuahua = data.logoChihuahua ?? '';
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
    navItems = [...navItems, { label: '', path: '' }];
  }

  function removeNavItem(index) {
    navItems = navItems.filter((_, i) => i !== index);
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

  function setNavLabel(index, value) {
    navItems = navItems.map((it, i) => (i === index ? { ...it, label: value } : it));
  }

  function setNavPath(index, value) {
    navItems = navItems.map((it, i) => (i === index ? { ...it, path: value } : it));
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
              <input
                type="text"
                class="flex-1 min-w-[120px] cms-input !py-2 text-sm"
                placeholder="Texto del enlace (ej: EMPRENDIMIENTO)"
                value={item.label}
                oninput={(e) => setNavLabel(i, e.target.value)}
              />
              <input
                type="text"
                class="flex-1 min-w-[160px] cms-input !py-2 text-sm"
                placeholder="Ruta (ej: /pagina/emprendimiento)"
                value={item.path}
                oninput={(e) => setNavPath(i, e.target.value)}
              />
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
              </div>
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
        <p class="text-sm text-slate-500 mb-4">Si quieres cambiar las 3 imágenes de arriba del sitio, pega aquí la ruta de cada una (ej: /assets/logos/logo.png). Si dejas un cuadro vacío, se sigue usando la imagen actual.</p>
        <div class="space-y-3">
          <div>
            <label for="logo-municipio" class="cms-label">Logo 1 (Municipio)</label>
            <input
              id="logo-municipio"
              type="text"
              class="cms-input"
              placeholder="/assets/logos/logo-municipio.png"
              bind:value={logoMunicipio}
            />
          </div>
          <div>
            <label for="logo-idea" class="cms-label">Logo 2 (IDEA)</label>
            <input
              id="logo-idea"
              type="text"
              class="cms-input"
              placeholder="/assets/logos/logo-idea.png"
              bind:value={logoIdea}
            />
          </div>
          <div>
            <label for="logo-chihuahua" class="cms-label">Logo 3 (Chihuahua)</label>
            <input
              id="logo-chihuahua"
              type="text"
              class="cms-input"
              placeholder="/assets/logos/chihuahua-capital.png"
              bind:value={logoChihuahua}
            />
          </div>
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
