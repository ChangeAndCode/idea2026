# ideafront

Frontend IDEA 2026 — Svelte + Vite + Tailwind.

## Requisitos

- Node.js >= 18

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

Abre http://localhost:5173. El proxy envía `/api` al backend (puerto 4000).

## Build

```bash
npm run build
```

Salida en `dist/`. Servir con cualquier estático o `npm run preview`.

## Rutas

- `/` — Inicio
- `/bolsa` — Bolsa de trabajo (búsqueda + chat)
- `/pagina/:slug` — Páginas del CMS
