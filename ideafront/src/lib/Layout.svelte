<script>
  import { onMount } from 'svelte';
  import { page } from '../stores/router.js';
  import { apiUrl, mediaUrl } from './api.js';

  /** Cuando está definido (ej. en /bolsa con sesión Clerk), se muestra "Cerrar sesión" */
  /** component + slug para evitar @render y compatibilidad con el analizador */
  let { signOut = null, component = null, slug = '', notFound = false } = $props();

  let menuOpen = $state(false);
  let openNavItem = $state(null);
  let openSubmenu = $state(null);

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
  let socialLinks = $state([]);
  let searchOptions = $state([]);

  function normalize(value) {
    return String(value ?? '').trim().toLowerCase();
  }

  function submenuFor(item) {
    const label = normalize(item.label);
    return (searchOptions[0]?.ComboBoxUserMatches ?? [])
      .filter((match) => normalize(match.ComboBoxMatchElementText) === label);
  }

  function headerItems() {
    const firstFilter = searchOptions[0];
    const matches = firstFilter?.ComboBoxUserMatches ?? [];
    if (matches.length === 0) return navItems;

    return matches.map((match) => ({
      label: match.ComboBoxMatchElementText,
      path: match.ComboBoxMatchElementUrl?.[0]?.ComboBoxThirdUrl || '#',
    }));
  }

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
      const searchRes = await fetch(apiUrl('/api/cms/search-combo'));
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        searchOptions = Array.isArray(searchData.options) ? searchData.options : [];
      }
      const socialRes = await fetch(apiUrl('/api/cms/social-links'));
      if (socialRes.ok) socialLinks = (await socialRes.json()).filter((item) => item.enabled !== false && item.url);
    } catch (_) {
      /* Mantener valores por defecto si no hay backend o hay error de red */
    }
  });

  function go(path) {
    page.goto(path);
    menuOpen = false;
  }

  function toggleMenu() {
    menuOpen = !menuOpen;
    if (!menuOpen) {
      openNavItem = null;
      openSubmenu = null;
    }
  }

  function toggleNavItem(index) {
    openNavItem = openNavItem === index ? null : index;
    openSubmenu = null;
  }

  function toggleSubmenu(key) {
    openSubmenu = openSubmenu === key ? null : key;
  }
</script>

