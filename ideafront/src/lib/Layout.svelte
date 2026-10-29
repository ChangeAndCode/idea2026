<script>
  import { onMount } from 'svelte';
  import { page } from '../stores/router.js';
  import { apiUrl, mediaUrl } from './api.js';

  /** Cuando está definido (ej. en /bolsa con sesión Clerk), se muestra "Cerrar sesión" */
  /** component + slug para evitar @render y compatibilidad con el analizador */
  let { signOut = null, component = null, slug = '', notFound = false } = $props();

  let menuOpen = $state(false);

  /** Valores por defecto: se usan si la API falla o no devuelve datos. */
  const defaultNavItems = [
    { label: 'EMPRENDIMIENTO', path: '/pagina/emprendimiento' },
    { label: 'CAPACITACIÓN', path: '/pagina/capacitacion' },
    { label: 'FERIAS/EVENTOS', path: '/pagina/ferias-y-eventos' },
    { label: 'SECTOR INDUSTRIAL', path: '/pagina/sector-industrial' },
    { label: 'APOYOS/FINANCIAMIENTOS', path: '/pagina/apoyos-y-financiamientos' },
  ];
  const defaultLogoMunicipio = '/assets/logos/logo-municipio.png';
  const defaultLogoIdea = '/assets/logos/logo-idea.png';
  const defaultLogoChihuahua = '/assets/logos/chihuahua-capital.png';

  let navItems = $state(defaultNavItems);
  let logoMunicipio = $state(defaultLogoMunicipio);
  let logoIdea = $state(defaultLogoIdea);
  let logoChihuahua = $state(defaultLogoChihuahua);
  let logoMunicipioLink = $state('');
  let logoIdeaLink = $state('');
  let logoChihuahuaLink = $state('');

  onMount(async () => {
    try {
      const res = await fetch(apiUrl('/api/cms/site'));
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.navItems) && data.navItems.length > 0) {
        navItems = data.navItems;
      }
      if (data.logoMunicipio != null && data.logoMunicipio !== '') {
        logoMunicipio = data.logoMunicipio;
      }
      if (data.logoIdea != null && data.logoIdea !== '') {
        logoIdea = data.logoIdea;
      }
      if (data.logoChihuahua != null && data.logoChihuahua !== '') {
        logoChihuahua = data.logoChihuahua;
      }
      logoMunicipioLink = data.logoMunicipioLink ?? '';
      logoIdeaLink = data.logoIdeaLink ?? '';
      logoChihuahuaLink = data.logoChihuahuaLink ?? '';
    } catch (_) {
      /* Mantener valores por defecto si no hay backend o hay error de red */
    }
  });

  /** Submenús de la barra. Solo páginas que ya existen en el CMS. */
  const emprendimientoMenu = [
    { label: 'Incubadoras', path: '/pagina/incubadoras' },
    { label: 'Propiedad intelectual', path: '/pagina/propiedad-intelectual' },
    { label: 'Permisos y licencias', path: '/pagina/permisos-y-licencias' },
    { label: 'Branding', path: '/pagina/branding' },
  ];
  const capacitacionMenu = [
    { label: 'ENCES', path: '/pagina/ences' },
    { label: 'Mifam', path: '/pagina/mifam' },
  ];
  const apoyosMenu = [
    { label: 'Proyectos productivos', path: '/pagina/proyectos-productivos' },
    { label: 'FOMECH', path: '/pagina/fomech' },
    { label: 'Impulso municipal', path: '/pagina/impulso-municipal' },
  ];
  const sectorIndustrialMenu = [
    { label: 'Desarrollo de proveedores', path: '/pagina/desarrollo-de-proveedores' },
    { label: 'Clúster', path: '/pagina/cluster' },
    { label: 'Atracción de inversión', path: '/pagina/atraccion-de-inversion' },
  ];

  function submenuFor(item) {
    const label = String(item?.label || '').toLowerCase();
    const path = String(item?.path || '').toLowerCase();
    if (label.includes('emprendimiento') || path.includes('/pagina/emprendimiento')) return emprendimientoMenu;
    if (label.includes('capacit') || path.includes('/pagina/capacitacion')) return capacitacionMenu;
    if (label.includes('apoyo') || path.includes('/pagina/apoyos')) return apoyosMenu;
    if (label.includes('sector') || path.includes('/pagina/sector-industrial')) return sectorIndustrialMenu;
    return null;
  }

  function go(path) {
    page.goto(path);
    menuOpen = false;
  }

  function toggleMenu() {
    menuOpen = !menuOpen;
  }
