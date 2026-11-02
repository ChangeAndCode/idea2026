<script>
  let { open = false, title = 'Enlace', value = '', error = '', allowRemove = false, onSave = () => {}, onCancel = () => {}, onRemove = () => {} } = $props();
  let draft = $state(value);
  $effect(() => { if (open) draft = value ?? ''; });
</script>

{#if open}
  <div class="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4" role="presentation" onclick={(event) => event.target === event.currentTarget && onCancel()}>
    <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="url-modal-title">
      <div class="flex items-start justify-between gap-4">
        <div><h2 id="url-modal-title" class="text-xl font-semibold text-slate-800">{title}</h2><p class="mt-1 text-sm text-slate-500">Acepta una URL externa o una ruta interna como <code>/pagina/ejemplo</code>.</p></div>
      </div>
      {#if error}
        <p class="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>
      {:else}
        <label for="url-modal-input" class="mt-5 block text-sm font-medium text-slate-700">URL</label>
        <input id="url-modal-input" class="cms-input mt-2 w-full" type="text" bind:value={draft} placeholder="https://ejemplo.com o /pagina/ejemplo" autofocus onkeydown={(event) => event.key === 'Enter' && onSave(draft)} />
      {/if}
      <div class="mt-6 flex flex-wrap justify-end gap-2">
        {#if allowRemove && !error}<button type="button" class="cms-btn-secondary mr-auto !border-red-200 !text-red-600" onclick={onRemove}>Quitar enlace</button>{/if}
        <button type="button" class="cms-btn-secondary" onclick={onCancel}>Cerrar</button>
        {#if !error}<button type="button" class="cms-btn-primary" onclick={() => onSave(draft)}>Guardar</button>{/if}
      </div>
    </div>
  </div>
{/if}
