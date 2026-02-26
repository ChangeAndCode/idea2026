<script>
  import { onMount } from 'svelte';
  import { page } from './stores/router.js';
  import Layout from './lib/Layout.svelte';
  import Home from './lib/pages/Home.svelte';
  import Bolsa from './lib/pages/Bolsa.svelte';
  import Page from './lib/pages/Page.svelte';

  let clerkReady = $state(false);
  let isSignedIn = $state(false);
  let clerkRef = $state(null);
  let signInEl = $state(null);
  let signUpEl = $state(null);
  let bolsaTab = $state('in'); // 'in' = Iniciar sesión, 'up' = Crear cuenta

  const path = $derived($page.path || '/');
  const slug = $derived($page.slug || '');
  const isCmsPage = $derived(path.startsWith('/pagina/'));
  const isBolsa = $derived(path === '/bolsa');

  const Component = $derived(isCmsPage ? Page : (path === '/bolsa' ? Bolsa : path === '/' ? Home : null));

  onMount(async () => {
    // Solo usar la app de Clerk de la Bolsa (nunca la del CMS) para que las cuentas estén separadas
    const key = import.meta.env.VITE_CLERK_BOLSA_PUBLISHABLE_KEY;
    const fapi = (import.meta.env.VITE_CLERK_BOLSA_FRONTEND_API || '').trim().replace(/\/$/, '');
    if (!key || !fapi) {
      clerkReady = true;
      if (!isBolsa) isSignedIn = true;
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
        script.onerror = () => reject(new Error('No se pudo cargar Clerk'));
        document.head.appendChild(script);
      });
      await window.Clerk.load({
        appearance: {
          layout: { unsafe_disableDevelopmentModeWarnings: true },
        },
      });
      const clerk = window.Clerk;
      clerkRef = clerk;
      clerkReady = true;
      isSignedIn = clerk.isSignedIn;
      clerk.addListener(() => {
        isSignedIn = clerk.isSignedIn;
      });
    } catch (e) {
      console.error('Clerk load error', e);
      clerkReady = true;
      // En Bolsa no dar por iniciada la sesión si Clerk falló, para que se vea el aviso
      if (!isBolsa) isSignedIn = true;
    }
  });

  const bolsaLocalization = {
    dividerText: '',
    formButtonPrimary: 'Continuar',
    formFieldLabel__emailAddress_username: 'Correo electrónico o usuario',
    formFieldInputPlaceholder__emailAddress_username: 'Introduce tu correo o usuario',
    signIn: {
      start: {
        title: 'Accede a la Bolsa de Empleo',
        subtitle: 'Inicia sesión o regístrate para buscar vacantes y usar el asistente.',
      },
      password: {
        title: 'Introduce tu contraseña',
        subtitle: 'Contraseña asociada a tu cuenta',
      },
    },
    signUp: {
      start: {
        title: 'Crear cuenta',
        subtitle: 'Regístrate para acceder a la bolsa de empleo.',
      },
    },
  };

  // Ocultar el enlace "Sign up" / "Sign in" dentro del formulario; ya usamos las pestañas para cambiar.
  const bolsaHideFooterAction = { elements: { footerAction: 'hidden' } };

  $effect(() => {
    if (!isBolsa || !clerkRef || isSignedIn) return;
    const redirectBolsa = '/bolsa';
    if (bolsaTab === 'in' && signInEl) {
      clerkRef.mountSignIn(signInEl, {
        fallbackRedirectUrl: redirectBolsa,
        appearance: { ...bolsaHideFooterAction, localization: bolsaLocalization },
      });
      return () => {
        try { clerkRef.unmountSignIn(signInEl); } catch (_) {}
      };
    }
    if (bolsaTab === 'up' && signUpEl) {
      clerkRef.mountSignUp(signUpEl, {
        fallbackRedirectUrl: redirectBolsa,
        signInFallbackRedirectUrl: redirectBolsa,
        appearance: { ...bolsaHideFooterAction, localization: bolsaLocalization },
      });
      return () => {
        try { clerkRef.unmountSignUp(signUpEl); } catch (_) {}
      };
    }
  });
