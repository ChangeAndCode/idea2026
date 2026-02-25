<script>
  import { page } from './stores/router.js';
  import Layout from './lib/Layout.svelte';
  import Home from './lib/pages/Home.svelte';
  import Bolsa from './lib/pages/Bolsa.svelte';
  import Page from './lib/pages/Page.svelte';

  $: path = $page.path || '/';
  $: slug = $page.slug || '';
  $: isCmsPage = path.startsWith('/pagina/');

  $: Component = isCmsPage ? Page : (path === '/bolsa' ? Bolsa : path === '/' ? Home : null);
</script>

<Layout>
  {#if Component}
    <svelte:component this={Component} slug={slug} />
  {:else}
    <p class="p-8 text-center text-slate-500">Página no encontrada</p>
  {/if}
</Layout>
