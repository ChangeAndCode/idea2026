<script>
  import { getCmsUsers, createCmsUser, deleteCmsUser } from './api.js';

  let list = $state([]);
  let loading = $state(true);
  let error = $state('');
  let message = $state('');
  let saving = $state(false);
  let firstName = $state('');
  let lastName = $state('');
  let email = $state('');
  let password = $state('');

  let showDeleteModal = $state(false);
  let userToDelete = $state(null);
  let deletingUser = $state(false);

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

  function openDeleteModal(user) {
    userToDelete = user;
    showDeleteModal = true;
  }

  function closeDeleteModal() {
    if (deletingUser) return;
    showDeleteModal = false;
    userToDelete = null;
  }

  async function confirmDeleteUser() {
    if (!userToDelete?.id) return;
    deletingUser = true;
    error = '';
    message = '';
    try {
      await deleteCmsUser(userToDelete.id);
      message = 'Usuario eliminado correctamente.';
      showDeleteModal = false;
      userToDelete = null;
      await load();
    } catch (e) {
      error = e.message;
    } finally {
      deletingUser = false;
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
      <div class="flex items-center justify-between gap-4 py-4 font-semibold text-slate-800">
        <div>
          Usuario
        </div>
        <div>
          Acciones
        </div>
      </div>
      <ul class="divide-y divide-slate-100">
        {#each list as u}
          <li class="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
            <div class="min-w-0 flex-1">
              <p class="font-medium text-slate-800 truncate">
                {[u.firstName, u.lastName].filter(Boolean).join(' ') || '—'}
              </p>
              <p class="text-sm text-slate-500 truncate">{u.email}</p>
            </div>
            <div class="flex gap-2">
              <button class="flex justify-center items-center w-10 h-10 border-2 border-green-500 rounded-lg text-green-600  hover:bg-green-500 hover:text-white" aria-label="Suspender Usuario" title="Suspender">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                </button>
              <button type="button" class="flex justify-center items-center  w-10 h-10 border-2 border-red-500 rounded-lg text-red-500 hover:bg-red-500 hover:text-white" aria-label="Eliminar Usuario" title="Eliminar"
              onclick={()=> openDeleteModal(u)}>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-3h4m-4 0a1 1 0 00-1 1v1h6V5a1 1 0 00-1-1m-4 0h4" />
              </svg>
              </button>
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
  {#if showDeleteModal}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h4 class="text-lg font-semibold text-slate-800">Eliminar usuario</h4>

        <p class="mt-3 text-sm text-slate-600">
          ¿Seguro que quieres eliminar a
          <span class="font-semibold text-slate-800">
            {[userToDelete?.firstName, userToDelete?.lastName].filter(Boolean).join(' ') || userToDelete?.email}
          </span>?
        </p>

        <p class="mt-2 text-sm text-slate-500">
          Esta acción no se puede deshacer.
        </p>

        <div class="mt-6 flex justify-end gap-3">
          <button
            type="button"
            class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            onclick={closeDeleteModal}
            disabled={deletingUser}
          >
            Cerrar
          </button>

          <button
            type="button"
            class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            onclick={confirmDeleteUser}
            disabled={deletingUser}
          >
            {deletingUser ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>
