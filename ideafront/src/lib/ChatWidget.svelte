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

<div class="rounded-xl border border-slate-200 bg-white shadow-sm">
  <div class="border-b border-slate-200 bg-slate-50 px-4 py-3">
    <h2 class="font-semibold text-slate-800">Bolsa de Trabajo IDEA</h2>
    <p class="text-xs text-slate-500">Asistente de búsqueda de empleo</p>
  </div>
  <div class="flex h-80 flex-col overflow-hidden">
    <div class="flex-1 space-y-3 overflow-y-auto p-4">
      {#each messages as msg}
        <div
          class="max-w-[85%] rounded-lg px-3 py-2 text-sm {msg.role === 'user'
            ? 'ml-auto bg-sky-600 text-white'
            : 'bg-slate-100 text-slate-800'}"
        >
          {msg.content}
        </div>
      {/each}
      {#if loading}
        <div class="text-sm text-slate-500">Escribiendo...</div>
      {/if}
    </div>
    <form on:submit|preventDefault={send} class="border-t border-slate-200 p-3">
      <div class="flex gap-2">
        <input
          type="text"
          bind:value={input}
          placeholder="Escribe tu mensaje..."
          class="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
        />
        <button
          type="submit"
          disabled={loading}
          class="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
        >
          Enviar
        </button>
      </div>
    </form>
  </div>
</div>
