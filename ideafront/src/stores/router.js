import { writable } from 'svelte/store';

function getPath() {
  return typeof window !== 'undefined' ? window.location.pathname : '/';
}

const legacyProjectPath = '/pagina/proyectos-productivos';
const currentProjectPath = '/pagina/vende-tu-proyecto';

function createRouter() {
  const { subscribe, set } = writable({ path: getPath(), slug: '' });

  function update() {
    let path = getPath();
    if (path === legacyProjectPath) {
      window.history.replaceState({}, '', currentProjectPath);
      path = currentProjectPath;
    }
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
      if (path === legacyProjectPath) path = currentProjectPath;
      window.history.pushState({}, '', path);
      update();
    },
  };
}

export const page = createRouter();
