<script>
  import { getSiteConfig, updateSiteConfig } from './api.js';

  const DEFAULT_LANDING = {
    heroTitle: '¡Bienvenido a tu nueva forma de conectar con Chihuahua!',
    heroSubtitle: 'Descubre eventos únicos y encuentra la chamba ideal con la ayuda de Chambabot, tu asistente inteligente.',
    heroMascotImg: '/assets/mascota/chambabot.png',
    heroCtaText: 'Buscador de empleo',
    heroLogos: [
      { src: '/assets/logos/escudo-municipio.png', alt: 'Escudo Municipio' },
      { src: '/assets/logos/logo-chihuahua-trabajo.png', alt: 'Chihuahua capital de trabajo y resultados' },
      { src: '/assets/logos/logo-idea.png', alt: 'IDEA' },
      { src: '/assets/logos/chihuahua-capital.png', alt: 'Chihuahua CAPITAL' },
    ],
    headlineText: 'Lo que pasa en Chihuahua,\nempieza aquí.',
    carouselSlides: [
      { type: 'image', img: '', alt: '', title: '', subtitle: '' },
      { type: 'info', text: '', cta: 'Descubre más', sub: '' },
      { type: 'image', img: '', alt: '', title: '', subtitle: '' },
    ],
    ciudadHablaTitle: 'La ciudad habla.\n¿Ya la escuchaste?',
    ciudadHablaCards: [
      { title: '', text: '', img: '', imgAlt: '', buttonText: 'Leer más', imageOnLeft: true },
      { title: '', text: '', img: '', imgAlt: '', buttonText: 'Leer más', imageOnLeft: false },
      { title: '', text: '', img: '', imgAlt: '', buttonText: 'Leer más', imageOnLeft: true },
    ],
    buscasAtencionTitle: '¿Buscas atención?\nAquí nos encuentras',
    locations: [{ name: '', address: '' }],
  };

  const TABS = [
    { id: 'hero', label: 'Hero' },
    { id: 'logos', label: 'Logos' },
    { id: 'headline', label: 'Frase' },
    { id: 'carousel', label: 'Carrusel' },
    { id: 'ciudadHabla', label: 'La ciudad habla' },
    { id: 'buscasAtencion', label: '¿Buscas atención?' },
  ];

  let landing = $state({ ...DEFAULT_LANDING });
  let loading = $state(true);
  let activeTab = $state('hero');
  let savingSection = $state(null);
  let error = $state('');
  let savedSection = $state(null);

  async function load() {
    loading = true;
    error = '';
    try {
      const data = await getSiteConfig();
      const L = data.landing;
      if (L && typeof L === 'object') {
        landing = {
          heroTitle: L.heroTitle ?? DEFAULT_LANDING.heroTitle,
          heroSubtitle: L.heroSubtitle ?? DEFAULT_LANDING.heroSubtitle,
          heroMascotImg: L.heroMascotImg ?? DEFAULT_LANDING.heroMascotImg,
          heroCtaText: L.heroCtaText ?? DEFAULT_LANDING.heroCtaText,
          heroLogos: Array.isArray(L.heroLogos) && L.heroLogos.length ? L.heroLogos.map((logo) => ({ src: logo.src ?? '', alt: logo.alt ?? '' })) : DEFAULT_LANDING.heroLogos,
          headlineText: L.headlineText ?? DEFAULT_LANDING.headlineText,
          carouselSlides: Array.isArray(L.carouselSlides) && L.carouselSlides.length ? L.carouselSlides.map((s) => ({ ...s, type: s.type === 'info' ? 'info' : 'image' })) : DEFAULT_LANDING.carouselSlides,
          ciudadHablaTitle: L.ciudadHablaTitle ?? DEFAULT_LANDING.ciudadHablaTitle,
          ciudadHablaCards: Array.isArray(L.ciudadHablaCards) && L.ciudadHablaCards.length ? L.ciudadHablaCards.map((c) => ({ ...DEFAULT_LANDING.ciudadHablaCards[0], ...c, imageOnLeft: c.imageOnLeft !== false })) : DEFAULT_LANDING.ciudadHablaCards,
          buscasAtencionTitle: L.buscasAtencionTitle ?? DEFAULT_LANDING.buscasAtencionTitle,
          locations: Array.isArray(L.locations) && L.locations.length ? L.locations.map((l) => ({ name: l.name ?? '', address: l.address ?? '' })) : DEFAULT_LANDING.locations,
        };
      }
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  async function saveSection(sectionId) {
    savingSection = sectionId;
    error = '';
    savedSection = null;
    try {
      await updateSiteConfig({ landing });
      savedSection = sectionId;
      setTimeout(() => { savedSection = null; }, 2500);
    } catch (e) {
      error = e.message;
    } finally {
      savingSection = null;
    }
  }

  function addSlide(type) {
    landing = { ...landing, carouselSlides: [...landing.carouselSlides, type === 'info' ? { type: 'info', text: '', cta: 'Descubre más', sub: '' } : { type: 'image', img: '', alt: '', title: '', subtitle: '' }] };
  }
  function removeSlide(i) {
    landing = { ...landing, carouselSlides: landing.carouselSlides.filter((_, idx) => idx !== i) };
  }
  function moveSlide(i, delta) {
    const next = i + delta;
    if (next < 0 || next >= landing.carouselSlides.length) return;
    const arr = [...landing.carouselSlides];
    [arr[i], arr[next]] = [arr[next], arr[i]];
    landing = { ...landing, carouselSlides: arr };
  }
  function setSlide(i, field, value) {
    landing = { ...landing, carouselSlides: landing.carouselSlides.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)) };
  }

  function setHero(field, value) {
    landing = { ...landing, [field]: value };
  }

  function setLogo(i, field, value) {
    const logos = landing.heroLogos ?? [];
    landing = { ...landing, heroLogos: logos.map((logo, idx) => (idx === i ? { ...logo, [field]: value } : logo)) };
  }
  function addLogo() {
    const logos = landing.heroLogos ?? [];
    landing = { ...landing, heroLogos: [...logos, { src: '', alt: '' }] };
  }
  function removeLogo(i) {
    const logos = landing.heroLogos ?? [];
    landing = { ...landing, heroLogos: logos.filter((_, idx) => idx !== i) };
  }
  function moveLogo(i, delta) {
    const logos = landing.heroLogos ?? [];
    const next = i + delta;
    if (next < 0 || next >= logos.length) return;
    const arr = [...logos];
    [arr[i], arr[next]] = [arr[next], arr[i]];
    landing = { ...landing, heroLogos: arr };
  }

  function setCard(i, field, value) {
    landing = { ...landing, ciudadHablaCards: (landing.ciudadHablaCards ?? []).map((c, idx) => (idx === i ? { ...c, [field]: value } : c)) };
  }
  function addCard() {
    const cards = landing.ciudadHablaCards ?? [];
    landing = { ...landing, ciudadHablaCards: [...cards, { title: '', text: '', img: '', imgAlt: '', buttonText: 'Leer más', imageOnLeft: true }] };
  }
  function removeCard(i) {
    const cards = landing.ciudadHablaCards ?? [];
    landing = { ...landing, ciudadHablaCards: cards.filter((_, idx) => idx !== i) };
  }
  function moveCard(i, delta) {
    const cards = landing.ciudadHablaCards ?? [];
    const next = i + delta;
    if (next < 0 || next >= cards.length) return;
    const arr = [...cards];
    [arr[i], arr[next]] = [arr[next], arr[i]];
    landing = { ...landing, ciudadHablaCards: arr };
  }

  function setLocation(i, field, value) {
    landing = { ...landing, locations: landing.locations.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)) };
  }
  function addLocation() {
    const locs = landing.locations ?? [];
    landing = { ...landing, locations: [...locs, { name: '', address: '' }] };
  }
  function removeLocation(i) {
    const locs = landing.locations ?? [];
    landing = { ...landing, locations: locs.filter((_, idx) => idx !== i) };
  }
  function moveLocation(i, delta) {
    const locs = landing.locations ?? [];
    const next = i + delta;
    if (next < 0 || next >= locs.length) return;
    const arr = [...locs];
    [arr[i], arr[next]] = [arr[next], arr[i]];
    landing = { ...landing, locations: arr };
  }

  $effect(() => {
    load();
  });