</script>

{#if isBolsa && !clerkReady}
  <div class="min-h-screen flex items-center justify-center bg-idea-light" style="background-color: #E8F0FE">
    <p class="text-slate-600">Cargando…</p>
  </div>
{:else if isBolsa && clerkReady && !isSignedIn}
  <div class="min-h-screen flex flex-col" style="background-color: #002B7A">
    <!-- Barra de navegación arriba: fija, el formulario crece debajo -->
    <nav class="w-full flex items-center justify-center border-b border-white/15 bg-black/10 py-3 px-4 shrink-0">
      <div class="flex gap-1 rounded-lg border border-white/20 bg-white/5 px-1 py-1">
        <button
          type="button"
          class="min-w-[7.5rem] px-4 py-2 text-sm text-white/90 rounded-md transition-colors duration-150 {bolsaTab === 'in' ? 'bg-white/20 text-white' : 'hover:bg-white/10 hover:text-white'}"
          onclick={() => (bolsaTab = 'in')}
        >
          Iniciar sesión
        </button>
        <button
          type="button"
          class="min-w-[7.5rem] px-4 py-2 text-sm text-white/90 rounded-md transition-colors duration-150 {bolsaTab === 'up' ? 'bg-white/20 text-white' : 'hover:bg-white/10 hover:text-white'}"
          onclick={() => (bolsaTab = 'up')}
        >
          Crear cuenta
        </button>
      </div>
    </nav>
    <div class="flex-1 flex flex-col md:flex-row items-center justify-center min-h-0 p-2">
      <!-- Robot y formulario juntos, sin flex-1 para que no se estiren y queden pegados -->
      <div class="flex flex-col md:flex-row items-center justify-center md:gap-6 lg:gap-8 shrink-0">
        <!-- Lado del robot: mensaje arriba e imagen debajo -->
        <div class="flex flex-col items-center gap-3 shrink-0 w-full max-w-[16rem] md:max-w-[18rem]">
          <p
            class="text-white/95 text-sm leading-relaxed px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-center"
            role="status"
            aria-live="polite"
          >
            {#if bolsaTab === 'in'}
              Hola, bienvenido a Chambabot. Inicia sesión para que pueda ayudarte.
            {:else}
              Hola, bienvenido a Chambabot. Crea tu cuenta para que pueda ayudarte.
            {/if}
          </p>
          <img
            src="/assets/mascota/chambabot4.png"
            alt="Chambabot"
            class="w-44 h-44 md:w-72 md:h-72 lg:w-[22rem] lg:h-[22rem] xl:w-[26rem] xl:h-[26rem] object-contain shrink-0"
          />
        </div>
        <!-- Formulario a la derecha; si Clerk no cargó, mostrar aviso -->
        <div class="w-full max-w-sm mt-4 md:mt-0 shrink-0">
          {#if clerkRef}
            <div class="hidden" class:!block={bolsaTab === 'in'} bind:this={signInEl}></div>
            <div class="hidden" class:!block={bolsaTab === 'up'} bind:this={signUpEl}></div>
          {:else}
            <div class="rounded-xl bg-white/10 border border-white/20 px-4 py-6 text-white/90 text-sm text-center">
              <p class="font-medium">No se pudo cargar el formulario.</p>
              <p class="mt-2">Asegúrate de tener en <code class="bg-white/20 px-1 rounded">ideafront/.env</code> las variables <code class="bg-white/20 px-1 rounded">VITE_CLERK_BOLSA_PUBLISHABLE_KEY</code> y <code class="bg-white/20 px-1 rounded">VITE_CLERK_BOLSA_FRONTEND_API</code> con los valores de la aplicación Bolsa en Clerk, y reinicia el servidor (<code class="bg-white/20 px-1 rounded">npm run dev</code>).</p>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
{:else}
  <Layout
    signOut={isBolsa && clerkRef ? () => clerkRef.signOut() : null}
    component={Component}
    slug={slug}
    notFound={!Component}
  />
{/if}
