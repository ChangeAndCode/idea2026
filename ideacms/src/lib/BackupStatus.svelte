<script>
  import { onMount } from 'svelte';
  import { getBackupStatus, getBackupHistory } from './api.js';

  let status = $state(null);
  let history = $state([]);
  let error = $state('');
  let loading = $state(true);

  async function load() {
    loading = true;
    error = '';
    try {
      [status, history] = await Promise.all([getBackupStatus(), getBackupHistory()]);
    } catch (e) { error = e.message || 'No se pudo consultar el estado de respaldos.'; }
    finally { loading = false; }
  }

  onMount(load);
  const ok = $derived(status?.status === 'success');
</script>

<section class="space-y-6">
  <div class="flex items-center justify-between">
    <div><h3 class="text-xl font-semibold text-slate-800">Respaldos del sistema</h3><p class="text-sm text-slate-500">Estado e historial de ejecuciones.</p></div>
    <button class="cms-btn-primary" type="button" onclick={load}>Actualizar</button>
  </div>
  {#if loading}<p class="text-slate-500">Consultando respaldos...</p>
  {:else if error}<div class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
  {:else}
    <div class={`rounded-xl border p-5 ${ok ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
      <p class="text-sm font-medium">Último estado</p>
      <p class="mt-1 text-2xl font-bold">{ok ? 'Correcto' : status?.status === 'failure' ? 'Con errores' : 'Sin ejecuciones'}</p>
      {#if status?.createdAt}<p class="mt-2 text-sm">Fecha: {new Date(status.createdAt).toLocaleString()}</p>{/if}
      {#if status?.error}<p class="mt-2 text-sm">Error: {status.error}</p>{/if}
      {#if status?.collections !== undefined}<p class="mt-2 text-sm">Colecciones: {status.collections} · Archivos: {status.files}</p>{/if}
    </div>
    <div class="overflow-x-auto rounded-xl bg-white shadow-sm"><table class="w-full text-left text-sm"><thead class="bg-slate-50"><tr><th class="p-3">Fecha</th><th class="p-3">Tipo</th><th class="p-3">Estado</th><th class="p-3">Detalle</th></tr></thead><tbody>{#each history as item}<tr class="border-t"><td class="p-3">{new Date(item.createdAt).toLocaleString()}</td><td class="p-3">{item.type}</td><td class={`p-3 font-medium ${item.status === 'success' ? 'text-green-700' : 'text-red-700'}`}>{item.status}</td><td class="p-3">{item.error ? item.error : item.type === 'cleanup' ? `${item.mode || ''} · local: ${item.local?.candidates ?? 0} · externo: ${item.external?.candidates ?? 0}` : `${item.collections ?? '-'} colecciones / ${item.files ?? '-'} archivos`}</td></tr>{:else}<tr><td class="p-3 text-slate-500" colspan="4">Sin historial.</td></tr>{/each}</tbody></table></div>
  {/if}
</section>
