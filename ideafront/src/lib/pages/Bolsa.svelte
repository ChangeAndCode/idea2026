<script>
  import ChatWidget from '../ChatWidget.svelte';
  import JobSearch from '../JobSearch.svelte';
</script>

<div class="space-y-8">
  <div class="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
    <h1 class="text-2xl font-bold text-slate-800 md:text-3xl">
      Bolsa de Empleo del Municipio de Chihuahua
    </h1>
    <p class="mt-2 text-slate-600">
      Conectamos talento con oportunidades. Busca vacantes o habla con el asistente.
    </p>
  </div>

  <div class="grid gap-8 lg:grid-cols-3">
    <div class="lg:col-span-2">
      <JobSearch />
    </div>
    <div>
      <ChatWidget />
    </div>
  </div>
</div>