</script>

<div class="space-y-0">
  {#if error}
    <div class="mb-4 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200 px-3 py-2" role="alert">{error}</div>
  {/if}

  {#if loading}
    <div class="cms-card p-8">
      <div class="h-8 rounded-lg bg-slate-100 animate-pulse w-1/2"></div>
      <div class="mt-4 h-24 rounded-lg bg-slate-100 animate-pulse"></div>
    </div>
  {:else}
    <!-- Pestañas -->
    <div class="border-b border-slate-200 mb-8" role="tablist" aria-label="Secciones de la página de inicio">
      <nav class="flex gap-0 overflow-x-auto">
        {#each TABS as tab}
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            class="shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap {activeTab === tab.id ? 'border-slate-800 text-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}"
            onclick={() => (activeTab = tab.id)}
          >
            {tab.label}
          </button>
        {/each}
      </nav>
    </div>

    <!-- Contenido de la pestaña activa -->
    {#if activeTab === 'hero'}
    <section class="cms-card p-8">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h3 class="text-base font-semibold text-slate-800">Hero</h3>
        <div class="flex items-center gap-2">
          {#if savedSection === 'hero'}
            <span class="text-sm text-green-600 font-medium">Guardado</span>
          {/if}
          <button type="button" class="cms-btn-primary !py-2 !px-4 text-sm" disabled={savingSection === 'hero'} onclick={() => saveSection('hero')}>
            {savingSection === 'hero' ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
      <p class="text-sm text-slate-500 mb-6">Banner principal: título, subtítulo, imagen de la mascota y botón.</p>
      <div class="space-y-5">
        <div>
          <label for="hero-title" class="cms-label">Título grande</label>
          <input id="hero-title" type="text" class="cms-input mt-1" value={landing.heroTitle} oninput={(e) => setHero('heroTitle', e.target.value)} placeholder="Ej: ¡Bienvenido a Chihuahua!" />
        </div>
        <div>
          <label for="hero-subtitle" class="cms-label">Subtítulo</label>
          <input id="hero-subtitle" type="text" class="cms-input mt-1" value={landing.heroSubtitle} oninput={(e) => setHero('heroSubtitle', e.target.value)} placeholder="Una línea que describa el sitio" />
        </div>
        <div>
          <label for="hero-mascot" class="cms-label">Imagen de la mascota (ruta)</label>
          <input id="hero-mascot" type="text" class="cms-input mt-1" value={landing.heroMascotImg} oninput={(e) => setHero('heroMascotImg', e.target.value)} placeholder="/assets/mascota/chambabot.png" />
        </div>
        <div>
          <label for="hero-cta" class="cms-label">Texto del botón</label>
          <input id="hero-cta" type="text" class="cms-input mt-1" value={landing.heroCtaText} oninput={(e) => setHero('heroCtaText', e.target.value)} placeholder="Buscador de empleo" />
        </div>
      </div>
    </section>

    {:else if activeTab === 'logos'}
    <section class="cms-card p-8">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h3 class="text-base font-semibold text-slate-800">Logos debajo del hero</h3>
        <div class="flex items-center gap-2">
          {#if savedSection === 'logos'}
            <span class="text-sm text-green-600 font-medium">Guardado</span>
          {/if}
          <button type="button" class="cms-btn-primary !py-2 !px-4 text-sm" disabled={savingSection === 'logos'} onclick={() => saveSection('logos')}>
            {savingSection === 'logos' ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
      <p class="text-sm text-slate-500 mb-6">Logos que se muestran en la franja blanca justo debajo del banner principal. Ordena con ↑↓.</p>
      <ul class="space-y-4">
        {#each (landing.heroLogos ?? []) as logo, i}
          <li class="rounded-lg border border-slate-200 bg-slate-50 p-5">
            <div class="mb-3 flex items-center justify-between">
              <span class="text-sm font-medium text-slate-600">Logo {i + 1}</span>
              <div class="flex gap-1">
                <button type="button" class="p-1.5 text-slate-500 hover:bg-slate-200 rounded" title="Subir" onclick={() => moveLogo(i, -1)} disabled={i === 0}>↑</button>
                <button type="button" class="p-1.5 text-slate-500 hover:bg-slate-200 rounded" title="Bajar" onclick={() => moveLogo(i, 1)} disabled={i === (landing.heroLogos ?? []).length - 1}>↓</button>
                <button type="button" class="p-1.5 text-red-600 hover:bg-red-100 rounded" title="Quitar" onclick={() => removeLogo(i)}>✕</button>
              </div>
            </div>
            <div class="space-y-3">
              <div>
                <label for="logo-src-{i}" class="cms-label">Ruta de la imagen</label>
                <input id="logo-src-{i}" type="text" class="cms-input mt-1" placeholder="/assets/logos/logo.png" value={logo.src} oninput={(e) => setLogo(i, 'src', e.target.value)} />
              </div>
              <div>
                <label for="logo-alt-{i}" class="cms-label">Texto alternativo (alt)</label>
                <input id="logo-alt-{i}" type="text" class="cms-input mt-1" placeholder="Descripción del logo" value={logo.alt} oninput={(e) => setLogo(i, 'alt', e.target.value)} />
              </div>
            </div>
          </li>
        {/each}
      </ul>
      <button type="button" class="mt-4 cms-btn-secondary !py-2 !px-3 text-sm" onclick={addLogo}>+ Añadir logo</button>
    </section>

    {:else if activeTab === 'headline'}
    <section class="cms-card p-8">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h3 class="text-base font-semibold text-slate-800">Frase debajo de los logos</h3>
        <div class="flex items-center gap-2">
          {#if savedSection === 'headline'}
            <span class="text-sm text-green-600 font-medium">Guardado</span>
          {/if}
          <button type="button" class="cms-btn-primary !py-2 !px-4 text-sm" disabled={savingSection === 'headline'} onclick={() => saveSection('headline')}>
            {savingSection === 'headline' ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
      <p class="text-sm text-slate-500 mb-6">La línea tipo “Lo que pasa en Chihuahua, empieza aquí.” Puedes usar Enter para salto de línea.</p>
      <textarea id="headline" class="cms-input min-h-[80px] mt-1" value={landing.headlineText} oninput={(e) => setHero('headlineText', e.target.value)} placeholder="Lo que pasa en Chihuahua,&#10;empieza aquí."></textarea>
    </section>

    {:else if activeTab === 'carousel'}
    <section class="cms-card p-8">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h3 class="text-base font-semibold text-slate-800">Carrusel</h3>
        <div class="flex items-center gap-2">
          {#if savedSection === 'carousel'}
            <span class="text-sm text-green-600 font-medium">Guardado</span>
          {/if}
          <button type="button" class="cms-btn-primary !py-2 !px-4 text-sm" disabled={savingSection === 'carousel'} onclick={() => saveSection('carousel')}>
            {savingSection === 'carousel' ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
      <p class="text-sm text-slate-500 mb-6">Tarjetas con imagen o solo texto. Ordena con ↑↓.</p>
      <ul class="space-y-4">
        {#each landing.carouselSlides as slide, i}
          <li class="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div class="mb-2 flex items-center justify-between">
              <span class="text-sm font-medium text-slate-600">Tarjeta {i + 1}</span>
              <div class="flex gap-1">
                <button type="button" class="p-1.5 text-slate-500 hover:bg-slate-200 rounded" title="Subir" onclick={() => moveSlide(i, -1)} disabled={i === 0}>↑</button>
                <button type="button" class="p-1.5 text-slate-500 hover:bg-slate-200 rounded" title="Bajar" onclick={() => moveSlide(i, 1)} disabled={i === landing.carouselSlides.length - 1}>↓</button>
                <button type="button" class="p-1.5 text-red-600 hover:bg-red-100 rounded" title="Quitar" onclick={() => removeSlide(i)}>✕</button>
              </div>
            </div>
            {#if slide.type === 'info'}
              <div class="space-y-2">
                <input type="text" class="cms-input !py-2 text-sm" placeholder="Texto principal" value={slide.text} oninput={(e) => setSlide(i, 'text', e.target.value)} />
                <input type="text" class="cms-input !py-2 text-sm" placeholder="Texto del botón" value={slide.cta} oninput={(e) => setSlide(i, 'cta', e.target.value)} />
                <input type="text" class="cms-input !py-2 text-sm" placeholder="Línea pequeña debajo" value={slide.sub} oninput={(e) => setSlide(i, 'sub', e.target.value)} />
              </div>
            {:else}
              <div class="space-y-2">
                <input type="text" class="cms-input !py-2 text-sm" placeholder="Ruta de la imagen" value={slide.img} oninput={(e) => setSlide(i, 'img', e.target.value)} />
                <input type="text" class="cms-input !py-2 text-sm" placeholder="Alt" value={slide.alt} oninput={(e) => setSlide(i, 'alt', e.target.value)} />
                <input type="text" class="cms-input !py-2 text-sm" placeholder="Título" value={slide.title} oninput={(e) => setSlide(i, 'title', e.target.value)} />
                <input type="text" class="cms-input !py-2 text-sm" placeholder="Subtítulo" value={slide.subtitle} oninput={(e) => setSlide(i, 'subtitle', e.target.value)} />
              </div>
            {/if}
          </li>
        {/each}
      </ul>
      <div class="mt-3 flex gap-2">
        <button type="button" class="cms-btn-secondary !py-2 !px-3 text-sm" onclick={() => addSlide('image')}>+ Tarjeta con imagen</button>
        <button type="button" class="cms-btn-secondary !py-2 !px-3 text-sm" onclick={() => addSlide('info')}>+ Tarjeta solo texto</button>
      </div>
    </section>

    {:else if activeTab === 'ciudadHabla'}
    <section class="cms-card p-8">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h3 class="text-base font-semibold text-slate-800">La ciudad habla</h3>
        <div class="flex items-center gap-2">
          {#if savedSection === 'ciudadHabla'}
            <span class="text-sm text-green-600 font-medium">Guardado</span>
          {/if}
          <button type="button" class="cms-btn-primary !py-2 !px-4 text-sm" disabled={savingSection === 'ciudadHabla'} onclick={() => saveSection('ciudadHabla')}>
            {savingSection === 'ciudadHabla' ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
      <p class="text-sm text-slate-500 mb-6">Título y tarjetas (imagen + título + texto + botón). «Imagen a la izquierda» define el orden en escritorio.</p>
      <div class="mb-6">
        <label for="ciudad-habla-title" class="cms-label">Título de la sección</label>
        <textarea id="ciudad-habla-title" class="cms-input min-h-[60px]" value={landing.ciudadHablaTitle ?? ''} oninput={(e) => setHero('ciudadHablaTitle', e.target.value)} placeholder="La ciudad habla.&#10;¿Ya la escuchaste?"></textarea>
      </div>
      <ul class="space-y-4">
        {#each (landing.ciudadHablaCards ?? []) as card, i}
          <li class="rounded-lg border border-slate-200 bg-slate-50 p-5">
            <div class="mb-2 flex items-center justify-between">
              <span class="text-sm font-medium text-slate-600">Tarjeta {i + 1}</span>
              <div class="flex gap-1">
                <button type="button" class="p-1.5 text-slate-500 hover:bg-slate-200 rounded" title="Subir" onclick={() => moveCard(i, -1)} disabled={i === 0}>↑</button>
                <button type="button" class="p-1.5 text-slate-500 hover:bg-slate-200 rounded" title="Bajar" onclick={() => moveCard(i, 1)} disabled={i === (landing.ciudadHablaCards ?? []).length - 1}>↓</button>
                <button type="button" class="p-1.5 text-red-600 hover:bg-red-100 rounded" title="Quitar" onclick={() => removeCard(i)}>✕</button>
              </div>
            </div>
            <div class="space-y-2">
              <input type="text" class="cms-input !py-2 text-sm" placeholder="Título de la tarjeta" value={card.title} oninput={(e) => setCard(i, 'title', e.target.value)} />
              <textarea class="cms-input !py-2 text-sm min-h-[60px]" placeholder="Texto (párrafo)" value={card.text} oninput={(e) => setCard(i, 'text', e.target.value)}></textarea>
              <input type="text" class="cms-input !py-2 text-sm" placeholder="Ruta de la imagen" value={card.img} oninput={(e) => setCard(i, 'img', e.target.value)} />
              <input type="text" class="cms-input !py-2 text-sm" placeholder="Alt de la imagen" value={card.imgAlt} oninput={(e) => setCard(i, 'imgAlt', e.target.value)} />
              <input type="text" class="cms-input !py-2 text-sm" placeholder="Texto del botón" value={card.buttonText} oninput={(e) => setCard(i, 'buttonText', e.target.value)} />
              <label class="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={card.imageOnLeft} onchange={(e) => setCard(i, 'imageOnLeft', e.target.checked)} />
                Imagen a la izquierda (escritorio)
              </label>
            </div>
          </li>
        {/each}
      </ul>
      <button type="button" class="mt-3 cms-btn-secondary !py-2 !px-3 text-sm" onclick={addCard}>+ Añadir tarjeta</button>
    </section>

    {:else if activeTab === 'buscasAtencion'}
    <section class="cms-card p-8">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h3 class="text-base font-semibold text-slate-800">¿Buscas atención? (ubicaciones)</h3>
        <div class="flex items-center gap-2">
          {#if savedSection === 'buscasAtencion'}
            <span class="text-sm text-green-600 font-medium">Guardado</span>
          {/if}
          <button type="button" class="cms-btn-primary !py-2 !px-4 text-sm" disabled={savingSection === 'buscasAtencion'} onclick={() => saveSection('buscasAtencion')}>
            {savingSection === 'buscasAtencion' ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
      <p class="text-sm text-slate-500 mb-6">Título y lista de lugares (nombre y dirección).</p>
      <div class="mb-6">
        <label for="buscas-atencion-title" class="cms-label">Título de la sección</label>
        <textarea id="buscas-atencion-title" class="cms-input min-h-[60px]" value={landing.buscasAtencionTitle ?? ''} oninput={(e) => setHero('buscasAtencionTitle', e.target.value)} placeholder="¿Buscas atención?&#10;Aquí nos encuentras"></textarea>
      </div>
      <ul class="space-y-4">
        {#each (landing.locations ?? []) as loc, i}
          <li class="rounded-lg border border-slate-200 bg-slate-50 p-5 flex flex-wrap items-center gap-2">
            <div class="flex-1 min-w-[200px] space-y-2">
              <input type="text" class="cms-input !py-2 text-sm" placeholder="Nombre del lugar" value={loc.name} oninput={(e) => setLocation(i, 'name', e.target.value)} />
              <input type="text" class="cms-input !py-2 text-sm" placeholder="Dirección" value={loc.address} oninput={(e) => setLocation(i, 'address', e.target.value)} />
            </div>
            <div class="flex gap-1">
              <button type="button" class="p-2 text-slate-500 hover:bg-slate-200 rounded" title="Subir" onclick={() => moveLocation(i, -1)} disabled={i === 0}>↑</button>
              <button type="button" class="p-2 text-slate-500 hover:bg-slate-200 rounded" title="Bajar" onclick={() => moveLocation(i, 1)} disabled={i === (landing.locations ?? []).length - 1}>↓</button>
              <button type="button" class="p-2 text-red-600 hover:bg-red-100 rounded" title="Quitar" onclick={() => removeLocation(i)}>✕</button>
            </div>
          </li>
        {/each}
      </ul>
      <button type="button" class="mt-3 cms-btn-secondary !py-2 !px-3 text-sm" onclick={addLocation}>+ Añadir ubicación</button>
    </section>
    {/if}
  {/if}
</div>
