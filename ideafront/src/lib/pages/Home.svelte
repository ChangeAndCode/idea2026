<script>
  import { onMount } from 'svelte';
  import { page } from '../../stores/router.js';

  function go(path) {
    page.goto(path);
  }

  let carouselIndex = 1;

  /** Landing: valores por defecto (si la API falla o no devuelve landing). */
  const defaultLanding = {
    heroTitle: '¡Bienvenido a tu nueva forma de conectar con Chihuahua!',
    heroSubtitle: 'Descubre eventos únicos y encuentra la chamba ideal con la ayuda de Chambabot, tu asistente inteligente.',
    heroMascotImg: '/assets/mascota/chambabot.png',
    heroCtaText: 'Buscador de empleo',
    headlineText: 'Lo que pasa en Chihuahua,\nempieza aquí.',
    carouselSlides: [
      { type: 'image', img: '/assets/banners/promo-kolau.jpeg', alt: 'Sitio WEB GRATIS - Kolau', title: 'Sitio WEB GRATIS', subtitle: 'Con botón de pago' },
      { type: 'info', text: 'Conecta con experiencias, ideas y herramientas que pueden cambiar tu forma de ver la ciudad y la tecnología.', cta: 'Descubre más', sub: 'CURSOS, TALLERES Y CAPACITACIONES A EMPRENDEDORES CHIHUAHUENSES' },
      { type: 'image', img: '/assets/contenido/banner-fomech.jpeg', alt: 'FOMECH', title: 'FOMECH', subtitle: '¿Cuentas con una MiPyMe y buscas capital para crecer?' },
    ],
    ciudadHablaTitle: 'La ciudad habla.\n¿Ya la escuchaste?',
    ciudadHablaCards: [
      { title: 'Marketing digital y WhatsApp Web', text: 'Forma parte del nuevo taller "Marketing Digital y WhatsApp Business" de Municipio; a través de este taller, las y los participantes aprenderán a utilizar la aplicación de WhatsApp para crear estrategias de marketing efectivas.', img: '/assets/contenido/capital-virtual.png', imgAlt: 'Capital Virtual', buttonText: 'Leer más', imageOnLeft: true },
      { title: 'Coppel Emprende', text: 'Forma parte del nuevo taller "Marketing Digital y WhatsApp Business" de Municipio; a través de este taller, las y los participantes aprenderán a utilizar la aplicación de WhatsApp para crear estrategias de marketing efectivas.', img: '/assets/contenido/coppel-personas.jpg', imgAlt: 'Coppel Emprende', buttonText: 'Leer más', imageOnLeft: false },
      { title: 'Adquiere un crédito FOMECH', text: 'Forma parte del nuevo taller "Marketing Digital y WhatsApp Business" de Municipio; a través de este taller, las y los participantes aprenderán a utilizar la aplicación de WhatsApp para crear estrategias de marketing efectivas.', img: '/assets/contenido/banner-fomech.jpeg', imgAlt: 'FOMECH', buttonText: 'Leer más', imageOnLeft: true },
    ],
    buscasAtencionTitle: '¿Buscas atención?\nAquí nos encuentras',
    locations: [
      { name: 'MIFAM Porvenir', address: 'Mina Dolores & Mina Los Reyes, Porvenir, Rio Sacramento Nte, 31137 Chihuahua, Chih.' },
      { name: 'MIFAM Riberas del Sacramento', address: 'C. Río Amur esquina con Río Paraná, Chihuahua, Chih.' },
      { name: 'MIFAM Dale', address: 'C. Trigésimo Sexta 3402, Dale, RUTA SUR II, 31050 Chihuahua, Chih.' },
      { name: 'MIFAM Unidad Vallarta', address: '31120, Manuel González Cossío 7300, Nacional, Chihuahua, Chih.' },
    ],
    heroLogos: [
      { src: '/assets/logos/escudo-municipio.png', alt: 'Escudo Municipio' },
      { src: '/assets/logos/logo-chihuahua-trabajo.png', alt: 'Chihuahua capital de trabajo y resultados' },
      { src: '/assets/logos/logo-idea.png', alt: 'IDEA' },
      { src: '/assets/logos/chihuahua-capital.png', alt: 'Chihuahua CAPITAL' },
    ],
  };
  let heroTitle = defaultLanding.heroTitle;
  let heroSubtitle = defaultLanding.heroSubtitle;
  let heroMascotImg = defaultLanding.heroMascotImg;
  let heroCtaText = defaultLanding.heroCtaText;
  let headlineText = defaultLanding.headlineText;
  let carouselSlides = defaultLanding.carouselSlides;
  let ciudadHablaTitle = defaultLanding.ciudadHablaTitle;
  let ciudadHablaCards = defaultLanding.ciudadHablaCards;
  let buscasAtencionTitle = defaultLanding.buscasAtencionTitle;
  let locations = defaultLanding.locations;
  let heroLogos = defaultLanding.heroLogos;

  onMount(async () => {
    try {
      const res = await fetch('/api/cms/site');
      if (!res.ok) return;
      const data = await res.json();
      const L = data.landing;
      if (L && typeof L === 'object') {
        if (L.heroTitle != null && L.heroTitle !== '') heroTitle = L.heroTitle;
        if (L.heroSubtitle != null && L.heroSubtitle !== '') heroSubtitle = L.heroSubtitle;
        if (L.heroMascotImg != null && L.heroMascotImg !== '') heroMascotImg = L.heroMascotImg;
        if (L.heroCtaText != null && L.heroCtaText !== '') heroCtaText = L.heroCtaText;
        if (L.headlineText != null && L.headlineText !== '') headlineText = L.headlineText;
        if (Array.isArray(L.carouselSlides) && L.carouselSlides.length > 0) carouselSlides = L.carouselSlides;
        if (L.ciudadHablaTitle != null && L.ciudadHablaTitle !== '') ciudadHablaTitle = L.ciudadHablaTitle;
        if (Array.isArray(L.ciudadHablaCards) && L.ciudadHablaCards.length > 0) ciudadHablaCards = L.ciudadHablaCards;
        if (L.buscasAtencionTitle != null && L.buscasAtencionTitle !== '') buscasAtencionTitle = L.buscasAtencionTitle;
        if (Array.isArray(L.locations) && L.locations.length > 0) locations = L.locations;
        if (Array.isArray(L.heroLogos) && L.heroLogos.length > 0) heroLogos = L.heroLogos;
      }
    } catch (_) {
      /* mantener defaultLanding */
    }
  });

  // Search combo desde API (MongoDB)
  let searchCombo = { labels: {}, defaultText: 'Seleccione una opción', options: [] };
  let searchComboLoading = true;
  let searchComboError = '';
  let selectedQuien = '';
  let selectedQueBuscas = '';
  let selectedRespuesta = '';

  $: childOptions = selectedQuien
    ? (searchCombo.options.find((o) => o.ComboBoxUserName === selectedQuien)?.ComboBoxUserMatches ?? [])
    : [];
  $: grandchildOptions = selectedQuien && selectedQueBuscas
    ? (childOptions.find((m) => m.ComboBoxMatchElementText === selectedQueBuscas)?.ComboBoxMatchElementUrl ?? [])
    : [];
  $: selectedUrl = grandchildOptions.find((u) => u.ComboBoxThirdText === selectedRespuesta)?.ComboBoxThirdUrl ?? '';

  async function loadSearchCombo() {
    searchComboLoading = true;
    searchComboError = '';
    try {
      const res = await fetch('/api/search-combo');
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        searchComboError = data.error || (res.status === 404 ? 'Ejecuta en ideabackend: npm run seed:search-combo' : 'Error al cargar opciones');
        return;
      }
      searchCombo = { labels: data.labels ?? {}, defaultText: data.defaultText ?? 'Seleccione una opción', options: data.options ?? [] };
    } catch (e) {
      searchComboError = e.message || 'No se pudieron cargar las opciones. ¿Está el backend en marcha (puerto 4000)?';
      searchCombo = { labels: {}, defaultText: 'Seleccione una opción', options: [] };
    } finally {
      searchComboLoading = false;
    }
  }

  function onQuienChange() {
    selectedQueBuscas = '';
    selectedRespuesta = '';
  }
  function onQueBuscasChange() {
    selectedRespuesta = '';
  }
  function goToSelected() {
    if (selectedUrl) go(selectedUrl);
  }

  // Móvil: flujo por pasos; avanza solo al seleccionar
  let searchStep = 0;
  function searchStepPrev() {
    if (searchStep > 0) searchStep -= 1;
  }
  function onQuienChangeMobile() {
    onQuienChange();
    if (selectedQuien) searchStep = 1;
  }
  function onQueBuscasChangeMobile() {
    onQueBuscasChange();
    if (selectedQueBuscas) searchStep = 2;
  }

  loadSearchCombo();

