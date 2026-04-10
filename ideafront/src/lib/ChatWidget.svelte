<script>
  import { tick } from 'svelte';
  import { apiUrl } from './api.js';

  let messages = [
    { role: 'assistant', content: 'Hola, soy el asistente de la Bolsa de Empleo. ¿En qué te puedo ayudar?' },
  ];
  let input = '';
  let loading = false;
  /** @type {HTMLDivElement | undefined} */
  let scrollEl;

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /** Segmento sin enlaces Markdown: URLs sueltas, **negrita**. */
  function formatPlainSegment(seg) {
    if (!seg) return '';
    const urlRe = /(https?:\/\/[^\s<>"']+)/gi;
    const parts = seg.split(urlRe);
    return parts
      .map((part) => {
        if (/^https?:\/\//i.test(part)) {
          const safe = escapeHtml(part);
          return `<a href="${safe}" target="_blank" rel="noopener noreferrer">${safe}</a>`;
        }
        let t = escapeHtml(part);
        t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        t = t.replace(/\n/g, '<br />');
        return t;
      })
      .join('');
  }

  /** Markdown [texto](url), URLs sueltas y **negrita** (texto escapado). */
  function assistantContentHtml(raw) {
    if (!raw) return '';
    const s = String(raw);
    const mdLinkRe = /\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g;
    let out = '';
    let last = 0;
    let m;
    while ((m = mdLinkRe.exec(s)) !== null) {
      out += formatPlainSegment(s.slice(last, m.index));
      const label = escapeHtml(m[1]);
      const href = escapeHtml(m[2]);
      const inner = label || href;
      out += `<a href="${href}" target="_blank" rel="noopener noreferrer">${inner}</a>`;
      last = m.lastIndex;
    }
    out += formatPlainSegment(s.slice(last));
    return out;
  }

  async function scrollToBottom() {
    await tick();
    scrollEl?.scrollTo({ top: scrollEl.scrollHeight, behavior: 'smooth' });
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    input = '';
    messages = [...messages, { role: 'user', content: text }];
    await scrollToBottom();
    loading = true;
    await scrollToBottom();
    try {
      const res = await fetch(apiUrl('/api/chat'), {
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
      await scrollToBottom();
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
  <div
    class="flex min-h-[420px] max-h-[min(70vh,36rem)] flex-col overflow-hidden sm:min-h-[480px] sm:max-h-[min(75vh,40rem)]"
  >
    <div
      bind:this={scrollEl}
      class="chat-scroll flex min-h-0 flex-1 flex-col justify-start overflow-y-auto overflow-x-hidden overscroll-contain pt-3 pb-4 px-4 space-y-4"
    >
      {#each messages as msg}
        {#if msg.role === 'user'}
          <div class="flex justify-end">
            <div class="max-w-[85%] whitespace-pre-wrap break-words rounded-xl bg-idea-bright px-4 py-2.5 text-sm text-white">
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
            <div
              class="assistant-msg min-w-0 flex-1 break-words rounded-xl bg-slate-100 px-4 py-2.5 text-sm text-slate-800"
            >
              {@html assistantContentHtml(msg.content)}
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

<style>
  .assistant-msg :global(a) {
    color: #007bff;
    font-weight: 600;
    text-decoration: underline;
    word-break: break-word;
  }
  .assistant-msg :global(a:hover) {
    opacity: 0.9;
  }
  .assistant-msg :global(strong) {
    font-weight: 700;
    color: #0f172a;
  }
  .chat-scroll {
    scrollbar-gutter: stable;
  }
</style>
