import { writable } from 'svelte/store';

function getPath() {
  return typeof window !== 'undefined' ? window.location.pathname : '/';
}

function createRouter() {
  const { subscribe, set } = writable({ path: getPath(), slug: '' });

  function update() {
    const path = getPath();
    const slug = path.startsWith('/pagina/') ? path.slice(8).replace(/\/$/, '') : '';
    set({ path: path === '' ? '/' : path, slug });
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('popstate', update);
    update();
  }

  return {
    subscribe,
    goto: (path) => {
      window.history.pushState({}, '', path);
      update();
    },
  };
}

export const page = createRouter();
