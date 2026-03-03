<script>
  import { onMount } from 'svelte';
  import { route } from './stores/route.js';
  import { setClerkGetToken } from './lib/api.js';
  import PageList from './lib/PageList.svelte';
  import PageForm from './lib/PageForm.svelte';
  import SiteConfig from './lib/SiteConfig.svelte';
  import LandingConfig from './lib/LandingConfig.svelte';
  import UserManagement from './lib/UserManagement.svelte';

  let clerkReady = $state(false);
  let isSignedIn = $state(false);
  let clerkRef = $state(null);
  let signInEl = $state(null);
  let sidebarOpen = $state(false);
  let clerkError = $state(null);

  onMount(async () => {
    const key = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
    const fapi = (import.meta.env.VITE_CLERK_FRONTEND_API || '').trim().replace(/\/$/, '');
    if (!key) {
      clerkReady = true;
      isSignedIn = false;
      return;
    }
    if (!fapi) {
      clerkReady = true;
      isSignedIn = false;
      clerkError = 'Falta VITE_CLERK_FRONTEND_API en .env (ej. https://smart-yak-30.clerk.accounts.dev)';
      return;
    }
    try {
      await new Promise((resolve, reject) => {
        if (window.Clerk) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.setAttribute('data-clerk-publishable-key', key);
        script.src = `${fapi}/npm/@clerk/clerk-js@5/dist/clerk.browser.js`;
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('No se pudo cargar el script de Clerk'));
        document.head.appendChild(script);
      });
      const localization = {
        dividerText: '',
        formButtonPrimary: 'Continuar',
        formFieldLabel__emailAddress_username: 'Correo electrónico o usuario',
        formFieldInputPlaceholder__emailAddress_username: 'Introduce tu correo o usuario',
        signIn: {
          start: {
            title: 'Iniciar sesión',
            subtitle: 'Bienvenido. Inicia sesión con tu correo y contraseña para continuar.',
          },
          password: {
            title: 'Introduce tu contraseña',
            subtitle: 'Contraseña asociada a tu cuenta',
          },
        },
      };
      await window.Clerk.load({
        appearance: {
          layout: {
            unsafe_disableDevelopmentModeWarnings: true,
          },
          localization,
        },
      });
      const clerk = window.Clerk;
      clerkRef = clerk;
      clerkReady = true;
      isSignedIn = clerk.isSignedIn;
      if (isSignedIn && clerk.session) {
        setClerkGetToken(() => clerk.session.getToken());
      }
      clerk.addListener(() => {
        isSignedIn = clerk.isSignedIn;
        if (clerk.isSignedIn && clerk.session) {
          setClerkGetToken(() => clerk.session.getToken());
        }
      });
      clerkError = null;
    } catch (e) {
      console.error('Clerk load error', e);
      clerkReady = true;
      isSignedIn = false;
      clerkError = e?.message || String(e);
    }
  });

  $effect(() => {
    if (clerkRef && signInEl && !isSignedIn) {
      clerkRef.mountSignIn(signInEl, { withSignUp: false });
      return () => {
        try { clerkRef.unmountSignIn(signInEl); } catch (_) {}
      };
    }
  });

  const path = $derived($route.path);
  const slug = $derived($route.slug);

  function goList() {
    route.set({ path: 'list', slug: null });
  }
  function goSite() {
    route.set({ path: 'site', slug: null });
  }
  function goLanding() {
    route.set({ path: 'landing', slug: null });
  }
  function goUsers() {
    route.set({ path: 'users', slug: null });
  }

  const isContent = $derived(path === 'list' || path === 'edit' || path === 'create');
  const isLanding = $derived(path === 'landing');
  const isSite = $derived(path === 'site');
  const isUsers = $derived(path === 'users');
  const pageTitle = $derived(
    isContent
      ? (path === 'create' ? 'Nueva página' : path === 'edit' && slug ? 'Editar página' : 'Contenido')
      : isLanding
        ? 'Página de inicio'
        : isSite
          ? 'Menú y logos'
          : isUsers
            ? 'Usuarios del CMS'
            : 'Panel'
  );