<header class="relative z-30 bg-idea-dark text-white">
  <div class="flex justify-center items-center">
    <nav class="flex w-full max-w-7xl min-w-0 items-center justify-between px-2 py-4 sm:px-4">
      <div class="flex min-w-0 shrink items-center gap-1 sm:gap-2">
        {#if logoMunicipioLink}<a href={logoMunicipioLink}><img src={mediaUrl(logoMunicipio)} alt="Gobierno Municipal Chihuahua" class="h-10 w-auto max-w-[90px] object-contain sm:h-12 sm:max-w-[120px]" /></a>{:else}<a href="/" onclick={(e) => { e.preventDefault(); go('/'); }}><img src={mediaUrl(logoMunicipio)} alt="Gobierno Municipal Chihuahua" class="h-10 w-auto max-w-[90px] object-contain sm:h-12 sm:max-w-[120px]" /></a>{/if}
        {#if logoIdeaLink}<a href={logoIdeaLink}><img src={mediaUrl(logoIdea)} alt="IDEA" class="hidden h-9 w-auto max-w-[100px] object-contain sm:block sm:h-10 sm:max-w-[120px]" /></a>{:else}<img src={mediaUrl(logoIdea)} alt="IDEA" class="hidden h-9 w-auto max-w-[100px] object-contain sm:block sm:h-10 sm:max-w-[120px]" />{/if}
        <div class="sm:hidden">
          <div class="font-semibold tracking-tight text-xs">Chihuahua</div>
          <div class="text-[9px] text-white/90 leading-tight">capital de trabajo y resultados</div>
        </div>
        {#if logoChihuahuaLink}<a href={logoChihuahuaLink}><img src={mediaUrl(logoChihuahua)} alt="Chihuahua capital de trabajo y resultados" class="h-8 w-auto max-w-[100px] object-contain sm:h-10 sm:max-w-[160px]" /></a>{:else}<img src={mediaUrl(logoChihuahua)} alt="Chihuahua capital de trabajo y resultados" class="h-8 w-auto max-w-[100px] object-contain sm:h-10 sm:max-w-[160px]" />{/if}
      </div>

      <!-- Escritorio: enlaces visibles -->
      <ul class="hidden min-w-0 items-center justify-end gap-2 xl:flex xl:gap-2">
        {#each headerItems() as item, itemIndex}
          {@const submenu = submenuFor(item)}
          {@const openSubmenuLeft = itemIndex >= headerItems().length - 2}
          <li class="group relative">
            <a
              href={item.path}
              class="inline-flex max-w-[150px] items-center whitespace-normal rounded-md px-2 py-2 text-center text-sm font-normal uppercase leading-tight tracking-wide text-white transition hover:bg-white/10"
              onclick={(e) => { e.preventDefault(); go(item.path); }}
            >
              {item.label}
            </a>
            {#if submenu.length > 0}
              <div class="invisible absolute left-1/2 top-full z-50 w-72 -translate-x-1/2 pt-3 opacity-0 transition group-hover:visible group-hover:opacity-100">
                <div class="bg-idea-navy shadow-xl">
                  {#each submenu as second}
                    <div class="group/sub relative">
                      <a href={second.ComboBoxMatchElementUrl?.[0]?.ComboBoxThirdUrl || item.path} class="block px-5 py-4 text-sm uppercase text-white hover:bg-idea-dark" onclick={(e) => { e.preventDefault(); go(second.ComboBoxMatchElementUrl?.[0]?.ComboBoxThirdUrl || item.path); }}>
                        {second.ComboBoxMatchElementText}
                      </a>
                      {#if Array.isArray(second.ComboBoxMatchElementUrl) && second.ComboBoxMatchElementUrl.length > 0}
                        <div class="invisible absolute top-0 w-72 opacity-0 transition group-hover/sub:visible group-hover/sub:opacity-100 {openSubmenuLeft ? 'right-full' : 'left-full'}">
                          <div class="bg-idea-navy shadow-xl">
                            {#each second.ComboBoxMatchElementUrl as third}
                              <a href={third.ComboBoxThirdUrl} class="block px-5 py-4 text-sm text-white hover:bg-idea-dark" onclick={(e) => { e.preventDefault(); go(third.ComboBoxThirdUrl); }}>
                                {third.ComboBoxThirdText}
                              </a>
                            {/each}
                          </div>
                        </div>
                      {/if}
                    </div>
                  {/each}
                </div>
              </div>
            {/if}
          </li>
        {/each}
        <li>
          <a
            href="/bolsa"
            class="inline-flex max-w-[150px] items-center whitespace-normal rounded-md px-2 py-2 text-center text-sm font-normal uppercase leading-tight tracking-wide text-white transition hover:bg-white/10"
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
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-white transition hover:bg-white/10 xl:hidden"
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
    class="absolute left-0 right-0 top-full z-50 bg-idea-dark shadow-lg transition xl:hidden {menuOpen ? 'block' : 'hidden'}"
    role="dialog"
    aria-label="Menú de navegación"
  >
    <ul class="flex flex-col border-t border-white/10 px-4 py-4">
      {#each headerItems() as item, itemIndex}
        {@const submenu = submenuFor(item)}
        <li>
          {#if submenu.length > 0}
            <button type="button" class="flex w-full items-center justify-between rounded-md py-3 px-2 text-left text-sm font-normal uppercase tracking-wide text-white transition hover:bg-black/15" aria-expanded={openNavItem === itemIndex} onclick={() => toggleNavItem(itemIndex)}>
              <span>{item.label}</span>
              <span aria-hidden="true">{openNavItem === itemIndex ? '−' : '+'}</span>
            </button>
          {:else}
            <a href={item.path} class="block rounded-md py-3 px-2 text-sm font-normal uppercase tracking-wide text-white transition hover:bg-black/15" onclick={(e) => { e.preventDefault(); go(item.path); }}>
              {item.label}
            </a>
          {/if}
          {#if submenu.length > 0}
            {#if openNavItem === itemIndex}
              <div class="ml-4 border-l border-white/20 pl-3">
                {#each submenu as second, secondIndex}
                  {@const submenuKey = `${itemIndex}-${secondIndex}`}
                  <button type="button" class="flex w-full items-center justify-between rounded-md py-2 px-2 text-left text-sm uppercase text-white/80 transition hover:bg-black/15" aria-expanded={openSubmenu === submenuKey} onclick={() => toggleSubmenu(submenuKey)}>
                    <span>{second.ComboBoxMatchElementText}</span>
                    <span aria-hidden="true">{openSubmenu === submenuKey ? '−' : '+'}</span>
                  </button>
                  {#if openSubmenu === submenuKey}
                    <div class="ml-3 border-l border-white/10 pl-3">
                      {#each second.ComboBoxMatchElementUrl ?? [] as third}
                        <a href={third.ComboBoxThirdUrl} class="block rounded-md py-2 px-2 text-sm text-white/90 transition hover:bg-black/15" onclick={(e) => { e.preventDefault(); go(third.ComboBoxThirdUrl); }}>
                          {third.ComboBoxThirdText}
                        </a>
                      {/each}
                    </div>
                  {/if}
                {/each}
              </div>
            {/if}
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
    {#if socialLinks.length > 0}<div class="mt-4 flex justify-center gap-4">{#each socialLinks as social}<a href={social.url} target="_blank" rel="noopener noreferrer" class="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white transition hover:bg-idea-dark hover:border-idea-dark" aria-label={social.label}><img src={social.icon} alt={social.label} class="h-16 w-16 object-contain" /></a>{/each}</div>{/if}
  </div>
</footer>
