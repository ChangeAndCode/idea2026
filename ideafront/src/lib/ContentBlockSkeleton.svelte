<script>
  import Skeleton from './Skeleton.svelte';

  export let type = 'text';
  export let align = 'left';
  export let width = '500';

  $: justify = align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start';
  $: widthClass = width ? `max-w-[${width}px]` : 'max-w-full';
</script>

{#if type === 'text'}
  <div class="space-y-3" aria-label="Cargando texto">
    <Skeleton className="h-4 w-full bg-white/20" />
    <Skeleton className="h-4 w-11/12 bg-white/20" />
    <Skeleton className="h-4 w-4/5 bg-white/20" />
    <Skeleton className="h-4 w-full bg-white/20" />
    <Skeleton className="h-4 w-3/4 bg-white/20" />
  </div>
{:else if type === 'image'}
  <div class={`flex ${justify} rounded-lg bg-white/10 p-4`} aria-label="Cargando imagen">
    <Skeleton className={`h-48 w-full ${widthClass} bg-white/20 sm:h-64`} />
  </div>
{:else if type === 'carousel'}
  <div class="rounded-lg bg-white p-4" aria-label="Cargando carrusel">
    <Skeleton className="h-48 w-full sm:h-64" />
    <Skeleton className="mx-auto mt-4 h-5 w-2/3" />
    <div class="mt-4 flex justify-center gap-2">
      <Skeleton className="h-2 w-9" />
      <Skeleton className="h-2 w-9" />
      <Skeleton className="h-2 w-9" />
    </div>
  </div>
{:else if type === 'button'}
  <div class="flex" aria-label="Cargando botón">
    <Skeleton className="h-12 w-36 rounded-lg bg-white/20" />
  </div>
{/if}