</script>

{#if !clerkReady}
  <div class="min-h-screen bg-slate-100 flex items-center justify-center">
    <p class="text-slate-500">Cargando…</p>
  </div>
{:else if !isSignedIn}
  {#if !import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
    <div class="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div class="max-w-md rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
        <p class="font-semibold">Falta la clave de Clerk</p>
        <p class="mt-2 text-sm">Añade en <strong>ideacms/.env</strong> la variable:</p>
        <p class="mt-2 rounded bg-white px-2 py-1 font-mono text-sm">VITE_CLERK_PUBLISHABLE_KEY=pk_test_...</p>
        <p class="mt-2 text-sm">(Usa la misma Publishable Key del dashboard de Clerk.) Luego reinicia el servidor del CMS (<code>npm run dev</code>).</p>
      </div>
    </div>
  {:else if clerkError}
    <div class="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div class="max-w-lg rounded-xl border border-red-200 bg-red-50 p-6 text-red-900">
        <p class="font-semibold">Error al cargar Clerk</p>
        <p class="mt-2 text-sm opacity-90">{clerkError}</p>
        <p class="mt-4 font-medium">Si usas <strong>dashboard.clerk.com</strong> (Clerk nuevo):</p>
        <ol class="mt-2 list-decimal list-inside text-sm space-y-1">
          <li>Abre <a href="https://dashboard.clerk.com" target="_blank" rel="noopener" class="underline">dashboard.clerk.com</a> → tu app → <strong>API Keys</strong> o <strong>Domains</strong>.</li>
          <li>Copia la URL del <strong>Frontend API</strong> (ej. <code class="bg-red-100 px-1 rounded">https://xxx.clerk.accounts.dev</code>).</li>
          <li>Añade en <strong>ideacms/.env</strong>: <code class="block mt-1 bg-white px-2 py-1 rounded font-mono text-xs">VITE_CLERK_FRONTEND_API=https://tu-url-aqui</code></li>
          <li>Reinicia el servidor (<code>npm run dev</code>) y recarga la página.</li>
        </ol>
        <p class="mt-4 text-sm">O actualiza a Clerk v5 (acepta la Publishable Key directa): <code class="bg-white px-1 rounded">npm install @clerk/clerk-js@5</code> en la carpeta ideacms.</p>
      </div>
    </div>
  {:else}
    <div class="min-h-screen flex items-center justify-center p-4 cms-login" style="background-color: #002B7A">
      <div class="w-full max-w-md cms-login__box" bind:this={signInEl}></div>
    </div>
  {/if}
{:else}
<div class="min-h-screen flex" style="background-color: #E8F0FE">
  <!-- Sidebar: azul del banner (#002B7A) -->
  <aside
    class="fixed inset-y-0 left-0 z-40 w-64 text-white flex flex-col transition-transform duration-200 ease-out md:translate-x-0 {sidebarOpen ? 'translate-x-0' : '-translate-x-full'}"
    style="background-color: #002B7A"
    aria-label="Menú principal"
  >
    <div class="flex h-14 items-center justify-between shrink-0 border-b border-white/20 px-4 md:justify-start">
      <h1 class="text-lg font-bold tracking-tight truncate">Panel IDEA</h1>
      <button
        type="button"
        class="md:hidden p-2 rounded-lg text-white/80 hover:bg-white/10 hover:text-white"
        aria-label={sidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
        onclick={() => (sidebarOpen = !sidebarOpen)}
      >
        {#if sidebarOpen}
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        {:else}
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
        {/if}
      </button>
    </div>
    <nav class="flex-1 overflow-y-auto py-4 px-3">
      <ul class="space-y-0.5">
        <li>
          <button
            type="button"
            class="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors {isContent ? 'bg-white/15 text-white' : 'text-white/90 hover:bg-white/10 hover:text-white'}"
            onclick={() => { goList(); sidebarOpen = false; }}
          >
            <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white/90" aria-hidden="true">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </span>
            <span>Contenido</span>
          </button>
        </li>
        <li>
          <button
            type="button"
            class="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors {isLanding ? 'bg-white/15 text-white' : 'text-white/90 hover:bg-white/10 hover:text-white'}"
            onclick={() => { goLanding(); sidebarOpen = false; }}
          >
            <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white/90" aria-hidden="true">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            </span>
            <span>Página de inicio</span>
          </button>
        </li>
        <li>
          <button
            type="button"
            class="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors {isSite ? 'bg-white/15 text-white' : 'text-white/90 hover:bg-white/10 hover:text-white'}"
            onclick={() => { goSite(); sidebarOpen = false; }}
          >
            <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white/90" aria-hidden="true">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </span>
            <span>Menú y logos</span>
          </button>
        </li>
        <li>
          <button
            type="button"
            class="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors {isUsers ? 'bg-white/15 text-white' : 'text-white/90 hover:bg-white/10 hover:text-white'}"
            onclick={() => { goUsers(); sidebarOpen = false; }}
          >
            <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white/90" aria-hidden="true">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </span>
            <span>Usuarios</span>
          </button>
        </li>
      </ul>
    </nav>
    <div class="shrink-0 border-t border-white/20 p-3">
      {#if clerkRef}
        <button
          type="button"
          class="w-full rounded-lg px-3 py-2 text-left text-sm text-white/90 hover:bg-white/10 hover:text-white"
          onclick={() => clerkRef.signOut()}
        >
          Cerrar sesión
        </button>
      {/if}
      <p class="text-xs text-white/60 mt-2">IDEA CMS</p>
    </div>
  </aside>

  <!-- Overlay móvil -->
  {#if sidebarOpen}
    <div
      class="fixed inset-0 z-30 bg-black/50 md:hidden"
      aria-hidden="true"
      onclick={() => (sidebarOpen = false)}
    ></div>
  {/if}

  <!-- Área principal -->
  <div class="flex-1 flex flex-col min-w-0 md:ml-64">
    <header class="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-4 border-b border-idea-light bg-white px-4 shadow-sm md:px-6">
      <button
        type="button"
        class="md:hidden p-2 -ml-2 rounded-lg text-idea-dark hover:bg-idea-light"
        aria-label="Abrir menú"
        onclick={() => (sidebarOpen = true)}
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>
      <h2 class="text-lg font-semibold text-idea-dark truncate">{pageTitle}</h2>
    </header>

    <main class="flex-1 overflow-auto py-6 px-4 md:px-6">
      <div class="mx-auto" class:max-w-none={isContent} class:max-w-4xl={!isContent}>
        {#if path === 'site'}
          <SiteConfig />
        {:else if path === 'landing'}
          <LandingConfig />
        {:else if path === 'list'}
          <PageList />
        {:else if path === 'edit' && slug}
          <PageForm {slug} />
        {:else if path === 'create'}
          <PageForm slug={null} />
        {:else if path === 'users'}
          <UserManagement />
        {:else}
          <PageList />
        {/if}
      </div>
    </main>
  </div>
</div>
{/if}

<style>
  /* Ocultar Google/sociales, separador "or" y el enlace Sign up */
  .cms-login :global(.cl-socialButtonsBlock),
  .cms-login :global([class*="socialButtons"]),
  .cms-login :global(.cl-dividerLine),
  .cms-login :global(.cl-divider),
  .cms-login :global([class*="divider"]) {
    display: none !important;
  }
  /* Ocultar solo la fila "Don't have an account? Sign up" */
  .cms-login :global(a[href*="sign-up"]) {
    display: none !important;
  }
  .cms-login :global(.cl-formFooterAction:has(a[href*="sign-up"])),
  .cms-login :global([class*="footerAction"]:has(a[href*="sign-up"])) {
    display: none !important;
  }
</style>