</script>

<!-- Hero: azul pegado a la nav, sin espacio blanco -->
<section class="relative -mt-1 overflow-hidden bg-idea-dark pt-4 pb-12 text-white shadow-[0_12px_40px_-8px_rgba(0,0,0,0.25)] sm:pt-6 sm:pb-14">
  <!-- Barra de búsqueda (responsiva en todos los tamaños) -->
  <div class="relative z-10 mx-auto mb-6 w-full max-w-7xl px-5 sm:px-8 md:px-10">
    <div class="rounded-2xl bg-[#4471C4] px-5 py-3 shadow-[0_6px_24px_rgba(0,0,0,0.35)] sm:rounded-full sm:px-6 sm:py-3 md:px-8 lg:px-8">
      {#if searchComboError}
        <p class="text-sm text-amber-200">{searchComboError}</p>
      {:else}
        <!-- Móvil y tablet: mismo flujo por pasos -->
        <div class="lg:hidden">
          {#if searchStep === 0}
            <div class="space-y-3">
              <label for="dropdown-quien-m" class="block text-sm font-medium text-white"><span class="text-white/60">1.</span> {searchCombo.labels.combo1 ?? '¿Quién eres?'}</label>
              <select
                id="dropdown-quien-m"
                bind:value={selectedQuien}
                on:change={onQuienChangeMobile}
                disabled={searchComboLoading}
                class="search-select w-full rounded-md border-0 bg-white px-3 py-2.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-idea-bright/40 disabled:!bg-white disabled:opacity-70"
              >
                <option value="">{searchCombo.defaultText}</option>
                {#each searchCombo.options as opt}
                  <option value={opt.ComboBoxUserName}>{opt.ComboBoxUserName}</option>
                {/each}
              </select>
            </div>
          {:else if searchStep === 1}
            <div class="space-y-3">
              <label for="dropdown-que-m" class="block text-sm font-medium text-white"><span class="text-white/60">2.</span> {searchCombo.labels.combo2 ?? '¿Qué buscas?'}</label>
              <select
                id="dropdown-que-m"
                bind:value={selectedQueBuscas}
                on:change={onQueBuscasChangeMobile}
                disabled={searchComboLoading || !selectedQuien}
                class="search-select w-full rounded-md border-0 bg-white px-3 py-2.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-idea-bright/40 disabled:!bg-white disabled:opacity-70"
              >
                <option value="">{searchCombo.defaultText}</option>
                {#each childOptions as m}
                  <option value={m.ComboBoxMatchElementText}>{m.ComboBoxMatchElementText}</option>
                {/each}
              </select>
              <button type="button" on:click={searchStepPrev} class="mt-3 flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-lg border border-white/40 bg-white/10 py-2.5 text-sm font-medium text-white active:bg-white/20">← Atrás</button>
            </div>
          {:else}
            <div class="space-y-3">
              <label for="dropdown-respuesta-m" class="block text-sm font-medium text-white"><span class="text-white/60">3.</span> {searchCombo.labels.combo3 ?? 'Respuestas disponibles'}</label>
              <select
                id="dropdown-respuesta-m"
                bind:value={selectedRespuesta}
                disabled={searchComboLoading || !selectedQueBuscas}
                class="search-select w-full rounded-md border-0 bg-white px-3 py-2.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-idea-bright/40 disabled:!bg-white disabled:opacity-70"
              >
                <option value="">{searchCombo.defaultText}</option>
                {#each grandchildOptions as u}
                  <option value={u.ComboBoxThirdText}>{u.ComboBoxThirdText}</option>
                {/each}
              </select>
              <div class="mt-3 flex gap-2">
                <button type="button" on:click={searchStepPrev} class="flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/40 bg-white/10 py-2.5 text-sm font-medium text-white active:bg-white/20">← Atrás</button>
                <button type="button" on:click={goToSelected} disabled={!selectedRespuesta} class="flex min-h-[44px] flex-1 items-center justify-center rounded-md bg-idea-bright py-2.5 text-sm font-medium text-white disabled:opacity-50">Ir</button>
              </div>
            </div>
          {/if}
        </div>

        <!-- Desktop (lg+): label arriba, select abajo para verse ordenado en compus pequeñas -->
        <div class="hidden lg:flex lg:flex-wrap lg:items-end lg:justify-center lg:gap-x-6 lg:gap-y-4">
          <div class="flex min-w-[140px] flex-1 flex-col gap-1.5">
            <label for="dropdown-quien" class="text-xs font-medium text-white">{searchCombo.labels.combo1 ?? '¿Quién eres?'}</label>
            <select
              id="dropdown-quien"
              bind:value={selectedQuien}
              on:change={onQuienChange}
              disabled={searchComboLoading}
              class="search-select w-full min-w-0 rounded-md border-0 bg-white px-2 py-1.5 text-sm text-slate-600 focus:outline-none focus:ring-1 focus:ring-idea-bright/40 disabled:!bg-white disabled:!text-slate-500 disabled:opacity-80"
            >
              <option value="">{searchCombo.defaultText}</option>
              {#each searchCombo.options as opt}
                <option value={opt.ComboBoxUserName}>{opt.ComboBoxUserName}</option>
              {/each}
            </select>
          </div>
          <div class="flex min-w-[140px] flex-1 flex-col gap-1.5">
            <label for="dropdown-que" class="text-xs font-medium text-white">{searchCombo.labels.combo2 ?? '¿Qué buscas?'}</label>
            <select
              id="dropdown-que"
              bind:value={selectedQueBuscas}
              on:change={onQueBuscasChange}
              disabled={searchComboLoading || !selectedQuien}
              class="search-select w-full min-w-0 rounded-md border-0 bg-white px-2 py-1.5 text-sm text-slate-600 focus:outline-none focus:ring-1 focus:ring-idea-bright/40 disabled:!bg-white disabled:!text-slate-500 disabled:opacity-80"
            >
              <option value="">{searchCombo.defaultText}</option>
              {#each childOptions as m}
                <option value={m.ComboBoxMatchElementText}>{m.ComboBoxMatchElementText}</option>
              {/each}
            </select>
          </div>
          <div class="flex min-w-[140px] flex-1 flex-col gap-1.5">
            <label for="dropdown-respuesta" class="text-xs font-medium text-white">{searchCombo.labels.combo3 ?? 'Respuestas disponibles'}</label>
            <select
              id="dropdown-respuesta"
              bind:value={selectedRespuesta}
              disabled={searchComboLoading || !selectedQueBuscas}
              class="search-select w-full min-w-0 rounded-md border-0 bg-white px-2 py-1.5 text-sm text-slate-600 focus:outline-none focus:ring-1 focus:ring-idea-bright/40 disabled:!bg-white disabled:!text-slate-500 disabled:opacity-80"
            >
              <option value="">{searchCombo.defaultText}</option>
              {#each grandchildOptions as u}
                <option value={u.ComboBoxThirdText}>{u.ComboBoxThirdText}</option>
              {/each}
            </select>
          </div>
          <button
            type="button"
            on:click={goToSelected}
            class="flex h-8 min-w-[5rem] shrink-0 items-center justify-center self-end rounded-md bg-idea-bright px-4 py-1.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!selectedRespuesta}
          >
            Ir
          </button>
        </div>
      {/if}
    </div>
  </div>

  <div class="mx-auto max-w-7xl flex flex-col px-5 sm:px-6 md:px-8">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between md:gap-16">
      <div class="max-w-2xl text-left md:pt-4">
        <h1 class="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl lg:text-[2.75rem]">
          {heroTitle}
        </h1>
        <p class="mt-5 text-lg text-white/95 sm:text-xl md:text-xl">
          {heroSubtitle}
        </p>
      </div>
      <div class="mt-8 flex justify-center md:mt-0 md:flex-shrink-0 md:justify-end">
        <img
          src={heroMascotImg}
          alt="Chambabot, asistente inteligente"
          class="h-64 w-auto max-w-[18rem] rounded-xl object-contain sm:h-72 sm:max-w-[22rem] md:h-[22rem] md:max-w-[28rem] lg:h-[28rem] lg:max-w-[34rem]"
        />
      </div>
    </div>
    <div class="flex justify-center pt-2 md:pt-12">
      <a
        href="/bolsa"
        on:click|preventDefault={() => go('/bolsa')}
        class="relative z-20 inline-block rounded-xl bg-idea-bright px-10 py-4 text-base font-semibold uppercase tracking-wide text-white shadow-lg transition hover:scale-105 hover:bg-[#0066CC] sm:px-12 sm:py-4 sm:text-lg -mb-1 md:-mb-10"
      >
        {heroCtaText}
      </a>
    </div>
  </div>

  <!-- Curva inferior del banner: solo blanco, más pronunciada -->
  <div class="absolute bottom-0 left-0 right-0 h-28 w-full pointer-events-none md:h-32" aria-hidden="true">
    <svg class="absolute bottom-0 left-0 block h-full w-full text-white md:hidden" viewBox="0 0 1440 100" fill="currentColor" preserveAspectRatio="none">
      <path d="M0 0 Q720 88 1440 0 L1440 100 L0 100 Z" />
    </svg>
    <svg class="absolute bottom-0 left-0 hidden h-full w-full text-white md:block" viewBox="0 0 1440 100" fill="currentColor" preserveAspectRatio="none">
      <path d="M0 0 Q720 128 1440 0 L1440 100 L0 100 Z" />
    </svg>
  </div>
</section>

<!-- Espacio blanco bajo el hero -->
<div class="relative z-0 h-10 bg-white sm:h-12" aria-hidden="true"></div>

<!-- Logos: grandes, ocupan casi todo el ancho (desde CMS) -->
<section class="bg-white py-16 sm:py-20">
  <div class="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-12 gap-y-8 px-4 md:gap-x-16 md:px-6">
    {#each heroLogos as logo}
      {#if logo.src}
        <img src={logo.src} alt={logo.alt || 'Logo'} class="h-32 w-auto flex-1 min-w-0 max-w-[280px] object-contain sm:h-36 sm:max-w-[320px] md:h-40 md:max-w-[360px]" />
      {/if}
    {/each}
  </div>
</section>

<!-- Headline -->
<section class="bg-white pb-8 pt-4">
  <h2 class="mx-auto max-w-4xl px-4 text-center text-4xl font-bold uppercase tracking-tight text-idea-navy md:text-3xl whitespace-pre-line">
    {headlineText}
  </h2>
</section>

<!-- Carrusel: en móvil una tarjeta a la vez; en desktop las 3 con centro grande -->
<section class="bg-white px-4 pb-16 pt-2 sm:px-5 md:px-6">
  <div class="mx-auto max-w-7xl">
    <!-- Móvil: una tarjeta a la vez, deslizante -->
    <div class="overflow-hidden py-6 md:hidden">
      <div class="flex transition-transform duration-300 ease-out" style="width: {carouselSlides.length * 100}%; transform: translateX(-{carouselIndex * (100 / carouselSlides.length)}%);">
        {#each carouselSlides as slide, i}
          <div
            role="button"
            tabindex="0"
            class="group flex flex-shrink-0 cursor-pointer rounded-2xl bg-transparent p-0 text-left outline-none focus:ring-2 focus:ring-idea-bright focus:ring-offset-2"
            style="width: {100 / carouselSlides.length}%"
            on:click={() => (carouselIndex = i)}
            on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); carouselIndex = i; } }}
          >
            {#if slide.type === 'info'}
              <div class="mx-1 flex min-h-[280px] flex-col justify-center rounded-2xl bg-gradient-to-br from-idea-navy to-idea-dark p-6 text-white shadow-md">
                <p class="text-center text-base">{slide.text}</p>
                <button type="button" class="mt-4 inline-block rounded-xl bg-white px-6 py-3 text-center font-semibold text-idea-navy shadow-md transition hover:opacity-90" on:click|preventDefault|stopPropagation>{slide.cta ?? 'Descubre más'}</button>
                <p class="mt-3 text-center text-xs text-white/80">{slide.sub}</p>
              </div>
            {:else}
              <div class="relative mx-1 min-h-[280px] overflow-hidden rounded-2xl bg-idea-navy shadow-md">
                <div class="absolute inset-0 flex items-center justify-center p-2">
                  <img src={slide.img || ''} alt={slide.alt || ''} class="max-h-full max-w-full object-contain" />
                </div>
                <div class="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-black/55 p-4 text-center text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <p class="font-bold text-idea-yellow">{slide.title}</p>
                  <p class="mt-2 text-sm opacity-95">{slide.subtitle}</p>
                </div>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>

    <!-- Desktop: tres tarjetas, la central más grande -->
    <div class="hidden items-end gap-4 py-6 md:flex md:gap-6 lg:gap-8">
      {#each carouselSlides as slide, i}
        <div
          role="button"
          tabindex="0"
          class="group flex min-w-0 cursor-pointer rounded-2xl bg-transparent p-0 text-left outline-none transition-all duration-500 focus:ring-2 focus:ring-idea-bright focus:ring-offset-2 {i === carouselIndex ? 'z-10 flex-[2]' : 'flex-1'}"
          on:click={() => (carouselIndex = i)}
          on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); carouselIndex = i; } }}
        >
          {#if slide.type === 'info'}
            <div class="flex w-full flex-col justify-center rounded-2xl p-4 shadow-md {i === carouselIndex ? 'min-h-[380px] bg-gradient-to-br from-idea-navy to-idea-dark text-white shadow-xl ring-2 ring-idea-bright/30 md:min-h-[420px] md:p-8' : 'min-h-[260px] bg-slate-100 text-slate-700 md:p-5'}">
              <p class="text-center {i === carouselIndex ? 'text-base md:text-lg' : 'text-sm'}">{slide.text}</p>
              <button type="button" class="mt-4 inline-block rounded-xl px-6 py-3 text-center font-semibold shadow-md transition md:mt-6 {i === carouselIndex ? 'bg-white text-idea-navy hover:bg-idea-light hover:shadow-lg' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}" on:click|preventDefault|stopPropagation>{slide.cta ?? 'Descubre más'}</button>
              <p class="mt-3 text-center text-xs md:text-sm {i === carouselIndex ? 'text-white/80' : 'text-slate-500'}">{slide.sub}</p>
            </div>
          {:else}
            <div class="relative w-full overflow-hidden rounded-2xl shadow-md {i === carouselIndex ? 'min-h-[380px] bg-idea-navy shadow-xl ring-2 ring-idea-bright/30 md:min-h-[420px]' : 'min-h-[260px] bg-slate-100'}">
              <div class="absolute inset-0 flex items-center justify-center">
                <img src={slide.img || ''} alt={slide.alt || ''} class="max-h-full max-w-full object-contain" />
              </div>
              <div class="absolute inset-0 flex flex-col items-center justify-center rounded-2xl p-4 text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 {i === carouselIndex ? 'bg-black/55 text-white' : 'bg-black/40 text-white'}">
                <p class="font-bold {i === carouselIndex ? 'text-idea-yellow text-lg' : 'text-white text-base'}">{slide.title}</p>
                <p class="mt-2 text-sm opacity-95">{slide.subtitle}</p>
              </div>
            </div>
          {/if}
        </div>
      {/each}
    </div>

    <div class="mt-8 flex justify-center gap-2">
      {#each carouselSlides as _, i}
        <button
          type="button"
          class="h-2 w-8 rounded-full transition {i === carouselIndex ? 'bg-idea-navy' : 'bg-slate-300'}"
          aria-label="Slide {i + 1}"
          on:click={() => (carouselIndex = i)}
        ></button>
      {/each}
    </div>
  </div>
</section>

<!-- La ciudad habla -->
<section class="bg-white px-4 py-12">
  <h2 class="mx-auto max-w-6xl text-center text-4xl font-bold text-idea-navy whitespace-pre-line">
    {ciudadHablaTitle}
  </h2>

  <div class="mx-auto mt-10 max-w-6xl space-y-12">
    {#each ciudadHablaCards as card}
      <div class="grid grid-cols-1 gap-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:grid-cols-2 md:items-stretch">
        {#if card.imageOnLeft}
          <div class="order-1 min-h-[220px] overflow-hidden rounded-t-2xl md:min-h-[280px] md:rounded-r-none md:rounded-l-2xl md:rounded-tr-none">
            <img src={card.img || ''} alt={card.imgAlt || ''} class="h-full w-full object-cover" />
          </div>
          <div class="order-2 flex flex-col justify-center p-6 md:p-8">
            <h3 class="text-xl font-bold uppercase tracking-wide text-idea-navy">{card.title}</h3>
            <p class="mt-4 text-slate-600">{card.text}</p>
            <button type="button" class="mt-6 w-full rounded-xl bg-idea-bright px-6 py-3 font-semibold text-white transition hover:opacity-95">{card.buttonText || 'Leer más'}</button>
          </div>
        {:else}
          <div class="order-2 flex flex-col justify-center p-6 md:order-1 md:p-8">
            <h3 class="text-xl font-bold uppercase tracking-wide text-idea-navy">{card.title}</h3>
            <p class="mt-4 text-slate-600">{card.text}</p>
            <button type="button" class="mt-6 w-full rounded-xl bg-idea-bright px-6 py-3 font-semibold text-white transition hover:opacity-95">{card.buttonText || 'Leer más'}</button>
          </div>
          <div class="order-1 min-h-[220px] overflow-hidden rounded-t-2xl md:order-2 md:min-h-[280px] md:rounded-l-none md:rounded-r-2xl md:rounded-tl-none">
            <img src={card.img || ''} alt={card.imgAlt || ''} class="h-full w-full object-cover" />
          </div>
        {/if}
      </div>
    {/each}
  </div>
</section>

<!-- ¿Buscas atención? -->
<section class="bg-white px-4 py-12">
  <h2 class="mx-auto max-w-6xl text-center text-4xl font-bold text-idea-navy whitespace-pre-line">
    {buscasAtencionTitle}
  </h2>
  <div class="mx-auto mt-10 grid max-w-6xl gap-6 sm:grid-cols-2">
    {#each locations as loc}
      <div class="flex overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <!-- Miniatura mapa (cuadrado, borde gris) -->
        <div class="relative flex-shrink-0 w-[140px] sm:w-[160px] aspect-square border-r border-slate-200 bg-slate-100">
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="h-3 w-3 rounded-full bg-red-500 shadow-sm" aria-hidden="true"></span>
          </div>
        </div>
        <!-- Nombre, dirección y botón -->
        <div class="flex min-w-0 flex-1 flex-col justify-between p-5 sm:p-6">
          <div>
            <h3 class="font-bold text-idea-navy">{loc.name}</h3>
            <p class="mt-2 text-sm leading-snug text-slate-600">{loc.address}</p>
          </div>
          <button type="button" class="mt-4 w-full rounded-xl bg-idea-blue px-4 py-3 text-sm font-bold text-white transition hover:opacity-95 sm:py-2.5">Abrir Maps</button>
        </div>
      </div>
    {/each}
  </div>
</section>
