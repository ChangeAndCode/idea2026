<script>
  import { uploadImage } from './api.js';
  import { mediaUrl } from './media.js';

  /**
   * @typedef {Object} Props
   * @property {string} [label]
   * @property {string} [id]
   * @property {string} value
   * @property {(v: string) => void} onChange
   * @property {boolean} [compact]
   */

  /** @type {Props} */
  let { label = '', id = '', value = '', onChange, compact = false } = $props();

  let uploading = $state(false);
  let fileInput = $state(/** @type {HTMLInputElement | null} */ (null));

  async function onFile(/** @type {Event & { currentTarget: HTMLInputElement }} */ e) {
    const f = e.currentTarget?.files?.[0];
    if (!f) return;
    uploading = true;
    try {
      const data = await uploadImage(f);
      if (data?.path) onChange?.(data.path);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al subir');
    } finally {
      uploading = false;
      e.currentTarget.value = '';
    }
  }
</script>

<div class={compact ? 'space-y-1.5' : 'space-y-2'}>
  {#if label}
    <p class="cms-label">{label}</p>
  {/if}
  {#if value}
    <div class="mb-1">
      <img
        src={mediaUrl(value)}
        alt="Vista previa"
        class="max-w-full rounded border border-slate-200 object-contain {compact ? 'max-h-20' : 'max-h-24'}"
      />
    </div>
  {/if}
  <div class="flex flex-wrap items-center gap-2">
    <input
      id={id || undefined}
      bind:this={fileInput}
      type="file"
      accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
      class="hidden"
      onchange={onFile}
    />
    <button
      type="button"
      class="cms-btn-secondary shrink-0 whitespace-nowrap {compact ? '!py-2 !px-3 text-sm' : ''}"
      onclick={() => fileInput?.click()}
      disabled={uploading}
    >
      {uploading ? 'Subiendo…' : 'Subir imagen'}
    </button>
  </div>
</div>
