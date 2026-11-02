<script>
  let { open = false, title = 'Aviso', message = '', onClose = () => {} } = $props();
</script>

{#if open}
  <div class="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 p-4" role="presentation">
    <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" role="alertdialog" aria-modal="true" aria-labelledby="notice-modal-title">
      <h2 id="notice-modal-title" class="text-xl font-semibold text-slate-800">{title}</h2>
      <p class="mt-3 text-sm leading-relaxed text-slate-600">{message}</p>
      <div class="mt-6 flex justify-end">
        <button type="button" class="cms-btn-primary" onclick={onClose}>Cerrar</button>
      </div>
    </div>
  </div>
{/if}
