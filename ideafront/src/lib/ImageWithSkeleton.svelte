<script>
  import Skeleton from './Skeleton.svelte';

  export let src = '';
  export let alt = '';
  export let className = '';
  export let wrapperClass = 'relative';
  export let eager = false;

  let loaded = false;
  let failed = false;
  let previousSrc = '';

  $: if (src !== previousSrc) {
    previousSrc = src;
    loaded = false;
    failed = false;
  }
</script>

<span class={`${wrapperClass} flex items-center justify-center`}>
  {#if !loaded && !failed}
    <Skeleton className="absolute inset-0 h-full w-full" label={`Cargando ${alt || 'imagen'}`} />
  {/if}
  {#if failed}
    <span class="flex min-h-[5rem] w-full items-center justify-center bg-slate-100 px-3 text-center text-xs text-slate-500" role="img" aria-label={alt || 'Imagen no disponible'}>
      Imagen no disponible
    </span>
  {:else}
    <img
      src={src}
      {alt}
      loading={eager ? 'eager' : 'lazy'}
      on:load={() => (loaded = true)}
      on:error={() => { failed = true; loaded = false; }}
      class={`${className} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
    />
  {/if}
</span>