</script>

<header class="relative z-30 bg-idea-dark text-white">
  <div class="flex justify-center items-center">
    <nav class="flex w-10/12 items-center justify-between px-4 py-4 sm:px-6">
      <div class="flex shrink-0 items-center gap-2 sm:gap-4">
        {#if logoMunicipioLink}<a href={logoMunicipioLink}><img src={mediaUrl(logoMunicipio)} alt="Gobierno Municipal Chihuahua" class="h-10 w-auto max-w-[90px] object-contain sm:h-12 sm:max-w-[120px]" /></a>{:else}<a href="/" onclick={(e) => { e.preventDefault(); go('/'); }}><img src={mediaUrl(logoMunicipio)} alt="Gobierno Municipal Chihuahua" class="h-10 w-auto max-w-[90px] object-contain sm:h-12 sm:max-w-[120px]" /></a>{/if}
        {#if logoIdeaLink}<a href={logoIdeaLink}><img src={mediaUrl(logoIdea)} alt="IDEA" class="hidden h-9 w-auto max-w-[100px] object-contain sm:block sm:h-10 sm:max-w-[120px]" /></a>{:else}<img src={mediaUrl(logoIdea)} alt="IDEA" class="hidden h-9 w-auto max-w-[100px] object-contain sm:block sm:h-10 sm:max-w-[120px]" />{/if}
        <div class="sm:hidden">
          <div class="font-semibold tracking-tight text-xs">Chihuahua</div>
          <div class="text-[9px] text-white/90 leading-tight">capital de trabajo y resultados</div>
        </div>
        {#if logoChihuahuaLink}<a href={logoChihuahuaLink}><img src={mediaUrl(logoChihuahua)} alt="Chihuahua capital de trabajo y resultados" class="h-8 w-auto max-w-[100px] object-contain sm:h-10 sm:max-w-[160px]" /></a>{:else}<img src={mediaUrl(logoChihuahua)} alt="Chihuahua capital de trabajo y resultados" class="h-8 w-auto max-w-[100px] object-contain sm:h-10 sm:max-w-[160px]" />{/if}
      </div>

      <!-- Escritorio: enlaces visibles -->
      <ul class="hidden items-center gap-4 md:flex md:gap-6">
        {#each navItems as item}
          <li class="relative group">
            {#if submenuFor(item)}
              <button
                type="button"
                class="text-sm font-normal uppercase tracking-wide text-white transition hover:opacity-90"
                aria-haspopup="true"
              >
                {item.label}
              </button>
              <ul class="absolute left-0 top-full z-50 hidden min-w-[16rem] bg-idea-navy py-2 shadow-lg group-hover:block group-focus-within:block">
                {#each submenuFor(item) as child}
                  <li>
                    <a
                      href={child.path}
                      class="block px-4 py-2 text-sm uppercase tracking-wide text-white transition hover:bg-white/10"
                      onclick={(e) => { e.preventDefault(); go(child.path); }}
                    >
                      {child.label}
                    </a>
                  </li>
                {/each}
              </ul>
            {:else}
              <a
                href={item.path}
                class="text-sm font-normal uppercase tracking-wide text-white transition hover:opacity-90"
                onclick={(e) => { e.preventDefault(); go(item.path); }}
              >
                {item.label}
              </a>
            {/if}
          </li>
        {/each}
        <li>
          <a
            href="/bolsa"
            class="text-sm font-normal uppercase tracking-wide text-white transition hover:opacity-90"
            onclick={(e) => { e.preventDefault(); go('/bolsa'); }}
          >
            Bolsa
          </a>
        </li>
        {#if signOut}
          <li>
            <button
              type="button"
              class="text-sm font-normal uppercase tracking-wide text-white/90 transition hover:opacity-90 hover:text-white"
              onclick={() => { signOut(); menuOpen = false; }}
            >
              Cerrar sesión
            </button>
          </li>
        {/if}
      </ul>

      <!-- Móvil: botón hamburguesa -->
      <button
        type="button"
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-white transition hover:bg-white/10 md:hidden"
        aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={menuOpen}
        onclick={toggleMenu}
      >
        {#if menuOpen}
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        {:else}
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        {/if}
      </button>
    </nav>
  </div>

  <!-- Móvil: menú desplegable -->
  <div
    class="absolute left-0 right-0 top-full z-50 bg-idea-dark shadow-lg transition md:hidden {menuOpen ? 'block' : 'hidden'}"
    role="dialog"
    aria-label="Menú de navegación"
  >
    <ul class="flex flex-col border-t border-white/10 px-4 py-4">
      {#each navItems as item}
        <li>
          {#if submenuFor(item)}
            <p class="pt-3 text-sm font-normal uppercase tracking-wide text-white">{item.label}</p>
            <ul class="pb-2">
              {#each submenuFor(item) as child}
                <li>
                  <a
                    href={child.path}
                    class="block py-2 pl-3 text-sm uppercase tracking-wide text-white/90 transition hover:text-white"
                    onclick={(e) => { e.preventDefault(); go(child.path); }}
                  >
                    {child.label}
                  </a>
                </li>
              {/each}
            </ul>
          {:else}
            <a
              href={item.path}
              class="block py-3 text-sm font-normal uppercase tracking-wide text-white transition hover:opacity-90"
              onclick={(e) => { e.preventDefault(); go(item.path); }}
            >
              {item.label}
            </a>
          {/if}
        </li>
      {/each}
      <li>
        <a
          href="/bolsa"
          class="block py-3 text-sm font-normal uppercase tracking-wide text-white transition hover:opacity-90"
          onclick={(e) => { e.preventDefault(); go('/bolsa'); }}
        >
          Bolsa
        </a>
      </li>
      {#if signOut}
        <li>
          <button
            type="button"
            class="block w-full py-3 text-left text-sm font-normal uppercase tracking-wide text-white/90 transition hover:opacity-90"
            onclick={() => { signOut(); menuOpen = false; }}
          >
            Cerrar sesión
          </button>
        </li>
      {/if}
    </ul>
  </div>
</header>

<main class="min-h-[calc(100vh-12rem)] pt-0">
  {#if component}
    {@const Comp = component}
    <Comp {slug} />
  {:else if notFound}
    <p class="p-8 text-center text-slate-500">Página no encontrada</p>
  {/if}
</main>

<footer class="bg-idea-navy py-12 text-white">
  <div class="mx-auto max-w-7xl px-4 text-center">
    <h3 class="text-xl font-semibold">Síguenos en nuestras redes</h3>
    <div class="mt-4 flex justify-center gap-4">
      <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" class="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white transition hover:bg-idea-dark hover:border-idea-dark" aria-label="Facebook">
        <img src="/assets/logos/Facebook.png" alt="" class="h-16 w-16 object-contain" />
      </a>
      <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" class="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white transition hover:bg-idea-dark hover:border-idea-dark" aria-label="Instagram">
        <img src="/assets/logos/Instagram.png" alt="" class="h-16 w-16 object-contain" />
      </a>
    </div>
  </div>
</footer>
