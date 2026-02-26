<script>
  import ChatWidget from '../ChatWidget.svelte';
  import JobSearch from '../JobSearch.svelte';
</script>

<!-- Hero tipo landing: mismo estilo que Home -->
<section class="relative -mt-1 overflow-hidden bg-idea-dark pt-8 pb-16 text-white shadow-[0_12px_40px_-8px_rgba(0,0,0,0.25)] sm:pt-10 sm:pb-20">
  <div class="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 md:px-10">
    <h1 class="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
      Bolsa de Empleo
    </h1>
    <p class="mt-4 max-w-2xl text-lg text-white/95 sm:text-xl">
      Conectamos talento con oportunidades. Busca vacantes o habla con el asistente.
    </p>
  </div>
  <!-- Curva inferior (igual que Home) -->
  <div class="absolute bottom-0 left-0 right-0 h-24 w-full pointer-events-none md:h-28" aria-hidden="true">
    <svg class="absolute bottom-0 left-0 block h-full w-full text-white md:hidden" viewBox="0 0 1440 100" fill="currentColor" preserveAspectRatio="none">
      <path d="M0 0 Q720 88 1440 0 L1440 100 L0 100 Z" />
    </svg>
    <svg class="absolute bottom-0 left-0 hidden h-full w-full text-white md:block" viewBox="0 0 1440 100" fill="currentColor" preserveAspectRatio="none">
      <path d="M0 0 Q720 128 1440 0 L1440 100 L0 100 Z" />
    </svg>
  </div>
</section>

<div class="relative z-0 h-8 bg-white sm:h-10" aria-hidden="true"></div>

<!-- Contenido: buscador a la izquierda, chat a la derecha (chat más ancho) -->
<div class="mx-auto max-w-7xl px-5 pb-16 sm:px-8 md:px-10">
  <div class="grid gap-8 lg:grid-cols-3">
    <div>
      <JobSearch />
    </div>
    <div class="lg:col-span-2">
      <ChatWidget />
    </div>
  </div>
</div>
