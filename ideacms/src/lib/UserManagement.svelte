<script>
  import { getCmsUsers, createCmsUser } from './api.js';

  let list = $state([]);
  let loading = $state(true);
  let error = $state('');
  let message = $state('');
  let saving = $state(false);
  let firstName = $state('');
  let lastName = $state('');
  let email = $state('');
  let password = $state('');

  async function load() {
    loading = true;
    error = '';
    try {
      list = await getCmsUsers();
    } catch (e) {
      error = e.message;
      list = [];
    } finally {
      loading = false;
    }
  }

  async function submit(ev) {
    ev?.preventDefault();
    if (!email.trim() || !password.trim()) {
      error = 'Correo y contraseña son obligatorios.';
      return;
    }
    if (password.length < 8) {
      error = 'La contraseña debe tener al menos 8 caracteres.';
      return;
    }
    saving = true;
    error = '';
    message = '';
    try {
      await createCmsUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
      });
      message = 'Usuario creado. Podrá iniciar sesión y cambiar su contraseña después.';
      firstName = '';
      lastName = '';
      email = '';
      password = '';
      setTimeout(() => { message = ''; }, 4000);
      await load();
    } catch (e) {
      error = e.message;
    } finally {
      saving = false;
    }
  }

  $effect(() => {
    load();
  });
</script>

<div class="space-y-6">
  <div class="cms-card p-8">
    <h3 class="text-base font-semibold text-slate-800 mb-2">Crear usuario del CMS</h3>
    <p class="text-sm text-slate-500 mb-6">
      Añade nombre, correo y una contraseña temporal. El usuario podrá iniciar sesión y cambiarla después.
    </p>
    {#if message}
      <p class="mb-4 py-2 px-3 rounded-lg bg-green-50 text-green-800 text-sm border border-green-200" role="status">{message}</p>
    {/if}
    {#if error}
      <p class="mb-4 py-2 px-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200" role="alert">{error}</p>
    {/if}
    <form onsubmit={submit} class="space-y-5 max-w-xl">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label for="user-first-name" class="cms-label">Nombre</label>
          <input
            id="user-first-name"
            type="text"
            class="cms-input mt-1"
            placeholder="Ej. María"
            bind:value={firstName}
          />
        </div>
        <div>
          <label for="user-last-name" class="cms-label">Apellido</label>
          <input
            id="user-last-name"
            type="text"
            class="cms-input mt-1"
            placeholder="Ej. García"
            bind:value={lastName}
          />
        </div>
      </div>
      <div>
        <label for="user-email" class="cms-label">Correo electrónico</label>
        <input
          id="user-email"
          type="email"
          class="cms-input mt-1"
          placeholder="usuario@ejemplo.com"
          bind:value={email}
          required
        />
      </div>
      <div>
        <label for="user-password" class="cms-label">Contraseña temporal</label>
        <input
          id="user-password"
          type="password"
          class="cms-input mt-1"
          placeholder="Mínimo 8 caracteres"
          bind:value={password}
          minlength="8"
          required
        />
        <p class="text-xs text-slate-500 mt-1">El usuario podrá cambiarla al iniciar sesión.</p>
      </div>
      <button type="submit" class="cms-btn-primary" disabled={saving}>
        {saving ? 'Creando…' : 'Crear usuario'}
      </button>
    </form>
  </div>

  <div class="cms-card p-8">
    <h3 class="text-base font-semibold text-slate-800 mb-2">Usuarios que pueden acceder al CMS</h3>
    <p class="text-sm text-slate-500 mb-6">Lista de usuarios que pueden iniciar sesión en el panel.</p>
    {#if loading}
      <div class="space-y-2">
        {#each [1, 2, 3] as _}
          <div class="h-12 rounded-lg bg-slate-100 animate-pulse"></div>
        {/each}
      </div>
    {:else if list.length === 0}
      <p class="text-slate-500 text-sm">Aún no hay usuarios. Crea el primero con el formulario de arriba.</p>
    {:else}
      <ul class="divide-y divide-slate-100">
        {#each list as u}
          <li class="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
            <div class="min-w-0 flex-1">
              <p class="font-medium text-slate-800 truncate">
                {[u.firstName, u.lastName].filter(Boolean).join(' ') || '—'}
              </p>
              <p class="text-sm text-slate-500 truncate">{u.email}</p>
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>
