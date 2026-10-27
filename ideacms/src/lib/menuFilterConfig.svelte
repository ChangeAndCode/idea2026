<script>
  import {
    getPages,
    getSearchComboConfig,
    updateSearchComboConfig,
  } from './api.js';

  let labels = $state({
    combo1: '¿Quién eres?',
    combo2: '¿Qué buscas?',
    combo3: 'Respuestas disponibles',
  });

  let defaultText = $state('Seleccione una opción');
  let options = $state([]);
  let pages = $state([]);
  let selectedUser = $state(0);
  let selectedMatch = $state(0);
  let loading = $state(true);
  let saving = $state(false);
  let message = $state('');
  let error = $state('');
  let deleteRequest = $state(null);
  let dragging = $state(null);

  $effect(() => {
    if (!message && !error) return;

    const timer = setTimeout(() => {
      message = '';
      error = '';
    }, 3000);

    return () => clearTimeout(timer);
  });

  const user = $derived(options[selectedUser]);
  const match = $derived(user?.ComboBoxUserMatches?.[selectedMatch]);

  async function load() {
    try {
      const [combo, pageList] = await Promise.all([
        getSearchComboConfig(),
        getPages(),
      ]);

      labels = { ...labels, ...(combo.labels || {}) };
      defaultText = combo.defaultText || defaultText;
      options = combo.options || [];
      pages = pageList || [];
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  function addUser() {
    options = [
      ...options,
      {
        ComboBoxUserName: 'Nueva opción',
        ComboBoxUserMatches: [],
      },
    ];

    selectedUser = options.length - 1;
    selectedMatch = 0;
  }

  function updateUser(index, value) {
    options = options.map((item, optionIndex) =>
      optionIndex === index
        ? { ...item, ComboBoxUserName: value }
        : item,
    );
  }

  function addMatch() {
    if (!user) return;

    user.ComboBoxUserMatches = [
      ...(user.ComboBoxUserMatches || []),
      {
        ComboBoxMatchElementText: 'Nueva opción',
        ComboBoxMatchElementUrl: [],
      },
    ];

    options = [...options];
    selectedMatch = user.ComboBoxUserMatches.length - 1;
  }

  function updateMatch(index, value) {
    if (!user) return;

    user.ComboBoxUserMatches = user.ComboBoxUserMatches.map((item, matchIndex) =>
      matchIndex === index
        ? { ...item, ComboBoxMatchElementText: value }
        : item,
    );
    options = [...options];
  }

  function startDrag(type, index) {
    dragging = { type, index };
  }

  function reorder(type, targetIndex) {
    if (!dragging || dragging.type !== type || dragging.index === targetIndex) {
      dragging = null;
      return;
    }

    if (type === 'user') {
      const selected = options[selectedUser];
      const next = [...options];
      const [moved] = next.splice(dragging.index, 1);
      next.splice(targetIndex, 0, moved);
      options = next;
      selectedUser = Math.max(0, options.indexOf(selected));
    } else if (type === 'match' && user) {
      const selected = user.ComboBoxUserMatches?.[selectedMatch];
      const next = [...(user.ComboBoxUserMatches || [])];
      const [moved] = next.splice(dragging.index, 1);
      next.splice(targetIndex, 0, moved);
      user.ComboBoxUserMatches = next;
      options = [...options];
      selectedMatch = Math.max(0, next.indexOf(selected));
    } else if (type === 'answer' && match) {
      const next = [...(match.ComboBoxMatchElementUrl || [])];
      const [moved] = next.splice(dragging.index, 1);
      next.splice(targetIndex, 0, moved);
      match.ComboBoxMatchElementUrl = next;
      options = [...options];
    }

    dragging = null;
  }

  function removeUser(index) {
    options = options.filter((_, optionIndex) => optionIndex !== index);
    selectedUser = Math.max(0, Math.min(selectedUser, options.length - 1));
    selectedMatch = 0;
  }

  function askDelete(type, index) {
    deleteRequest = { type, index };
  }

  function confirmDelete() {
    if (!deleteRequest) return;
    if (deleteRequest.type === 'user') removeUser(deleteRequest.index);
    if (deleteRequest.type === 'match') removeMatch(deleteRequest.index);
    if (deleteRequest.type === 'answer' && match) {
      match.ComboBoxMatchElementUrl = match.ComboBoxMatchElementUrl.filter((_, i) => i !== deleteRequest.index);
      options = [...options];
    }
    deleteRequest = null;
  }

  function removeMatch(index) {
    if (!user) return;

    user.ComboBoxUserMatches = user.ComboBoxUserMatches.filter(
      (_, matchIndex) => matchIndex !== index,
    );
    options = [...options];
    selectedMatch = Math.max(
      0,
      Math.min(selectedMatch, (user.ComboBoxUserMatches?.length ?? 1) - 1),
    );
  }

  function addAnswer() {
    if (!match) return;

    match.ComboBoxMatchElementUrl = [
      ...(match.ComboBoxMatchElementUrl || []),
      {
        ComboBoxThirdText: '',
        ComboBoxThirdUrl: '',
      },
    ];

    options = [...options];
  }

  async function save() {
    const clean = (value) => String(value ?? '').trim();
    if (!clean(labels.combo1) || !clean(labels.combo2) || !clean(labels.combo3) || !clean(defaultText)) {
      error = 'Completa los títulos de los filtros y el texto inicial.';
      return;
    }
    const names = options.map((item) => clean(item.ComboBoxUserName));
    if (names.some((name) => !name) || new Set(names).size !== names.length) {
      error = 'Las opciones de ¿Quién eres? deben tener nombre y no repetirse.';
      return;
    }
    for (const item of options) {
      const matches = item.ComboBoxUserMatches || [];
      const matchNames = matches.map((matchItem) => clean(matchItem.ComboBoxMatchElementText));
      if (matchNames.some((name) => !name) || new Set(matchNames).size !== matchNames.length) {
        error = `Revisa las opciones de ¿Qué buscas? para ${item.ComboBoxUserName}.`;
        return;
      }
      for (const matchItem of matches) {
        if ((matchItem.ComboBoxMatchElementUrl || []).some((answer) => !clean(answer.ComboBoxThirdUrl))) {
          error = `Selecciona una página para todas las respuestas de ${matchItem.ComboBoxMatchElementText}.`;
          return;
        }
      }
    }
    saving = true;
    error = '';

    try {
      await updateSearchComboConfig({
        labels,
        defaultText,
        options,
      });

      message = 'Configuración guardada.';
    } catch (e) {
      error = e.message;
    } finally {
      saving = false;
    }
  }

  load();
</script>

{#if loading}
  <div class="cms-card p-8 text-slate-500">
    Cargando configuración…
  </div>
{:else}
  <section class="space-y-6">
    <div class="cms-card p-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold">Menú de filtros</h2>
          <p class="text-sm text-slate-500">
            Configura la secuencia de filtros.
          </p>
        </div>

        <button
          class="cms-btn-primary"
          onclick={save}
          disabled={saving}
        >
          {saving ? 'Guardando…' : 'Guardar'}
        </button>
      </div>

      <div class="flex flex-col pt-5">
        {#each [
          ['combo1', 'Primer filtro'],
          ['combo2', 'Segundo filtro'],
          ['combo3', 'Tercer filtro'],
        ] as field}
        <label>
          <span class="cms-label pt-2">{field[1]}</span>
          <input
            class="cms-input "
            bind:value={labels[field[0]]}
          />
        </label>
        {/each}
        <label>
          <span class="cms-label pt-2">Texto inicial</span>
          <input
            class="cms-input"
            bind:value={defaultText}
          />
        </label>
      </div>
    </div>

    {#if message}
      <p class="text-green-700">{message}</p>
    {/if}

    {#if error}
      <p class="text-red-700">{error}</p>
    {/if}

    <div class="grid gap-6 lg:grid-cols-3">
      <div class="cms-card p-5">
        <div class="flex justify-between">
          <h3>{labels.combo1}</h3>
          <button
            class="cms-btn-secondary"
            onclick={addUser}
          >
            + Agregar
          </button>
        </div>

        {#each options as item, i}
          <div class="mt-2 flex cursor-grab items-center gap-2 active:cursor-grabbing" draggable="true" ondragstart={() => startDrag('user', i)} ondragover={(event) => event.preventDefault()} ondrop={() => reorder('user', i)}>
            <span class="select-none text-slate-400" title="Arrastrar para reordenar" aria-hidden="true">⋮⋮</span>
            <input
              class="cms-input flex-1 {selectedUser === i ? 'border-idea-blue ring-2 ring-idea-blue/20' : ''}"
              value={item.ComboBoxUserName}
              onclick={() => {
                selectedUser = i;
                selectedMatch = 0;
              }}
              oninput={(event) => updateUser(i, event.currentTarget.value)}
            />

            <button
              type="button"
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-red-200 text-2xl leading-none text-red-600 transition-colors hover:bg-red-50"
              title="Eliminar opción"
              aria-label="Eliminar opción"
              onclick={() => askDelete('user', i)}
            >
              ×
            </button>
          </div>
        {/each}
      </div>

      <div class="cms-card p-5">
        <div class="flex justify-between">
          <h3>{labels.combo2}</h3>
          <button
            class="cms-btn-secondary"
            onclick={addMatch}
            disabled={!user}
          >
            + Agregar
          </button>
        </div>

        {#each user?.ComboBoxUserMatches || [] as item, i}
          <div class="mt-2 flex cursor-grab items-center gap-2 active:cursor-grabbing" draggable="true" ondragstart={() => startDrag('match', i)} ondragover={(event) => event.preventDefault()} ondrop={() => reorder('match', i)}>
            <span class="select-none text-slate-400" title="Arrastrar para reordenar" aria-hidden="true">⋮⋮</span>
            <input
              class="cms-input flex-1 {selectedMatch === i ? 'border-idea-blue ring-2 ring-idea-blue/20' : ''}"
              value={item.ComboBoxMatchElementText}
              onclick={() => (selectedMatch = i)}
              oninput={(event) => updateMatch(i, event.currentTarget.value)}
            />

            <button
              type="button"
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-red-200 text-2xl leading-none text-red-600 transition-colors hover:bg-red-50"
              title="Eliminar opción"
              aria-label="Eliminar opción"
              onclick={() => askDelete('match', i)}
            >
              ×
            </button>
          </div>
        {/each}
      </div>

      <div class="cms-card p-5">
        <div class="flex justify-between">
          <h3>{labels.combo3}</h3>
          <button
            class="cms-btn-secondary !px-3 !py-2 text-sm whitespace-nowrap"
            onclick={addAnswer}
            disabled={!match}
          >
            + Agregar
          </button>
        </div>

        {#each match?.ComboBoxMatchElementUrl || [] as item, i}
          <div class="mt-3 flex cursor-grab items-center gap-2 active:cursor-grabbing" draggable="true" ondragstart={() => startDrag('answer', i)} ondragover={(event) => event.preventDefault()} ondrop={() => reorder('answer', i)}>
            <span class="select-none text-slate-400" title="Arrastrar para reordenar" aria-hidden="true">⋮⋮</span>
            <select
              class="cms-input flex-1"
              value={item.ComboBoxThirdUrl}
              onchange={(e) => {
                const selectedUrl = e.currentTarget.value;
                const selectedPage = pages.find((page) => `/pagina/${page.slug}` === selectedUrl);
                item.ComboBoxThirdUrl = selectedUrl;
                item.ComboBoxThirdText = selectedPage?.title ?? '';
                options = [...options];
              }}
            >
              <option value="">Selecciona una página</option>
              <option value="/bolsa">Bolsa de trabajo</option>

              {#each pages as p}
                <option value={'/pagina/' + p.slug}>
                  {p.title}
                </option>
              {/each}
            </select>

            <button
              type="button"
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-red-200 text-2xl leading-none text-red-600 transition-colors hover:bg-red-50"
              title="Eliminar respuesta"
              aria-label="Eliminar respuesta"
              onclick={() => askDelete('answer', i)}
            >
              ×
            </button>
          </div>
        {/each}
      </div>
    </div>
  </section>
{/if}

{#if deleteRequest}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
    <div class="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
      <h2 class="text-lg font-semibold text-slate-800">¿Eliminar esta opción?</h2>
      <p class="mt-2 text-sm text-slate-600">
        Si tiene opciones dependientes, también dejarán de estar disponibles.
      </p>
      <div class="mt-5 flex justify-end gap-2">
        <button class="cms-btn-secondary" onclick={() => (deleteRequest = null)}>Cancelar</button>
        <button class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700" onclick={confirmDelete}>Eliminar</button>
      </div>
    </div>
  </div>
{/if}
