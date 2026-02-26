<script>
  let messages = [
    { role: 'assistant', content: 'Hola, soy el asistente de la Bolsa de Empleo. ¿En qué te puedo ayudar?' },
  ];
  let input = '';
  let loading = false;

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    input = '';
    messages = [...messages, { role: 'user', content: text }];
    loading = true;
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });
      const data = await res.json();
      messages = [...messages, { role: 'assistant', content: data.content || 'Sin respuesta.' }];
    } catch (e) {
      messages = [...messages, { role: 'assistant', content: 'Error de conexión. Revisa que el backend esté en marcha.' }];
    } finally {
      loading = false;
    }
  }
</script>

<div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
  <div class="flex items-center gap-3 border-b border-white/10 bg-gradient-to-br from-idea-navy to-idea-dark px-4 py-4 text-white">
    <img
      src="/assets/mascota/chambabot.png"
      alt="Chambabot"
      class="h-12 w-12 shrink-0 rounded-full object-contain ring-2 ring-white/30 sm:h-14 sm:w-14"
    />
    <div>
      <h2 class="font-bold uppercase tracking-wide">Chambabot · Bolsa de Trabajo</h2>
      <p class="mt-0.5 text-xs text-white/80">Tu asistente para buscar empleo</p>
    </div>
  </div>
  <div class="flex min-h-[420px] flex-col overflow-hidden sm:min-h-[480px]">
    <div class="flex min-h-0 flex-1 flex-col justify-start overflow-y-auto pt-3 pb-4 px-4 space-y-4">
      {#each messages as msg}
        {#if msg.role === 'user'}
          <div class="flex justify-end">
            <div class="max-w-[85%] rounded-xl bg-idea-bright px-4 py-2.5 text-sm text-white">
              {msg.content}
            </div>
          </div>
        {:else}
          <div class="flex gap-3">
            <img
              src="/assets/mascota/chambabot.png"
              alt="Chambabot"
              class="h-10 w-10 shrink-0 rounded-full object-contain ring-2 ring-idea-bright/20 sm:h-12 sm:w-12"
            />
            <div class="min-w-0 flex-1 rounded-xl bg-slate-100 px-4 py-2.5 text-sm text-slate-800">
              {msg.content}
            </div>
          </div>
        {/if}
      {/each}
      {#if loading}
        <div class="flex gap-3">
          <img
            src="/assets/mascota/chambabot.png"
            alt="Chambabot"
            class="h-10 w-10 shrink-0 rounded-full object-contain ring-2 ring-idea-bright/20 sm:h-12 sm:w-12"
          />
          <div class="flex items-center text-sm text-slate-500">Escribiendo...</div>
        </div>
      {/if}
    </div>
    <form on:submit|preventDefault={send} class="border-t border-slate-200 bg-slate-50/50 p-3">
      <div class="flex gap-2">
        <input
          type="text"
          bind:value={input}
          placeholder="Escribe tu mensaje..."
          class="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:border-idea-bright focus:outline-none focus:ring-2 focus:ring-idea-bright/30"
        />
        <button
          type="submit"
          disabled={loading}
          class="rounded-xl bg-idea-bright px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-95 disabled:opacity-50"
        >
          Enviar
        </button>
      </div>
    </form>
  </div>
</div>
