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
   * @property {number} [requiredWidth]
   * @property {number} [requiredHeight]
   */

  /** @type {Props} */
  let { label = '', id = '', value = '', onChange, compact = false, requiredWidth = 0, requiredHeight = 0 } = $props();

  let uploading = $state(false);
  let fileInput = $state(/** @type {HTMLInputElement | null} */ (null));

  async function onFile(/** @type {Event & { currentTarget: HTMLInputElement }} */ e) {
    const f = e.currentTarget?.files?.[0];
    if (!f) return;
    uploading = true;
    try {
      if (requiredWidth > 0 && requiredHeight > 0) {
        const dimensions = await new Promise((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
          image.onerror = () => reject(new Error('No se pudo leer la imagen'));
          image.src = URL.createObjectURL(f);
        });
        if (dimensions.width !== requiredWidth || dimensions.height !== requiredHeight) {
          throw new Error(`La imagen debe medir exactamente ${requiredWidth} x ${requiredHeight} píxeles.`);
        }
      }
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
  {#if requiredWidth > 0 && requiredHeight > 0}
    <p class="text-xs text-slate-500">Tamaño requerido: {requiredWidth} × {requiredHeight} px.</p>
  {/if}
  {#if value}
    <div class="relative mb-1 w-fit">
      <img
        src={mediaUrl(value)}
        alt="Vista previa"
        class="max-w-full rounded border border-slate-200 object-contain {compact ? 'max-h-20' : 'max-h-24'}"
      />
      <button
        type="button"
        class="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-red-200 bg-white text-lg leading-none text-red-600 shadow-sm transition hover:bg-red-50"
        aria-label="Quitar imagen"
        title="Quitar imagen"
        onclick={() => onChange?.('')}
      >
        ×
      </button>
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
