<script>
  import { getSiteConfig, updateSiteConfig, getSocialLinks, updateSocialLinks } from './api.js';
  import ImageUploadField from './ImageUploadField.svelte';

  const DEFAULT_LANDING = {
    heroTitle: '¡Bienvenido a tu nueva forma de conectar con Chihuahua!',
    heroSubtitle: 'Descubre eventos únicos y encuentra la chamba ideal con la ayuda de Chambabot, tu asistente inteligente.',
    heroMascotImg: '/assets/mascota/chambabot.png',
    heroMascotLink: '',
    heroCtaText: 'Buscador de empleo',
    heroLogos: [
      { src: '/assets/logos/escudo-municipio.png', alt: 'Escudo Municipio', link: '' },
      { src: '/assets/logos/logo-chihuahua-trabajo.png', alt: 'Chihuahua capital de trabajo y resultados', link: '' },
      { src: '/assets/logos/logo-idea.png', alt: 'IDEA', link: '' },
      { src: '/assets/logos/chihuahua-capital.png', alt: 'Chihuahua CAPITAL', link: '' },
    ],
    headlineText: 'Lo que pasa en Chihuahua,\nempieza aquí.',
    carouselSlides: [
      { type: 'image', img: '', alt: '', title: '', subtitle: '', link: '' },
      { type: 'info', text: '', cta: 'Descubre más', ctaLink: '', ctaTarget: '_self', sub: '' },
      { type: 'image', img: '', alt: '', title: '', subtitle: '', link: '' },
    ],
    ciudadHablaTitle: 'La ciudad habla.\n¿Ya la escuchaste?',
    ciudadHablaCards: [
      { title: '', text: '', img: '', imgAlt: '', imageLink: '', buttonText: 'Leer más', buttonLink: '', imageOnLeft: true },
      { title: '', text: '', img: '', imgAlt: '', imageLink: '', buttonText: 'Leer más', buttonLink: '', imageOnLeft: false },
      { title: '', text: '', img: '', imgAlt: '', imageLink: '', buttonText: 'Leer más', buttonLink: '', imageOnLeft: true },
    ],
    buscasAtencionTitle: '¿Buscas atención?\nAquí nos encuentras',
    locations: [{ name: '', address: '', mapsUrl: '', mapImage: '' }],
  };

  const TABS = [
    { id: 'hero', label: 'Hero' },
    { id: 'logos', label: 'Logos' },
    { id: 'headline', label: 'Frase' },
    { id: 'carousel', label: 'Carrusel' },
    { id: 'ciudadHabla', label: 'La ciudad habla' },
    { id: 'buscasAtencion', label: '¿Buscas atención?' },
    { id: 'socials', label: 'Redes sociales' },
  ];

  let landing = $state({ ...DEFAULT_LANDING });
  let loading = $state(true);
  let activeTab = $state('hero');
  let savingSection = $state(null);
  let error = $state('');
  let savedSection = $state(null);
  let socialLinks = $state([]);
  let socialDeleteIndex = $state(null);
  let collapsedCards = $state(new Set());
  let draggingCard = $state(null);
  let collapsedLogos = $state(new Set());
  let draggingLogo = $state(null);
  let collapsedSlides = $state(new Set());
  let draggingSlide = $state(null);
  let collapsedLocations = $state(new Set());
  let draggingLocation = $state(null);
  let collapsedSocials = $state(new Set());
  let draggingSocial = $state(null);

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
    loading = true;
    error = '';
    try {
      const data = await getSiteConfig();
      socialLinks = await getSocialLinks();
      const L = data.landing;
      if (L && typeof L === 'object') {
        landing = {
          heroTitle: L.heroTitle ?? DEFAULT_LANDING.heroTitle,
          heroSubtitle: L.heroSubtitle ?? DEFAULT_LANDING.heroSubtitle,
          heroMascotImg: L.heroMascotImg ?? DEFAULT_LANDING.heroMascotImg,
          heroMascotLink: L.heroMascotLink ?? '',
          heroCtaText: L.heroCtaText ?? DEFAULT_LANDING.heroCtaText,
          heroLogos: Array.isArray(L.heroLogos) && L.heroLogos.length ? L.heroLogos.map((logo) => ({ src: logo.src ?? '', alt: logo.alt ?? '', link: logo.link ?? '' })) : DEFAULT_LANDING.heroLogos,
          headlineText: L.headlineText ?? DEFAULT_LANDING.headlineText,
          carouselSlides: Array.isArray(L.carouselSlides) && L.carouselSlides.length ? L.carouselSlides.map((s) => ({ ...s, link: s.link ?? '', ctaLink: s.ctaLink ?? '', ctaTarget: s.ctaTarget === '_blank' ? '_blank' : '_self', type: s.type === 'info' ? 'info' : 'image' })) : DEFAULT_LANDING.carouselSlides,
          ciudadHablaTitle: L.ciudadHablaTitle ?? DEFAULT_LANDING.ciudadHablaTitle,
          ciudadHablaCards: Array.isArray(L.ciudadHablaCards) && L.ciudadHablaCards.length ? L.ciudadHablaCards.map((c) => ({ ...DEFAULT_LANDING.ciudadHablaCards[0], ...c, imageLink: c.imageLink ?? '', buttonLink: c.buttonLink ?? '', imageOnLeft: c.imageOnLeft !== false })) : DEFAULT_LANDING.ciudadHablaCards,
          buscasAtencionTitle: L.buscasAtencionTitle ?? DEFAULT_LANDING.buscasAtencionTitle,
          locations: Array.isArray(L.locations) && L.locations.length ? L.locations.map((l) => ({ name: l.name ?? '', address: l.address ?? '', mapsUrl: l.mapsUrl ?? '', mapImage: l.mapImage ?? '' })) : DEFAULT_LANDING.locations,
        };
      }
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  function addSocial() {
    socialLinks = [
      ...socialLinks,
      { label: '', icon: '', url: '', enabled: true },
    ];
  }

  function removeSocial(index) {
    socialLinks = socialLinks.filter((_, i) => i !== index);
  }

  function confirmRemoveSocial() {
    if (socialDeleteIndex === null) return;
    removeSocial(socialDeleteIndex);
    socialDeleteIndex = null;
  }

  function toggleSocial(i) {
    const next = new Set(collapsedSocials);
    if (next.has(i)) next.delete(i); else next.add(i);
    collapsedSocials = next;
  }

  function dropSocial(i) {
    if (draggingSocial === null || draggingSocial === i) { draggingSocial = null; return; }
    const next = [...socialLinks];
    const [moved] = next.splice(draggingSocial, 1);
    next.splice(i, 0, moved);
    socialLinks = next;
    draggingSocial = null;
  }

  function moveSocial(i, delta) {
    const nextIndex = i + delta;
    if (nextIndex < 0 || nextIndex >= socialLinks.length) return;
    const next = [...socialLinks];
    [next[i], next[nextIndex]] = [next[nextIndex], next[i]];
    socialLinks = next;
  }

  async function saveSection(sectionId) {
    if (sectionId === 'socials') {
      savingSection = sectionId;
      error = '';
      try {
        if (socialLinks.some((item) => !String(item.label ?? '').trim() || !String(item.icon ?? '').trim() || !String(item.url ?? '').trim())) throw new Error('Completa el nombre, icono y URL de todas las redes antes de guardar.');
        socialLinks = await updateSocialLinks(socialLinks);
        savedSection = sectionId;
        setTimeout(() => { savedSection = null; }, 2500);
      } catch (e) { error = e.message; }
      finally { savingSection = null; }
      return;
    }
    const links = [
      ...(landing.heroLogos ?? []).map((x) => x.link),
      ...(landing.carouselSlides ?? []).map((x) => x.link),
      ...(landing.carouselSlides ?? []).map((x) => x.ctaLink),
      ...(landing.ciudadHablaCards ?? []).map((x) => x.imageLink),
      ...(landing.ciudadHablaCards ?? []).map((x) => x.buttonLink),
    ];
    if (links.some((link) => !isValidLink(link))) {
      error = 'Revisa los campos Enlace / URL. Usa una URL http(s) o una ruta interna como /pagina/ejemplo.';
      return;
    }
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
  landing = { ...landing, carouselSlides: [...landing.carouselSlides, type === 'info' ? { type: 'info', text: '', cta: 'Descubre más', ctaLink: '', ctaTarget: '_self', sub: '' } : { type: 'image', img: '', alt: '', title: '', subtitle: '', link: '' }] };
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

  function toggleSlide(i) {
    const next = new Set(collapsedSlides);
    if (next.has(i)) next.delete(i); else next.add(i);
    collapsedSlides = next;
  }

  function dropSlide(i) {
    if (draggingSlide === null || draggingSlide === i) { draggingSlide = null; return; }
    const slides = [...landing.carouselSlides];
    const [moved] = slides.splice(draggingSlide, 1);
    slides.splice(i, 0, moved);
    landing = { ...landing, carouselSlides: slides };
    draggingSlide = null;
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
    landing = { ...landing, heroLogos: [...logos, { src: '', alt: '', link: '' }] };
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

  function toggleLogo(i) {
    const next = new Set(collapsedLogos);
    if (next.has(i)) next.delete(i); else next.add(i);
    collapsedLogos = next;
  }

  function dropLogo(i) {
    if (draggingLogo === null || draggingLogo === i) { draggingLogo = null; return; }
    const logos = [...(landing.heroLogos ?? [])];
    const [moved] = logos.splice(draggingLogo, 1);
    logos.splice(i, 0, moved);
    landing = { ...landing, heroLogos: logos };
    draggingLogo = null;
  }

  function setCard(i, field, value) {
    landing = { ...landing, ciudadHablaCards: (landing.ciudadHablaCards ?? []).map((c, idx) => (idx === i ? { ...c, [field]: value } : c)) };
  }

  function autoGrowTextarea(event) {
    const textarea = event.currentTarget;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }
  function addCard() {
    const cards = landing.ciudadHablaCards ?? [];
    landing = { ...landing, ciudadHablaCards: [...cards, { title: '', text: '', img: '', imgAlt: '', imageLink: '', buttonText: 'Leer más', buttonLink: '', imageOnLeft: true }] };
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

  function toggleCard(i) {
    const next = new Set(collapsedCards);
    if (next.has(i)) next.delete(i); else next.add(i);
    collapsedCards = next;
  }

  function startCardDrag(i) {
    draggingCard = i;
  }

  function dropCard(i) {
    if (draggingCard === null || draggingCard === i) {
      draggingCard = null;
      return;
    }
    const cards = [...(landing.ciudadHablaCards ?? [])];
    const [moved] = cards.splice(draggingCard, 1);
    cards.splice(i, 0, moved);
    landing = { ...landing, ciudadHablaCards: cards };
    draggingCard = null;
  }

  function setLocation(i, field, value) {
    landing = { ...landing, locations: landing.locations.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)) };
  }
  function addLocation() {
    const locs = landing.locations ?? [];
    landing = { ...landing, locations: [...locs, { name: '', address: '', mapsUrl: '', mapImage: '' }] };
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

  function toggleLocation(i) {
    const next = new Set(collapsedLocations);
    if (next.has(i)) next.delete(i); else next.add(i);
    collapsedLocations = next;
  }

  function dropLocation(i) {
    if (draggingLocation === null || draggingLocation === i) { draggingLocation = null; return; }
    const locations = [...(landing.locations ?? [])];
    const [moved] = locations.splice(draggingLocation, 1);
    locations.splice(i, 0, moved);
    landing = { ...landing, locations };
    draggingLocation = null;
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
    {:else if activeTab === 'socials'}
    <section class="cms-card p-8">
      <div class="flex items-center justify-between gap-3 mb-6">
        <div><h3 class="text-base font-semibold text-slate-800">Redes sociales</h3><p class="text-sm text-slate-500 mt-1">Administra los enlaces del pie de página.</p></div>
        <div class="flex items-center gap-3">
          {#if savedSection === 'socials'}
            <span class="text-sm font-medium text-green-600">Guardado exitosamente</span>
          {/if}
          <button class="cms-btn-primary" onclick={() => saveSection('socials')} disabled={savingSection === 'socials'}>{savingSection === 'socials' ? 'Guardando…' : 'Guardar'}</button>
        </div>
      </div>
      <div class="space-y-3">
        {#each socialLinks as social, i}
            <div class="relative flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div class="w-full space-y-3">
              <div class="flex flex-wrap items-center gap-3">
                <input class="cms-input flex-1" value={social.label} placeholder="Nombre de la red social" oninput={(e) => { social.label = e.currentTarget.value; socialLinks = [...socialLinks]; }} />
                <input class="cms-input flex-1" value={social.url} placeholder="https://ejemplo.com/perfil" oninput={(e) => { social.url = e.currentTarget.value; socialLinks = [...socialLinks]; }} />
                <button class="text-2xl text-red-600" onclick={() => removeSocial(i)}>×</button>
              </div>
              <ImageUploadField
                compact
                id="social-icon-{i}"
                label="Icono de la red social"
                value={social.icon}
                requiredWidth={128}
                requiredHeight={128}
                onChange={(value) => { social.icon = value; socialLinks = [...socialLinks]; }}
              />
              <p class="text-xs text-slate-500">Usa un icono cuadrado de 128 × 128 píxeles, preferentemente PNG con fondo transparente.</p>
            </div>
          </div>
        {/each}
      </div>
      <button class="cms-btn-secondary mt-4" onclick={addSocial}>+ Agregar red social</button>
    </section>
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
          <ImageUploadField
            id="hero-mascot"
            label="Imagen de la mascota"
            value={landing.heroMascotImg}
            onChange={(v) => setHero('heroMascotImg', v)}
          />
          <label for="hero-mascot-link" class="cms-label mt-4 block">Enlace / URL (opcional)</label>
          <input id="hero-mascot-link" type="text" class="cms-input mt-1" value={landing.heroMascotLink ?? ''} oninput={(e) => setHero('heroMascotLink', e.target.value)} placeholder="https://ejemplo.com o /pagina/ejemplo" />
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
          <li class="rounded-lg border border-slate-200 bg-slate-50 p-5 transition-opacity {draggingLogo === i ? 'opacity-50' : ''}" draggable="true" ondragstart={() => (draggingLogo = i)} ondragover={(event) => event.preventDefault()} ondrop={() => dropLogo(i)} ondragend={() => (draggingLogo = null)}>
            <div class="mb-3 flex items-center justify-between">
              <div class="flex min-w-0 cursor-grab items-center gap-2 active:cursor-grabbing"><span class="text-slate-400" aria-hidden="true">⠿</span><span class="truncate text-sm font-medium text-slate-600">Logo {i + 1}: {logo.alt || 'Sin descripción'}</span></div>
              <div class="flex items-center gap-1">
                <button type="button" class="rounded p-1.5 text-slate-500 hover:bg-slate-200" title={collapsedLogos.has(i) ? 'Mostrar logo' : 'Ocultar logo'} aria-label={collapsedLogos.has(i) ? 'Mostrar logo' : 'Ocultar logo'} onclick={() => toggleLogo(i)}>
                  <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2.5 12s3.5-5 9.5-5 9.5 5 9.5 5-3.5 5-9.5 5-9.5-5-9.5-5Z" /><circle cx="12" cy="12" r="2.5" /></svg>
                </button>
                <button type="button" class="p-1.5 text-slate-500 hover:bg-slate-200 rounded" title="Subir" onclick={() => moveLogo(i, -1)} disabled={i === 0}>↑</button>
                <button type="button" class="p-1.5 text-slate-500 hover:bg-slate-200 rounded" title="Bajar" onclick={() => moveLogo(i, 1)} disabled={i === (landing.heroLogos ?? []).length - 1}>↓</button>
                <button type="button" class="p-1.5 text-red-600 hover:bg-red-100 rounded" title="Quitar" onclick={() => removeLogo(i)}>✕</button>
              </div>
            </div>
            {#if !collapsedLogos.has(i)}
            <div class="space-y-3">
              <ImageUploadField
                id="logo-src-{i}"
                label="Imagen del logo"
                value={logo.src}
                onChange={(v) => setLogo(i, 'src', v)}
              />
              <div>
                <label for="logo-alt-{i}" class="cms-label">Texto alternativo (alt)</label>
                <input id="logo-alt-{i}" type="text" class="cms-input mt-1" placeholder="Descripción del logo" value={logo.alt} oninput={(e) => setLogo(i, 'alt', e.target.value)} />
              </div>
              <div>
                <label for="logo-link-{i}" class="cms-label">Enlace / URL (opcional)</label>
                <input id="logo-link-{i}" type="text" class="cms-input mt-1" placeholder="https://ejemplo.com o /pagina/ejemplo" value={logo.link ?? ''} oninput={(e) => setLogo(i, 'link', e.target.value)} />
              </div>
            </div>
            {/if}
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
          <li class="rounded-lg border border-slate-200 bg-slate-50 p-4 transition-opacity {draggingSlide === i ? 'opacity-50' : ''}" draggable="true" ondragstart={() => (draggingSlide = i)} ondragover={(event) => event.preventDefault()} ondrop={() => dropSlide(i)} ondragend={() => (draggingSlide = null)}>
            <div class="mb-2 flex items-center justify-between">
              <div class="flex min-w-0 cursor-grab items-center gap-2 active:cursor-grabbing"><span class="text-slate-400" aria-hidden="true">⠿</span><span class="truncate text-sm font-medium text-slate-600">Tarjeta {i + 1}: {slide.type === 'info' ? (slide.text || 'Sin texto') : (slide.title || slide.alt || 'Sin titulo')}</span></div>
              <div class="flex items-center gap-1">
                <button type="button" class="rounded p-1.5 text-slate-500 hover:bg-slate-200" title={collapsedSlides.has(i) ? 'Mostrar tarjeta' : 'Ocultar tarjeta'} aria-label={collapsedSlides.has(i) ? 'Mostrar tarjeta' : 'Ocultar tarjeta'} onclick={() => toggleSlide(i)}>
                  <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2.5 12s3.5-5 9.5-5 9.5 5 9.5 5-3.5 5-9.5 5-9.5-5-9.5-5Z" /><circle cx="12" cy="12" r="2.5" /></svg>
                </button>
                <button type="button" class="p-1.5 text-slate-500 hover:bg-slate-200 rounded" title="Subir" onclick={() => moveSlide(i, -1)} disabled={i === 0}>↑</button>
                <button type="button" class="p-1.5 text-slate-500 hover:bg-slate-200 rounded" title="Bajar" onclick={() => moveSlide(i, 1)} disabled={i === landing.carouselSlides.length - 1}>↓</button>
                <button type="button" class="p-1.5 text-red-600 hover:bg-red-100 rounded" title="Quitar" onclick={() => removeSlide(i)}>✕</button>
              </div>
            </div>
            {#if !collapsedSlides.has(i)}
            {#if slide.type === 'info'}
              <div class="space-y-2">
                <label class="block">
                  <span class="cms-label">Texto principal de la tarjeta</span>
                  <input type="text" class="cms-input !py-2 text-sm" placeholder="Conecta con experiencias..." value={slide.text} oninput={(e) => setSlide(i, 'text', e.target.value)} />
                </label>
                <label class="block">
                  <span class="cms-label">Texto del botón</span>
                  <input type="text" class="cms-input !py-2 text-sm" placeholder="Descubre más" value={slide.cta} oninput={(e) => setSlide(i, 'cta', e.target.value)} />
                </label>
                <label class="block">
                  <span class="cms-label">Enlace del botón</span>
                  <input type="text" class="cms-input !py-2 text-sm" placeholder="/cursos o https://ejemplo.com" value={slide.ctaLink ?? ''} oninput={(e) => setSlide(i, 'ctaLink', e.target.value)} />
                </label>
                <label class="block">
                  <span class="cms-label">Abrir enlace en</span>
                  <select class="cms-input !py-2 text-sm" value={slide.ctaTarget ?? '_self'} onchange={(e) => setSlide(i, 'ctaTarget', e.target.value)}>
                  <option value="_self">Abrir en la misma pestaña</option>
                  <option value="_blank">Abrir en una nueva pestaña</option>
                  </select>
                </label>
                <label class="block">
                  <span class="cms-label">Texto complementario</span>
                  <input type="text" class="cms-input !py-2 text-sm" placeholder="Línea pequeña debajo" value={slide.sub} oninput={(e) => setSlide(i, 'sub', e.target.value)} />
                </label>
              </div>
            {:else}
              <div class="space-y-2">
                <ImageUploadField
                  compact
                  id="carousel-slide-img-{i}"
                  label="Imagen"
                  value={slide.img}
                  onChange={(v) => setSlide(i, 'img', v)}
                />
                <label class="block">
                  <span class="cms-label">Texto alternativo de la imagen</span>
                  <input type="text" class="cms-input !py-2 text-sm" placeholder="Describe la imagen" value={slide.alt} oninput={(e) => setSlide(i, 'alt', e.target.value)} />
                </label>
                <label class="block">
                  <span class="cms-label">Título de la tarjeta</span>
                  <input type="text" class="cms-input !py-2 text-sm" placeholder="Título" value={slide.title} oninput={(e) => setSlide(i, 'title', e.target.value)} />
                </label>
                <label class="block">
                  <span class="cms-label">Subtítulo de la tarjeta</span>
                  <input type="text" class="cms-input !py-2 text-sm" placeholder="Subtítulo" value={slide.subtitle} oninput={(e) => setSlide(i, 'subtitle', e.target.value)} />
                </label>
                <label class="block">
                  <span class="cms-label">Enlace de la imagen</span>
                  <input type="text" class="cms-input !py-2 text-sm" placeholder="/pagina/ejemplo o https://ejemplo.com" value={slide.link ?? ''} oninput={(e) => setSlide(i, 'link', e.target.value)} />
                </label>
              </div>
            {/if}
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
      <div class="mb-6 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        <p class="font-semibold">Recomendaci&oacute;n para im&aacute;genes</p>
        <p class="mt-1">Usa im&aacute;genes horizontales de <strong>1200 x 800 px (proporci&oacute;n 3:2)</strong>, preferentemente en JPG o PNG. Mant&eacute;n textos y logotipos dentro del &aacute;rea central y evita im&aacute;genes panor&aacute;micas, verticales o cuadradas para conservar una presentaci&oacute;n uniforme.</p>
      </div>
      <div class="mb-6">
        <label for="ciudad-habla-title" class="cms-label">Título de la sección</label>
        <textarea id="ciudad-habla-title" class="cms-input min-h-[60px]" value={landing.ciudadHablaTitle ?? ''} oninput={(e) => setHero('ciudadHablaTitle', e.target.value)} placeholder="La ciudad habla.&#10;¿Ya la escuchaste?"></textarea>
      </div>
      <ul class="space-y-4">
        {#each (landing.ciudadHablaCards ?? []) as card, i}
          <li class="rounded-lg border border-slate-200 bg-slate-50 p-5 transition-opacity {draggingCard === i ? 'opacity-50' : ''}" draggable="true" ondragstart={() => startCardDrag(i)} ondragover={(event) => event.preventDefault()} ondrop={() => dropCard(i)} ondragend={() => (draggingCard = null)}>
            <div class="mb-2 flex items-center justify-between">
              <div class="flex min-w-0 cursor-grab items-center gap-2 active:cursor-grabbing"><span class="text-slate-400" title="Arrastrar para reordenar" aria-hidden="true">⠿</span><span class="truncate text-sm font-medium text-slate-600">Tarjeta {i + 1}: {card.imgAlt || 'Sin Alt'}</span></div>
              <div class="flex items-center gap-1">
                <button type="button" class="rounded p-1.5 text-slate-500 hover:bg-slate-200" title={collapsedCards.has(i) ? 'Mostrar tarjeta' : 'Ocultar tarjeta'} aria-label={collapsedCards.has(i) ? 'Mostrar tarjeta' : 'Ocultar tarjeta'} onclick={() => toggleCard(i)}>
                  <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2.5 12s3.5-5 9.5-5 9.5 5 9.5 5-3.5 5-9.5 5-9.5-5-9.5-5Z" /><circle cx="12" cy="12" r="2.5" /></svg>
                </button>
                <button type="button" class="p-1.5 text-slate-500 hover:bg-slate-200 rounded" title="Subir" onclick={() => moveCard(i, -1)} disabled={i === 0}>↑</button>
                <button type="button" class="p-1.5 text-slate-500 hover:bg-slate-200 rounded" title="Bajar" onclick={() => moveCard(i, 1)} disabled={i === (landing.ciudadHablaCards ?? []).length - 1}>↓</button>
                <button type="button" class="p-1.5 text-red-600 hover:bg-red-100 rounded" title="Quitar" onclick={() => removeCard(i)}>✕</button>
              </div>
            </div>
            {#if !collapsedCards.has(i)}
            <div class="space-y-2">
              <input type="text" class="cms-input !py-2 text-sm" placeholder="Título de la tarjeta" value={card.title} oninput={(e) => setCard(i, 'title', e.target.value)} />
              <textarea class="cms-input !py-2 text-sm min-h-[60px] resize-none overflow-hidden" placeholder="Texto (párrafo)" value={card.text} onfocus={autoGrowTextarea} oninput={(e) => { setCard(i, 'text', e.target.value); autoGrowTextarea(e); }}></textarea>
              <ImageUploadField
                compact
                id="ciudad-card-img-{i}"
                label="Imagen"
                value={card.img}
                onChange={(v) => setCard(i, 'img', v)}
              />
              <input type="text" class="cms-input !py-2 text-sm" placeholder="Alt de la imagen" value={card.imgAlt} oninput={(e) => setCard(i, 'imgAlt', e.target.value)} />
              <input type="text" class="cms-input !py-2 text-sm" placeholder="Enlace / URL de la imagen (opcional)" value={card.imageLink ?? ''} oninput={(e) => setCard(i, 'imageLink', e.target.value)} />
              <input type="text" class="cms-input !py-2 text-sm" placeholder="Enlace / URL del botón (opcional)" value={card.buttonLink ?? ''} oninput={(e) => setCard(i, 'buttonLink', e.target.value)} />
              <input type="text" class="cms-input !py-2 text-sm" placeholder="Texto del botón" value={card.buttonText} oninput={(e) => setCard(i, 'buttonText', e.target.value)} />
              <label class="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={card.imageOnLeft} onchange={(e) => setCard(i, 'imageOnLeft', e.target.checked)} />
                Imagen a la izquierda (escritorio)
              </label>
            </div>
            {/if}
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
          <li class="rounded-lg border border-slate-200 bg-slate-50 p-5 transition-opacity {draggingLocation === i ? 'opacity-50' : ''}" draggable="true" ondragstart={() => (draggingLocation = i)} ondragover={(event) => event.preventDefault()} ondrop={() => dropLocation(i)} ondragend={() => (draggingLocation = null)}>
            <div class="mb-3 flex items-center justify-between gap-2">
              <div class="flex min-w-0 cursor-grab items-center gap-2 active:cursor-grabbing"><span class="text-slate-400" aria-hidden="true">⠿</span><span class="truncate text-sm font-medium text-slate-600">Ubicaci&oacute;n {i + 1}: {loc.name || 'Sin nombre'}</span></div>
              <div class="flex items-center gap-1">
                <button type="button" class="rounded p-1.5 text-slate-500 hover:bg-slate-200" title={collapsedLocations.has(i) ? 'Mostrar ubicacion' : 'Ocultar ubicacion'} aria-label={collapsedLocations.has(i) ? 'Mostrar ubicacion' : 'Ocultar ubicacion'} onclick={() => toggleLocation(i)}>
                  <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2.5 12s3.5-5 9.5-5 9.5 5 9.5 5-3.5 5-9.5 5-9.5-5-9.5-5Z" /><circle cx="12" cy="12" r="2.5" /></svg>
                </button>
                <button type="button" class="p-1.5 text-slate-500 hover:bg-slate-200 rounded" title="Subir" onclick={() => moveLocation(i, -1)} disabled={i === 0}>↑</button>
                <button type="button" class="p-1.5 text-slate-500 hover:bg-slate-200 rounded" title="Bajar" onclick={() => moveLocation(i, 1)} disabled={i === (landing.locations ?? []).length - 1}>↓</button>
                <button type="button" class="p-1.5 text-red-600 hover:bg-red-100 rounded" title="Quitar" onclick={() => removeLocation(i)}>×</button>
              </div>
            </div>
            {#if !collapsedLocations.has(i)}
            <div class="flex flex-wrap items-center gap-2">
            <div class="flex-1 min-w-[200px] space-y-2">
              <input type="text" class="cms-input !py-2 text-sm" placeholder="Nombre del lugar" value={loc.name} oninput={(e) => setLocation(i, 'name', e.target.value)} />
              <input type="text" class="cms-input !py-2 text-sm" placeholder="Dirección" value={loc.address} oninput={(e) => setLocation(i, 'address', e.target.value)} />
              <input type="text" class="cms-input !py-2 text-sm" placeholder="Enlace de Google Maps (opcional)" value={loc.mapsUrl ?? ''} oninput={(e) => setLocation(i, 'mapsUrl', e.target.value)} />
              <ImageUploadField
                compact
                id="location-map-image-{i}"
                label="Imagen de ubicación"
                value={loc.mapImage ?? ''}
                requiredWidth={300}
                requiredHeight={300}
                onChange={(v) => setLocation(i, 'mapImage', v)}
              />
            </div>
            <div class="hidden">
              <button type="button" class="p-2 text-slate-500 hover:bg-slate-200 rounded" title="Subir" onclick={() => moveLocation(i, -1)} disabled={i === 0}>↑</button>
              <button type="button" class="p-2 text-slate-500 hover:bg-slate-200 rounded" title="Bajar" onclick={() => moveLocation(i, 1)} disabled={i === (landing.locations ?? []).length - 1}>↓</button>
              <button type="button" class="p-2 text-red-600 hover:bg-red-100 rounded" title="Quitar" onclick={() => removeLocation(i)}>✕</button>
            </div>
            </div>
            {/if}
          </li>
        {/each}
      </ul>
      <button type="button" class="mt-3 cms-btn-secondary !py-2 !px-3 text-sm" onclick={addLocation}>+ Añadir ubicación</button>
    </section>

    {:else if activeTab === 'socials'}
    <section class="cms-card p-8">
      <div class="flex items-center justify-between gap-3 mb-6">
        <div><h3 class="text-base font-semibold text-slate-800">Redes sociales</h3><p class="text-sm text-slate-500 mt-1">Administra los enlaces del pie de página.</p></div>
        <button class="cms-btn-primary" onclick={() => saveSection('socials')} disabled={savingSection === 'socials'}>{savingSection === 'socials' ? 'Guardando…' : 'Guardar'}</button>
      </div>
        {#if savedSection === 'socials'}
          <p class="mb-4 text-sm font-medium text-green-600" role="status">
            Guardado exitosamente
          </p>
        {/if}
      <div class="space-y-3">
        {#each socialLinks as social, i}
            <div class="relative rounded-lg border border-slate-200 bg-slate-50 p-4 transition-opacity {draggingSocial === i ? 'opacity-50' : ''}" draggable="true" ondragstart={() => (draggingSocial = i)} ondragover={(event) => event.preventDefault()} ondrop={() => dropSocial(i)} ondragend={() => (draggingSocial = null)}>
              <div class="mb-3 flex items-center justify-between gap-2">
                <div class="flex min-w-0 cursor-grab items-center gap-2 active:cursor-grabbing"><span class="text-slate-400" aria-hidden="true">⠿</span><span class="truncate text-sm font-medium text-slate-600">Red social {i + 1}: {social.label || 'Sin nombre'}</span></div>
                <div class="flex items-center gap-1">
                  <button type="button" class="rounded p-1.5 text-slate-500 hover:bg-slate-200" title={collapsedSocials.has(i) ? 'Mostrar red social' : 'Ocultar red social'} aria-label={collapsedSocials.has(i) ? 'Mostrar red social' : 'Ocultar red social'} onclick={() => toggleSocial(i)}>
                    <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2.5 12s3.5-5 9.5-5 9.5 5 9.5 5-3.5 5-9.5 5-9.5-5-9.5-5Z" /><circle cx="12" cy="12" r="2.5" /></svg>
                  </button>
                  <button type="button" class="rounded p-1.5 text-slate-500 hover:bg-slate-200 disabled:opacity-40" title="Subir" aria-label="Subir" onclick={() => moveSocial(i, -1)} disabled={i === 0}>↑</button>
                  <button type="button" class="rounded p-1.5 text-slate-500 hover:bg-slate-200 disabled:opacity-40" title="Bajar" aria-label="Bajar" onclick={() => moveSocial(i, 1)} disabled={i === socialLinks.length - 1}>↓</button>
                  <button type="button" class="rounded p-1.5 text-red-600 hover:bg-red-100" title="Quitar" onclick={() => socialDeleteIndex = i}>×</button>
                </div>
              </div>
              {#if !collapsedSocials.has(i)}
              <div class="flex flex-col gap-3">
              <div class="flex flex-col items-stretch gap-3 pr-10">
                <input class="cms-input w-full" value={social.label} placeholder="Nombre de la red social" oninput={(e) => { social.label = e.currentTarget.value; socialLinks = [...socialLinks]; }} />
                <input class="cms-input w-full" value={social.url} placeholder="https://ejemplo.com/perfil" oninput={(e) => { social.url = e.currentTarget.value; socialLinks = [...socialLinks]; }} />
              </div>
              <ImageUploadField
                compact
                id="social-icon-{i}"
                label="Icono de la red social (obligatorio)"
                value={social.icon}
                requiredWidth={128}
                requiredHeight={128}
                onChange={(value) => { social.icon = value; socialLinks = [...socialLinks]; }}
              />
              <p class="text-xs text-slate-500">Medida obligatoria: 128 × 128 píxeles. Recomendado: PNG con fondo transparente.</p>
              </div>
              {/if}
            </div>
            {#if socialDeleteIndex !== null}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
    <div class="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
      <h2 class="text-lg font-semibold text-slate-800">¿Eliminar esta red social?</h2>
      <p class="mt-2 text-sm text-slate-600">La tarjeta se quitará de la configuración. Esta acción no se puede deshacer.</p>
      <div class="mt-5 flex justify-end gap-2">
        <button type="button" class="cms-btn-secondary" onclick={() => socialDeleteIndex = null}>Cancelar</button>
        <button type="button" class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700" onclick={confirmRemoveSocial}>Eliminar</button>
      </div>
    </div>
  </div>
{/if}
        {/each}
      </div>
      <button class="cms-btn-secondary mt-4" onclick={addSocial}>+ Agregar red social</button>
    </section>
    {/if}
  {/if}
</div>
