# ideabackend

Backend Node.js para IDEA 2026: CMS mínimo, bolsa de trabajo (JSearch) y chatbot (Claude).

## Requisitos

- Node.js >= 20
- SQL Server (base nueva recomendada, ej. `IDEA2026`)

## Instalación

```bash
npm install
cp .env.example .env
# Editar .env con SQL, RAPIDAPI_JSEARCH_KEY y CLAUDE_API_KEY
```

Crear tablas del CMS (una vez):

```bash
# En SSMS o sqlcmd, ejecutar sql/schema.sql sobre tu base SQL_DATABASE
```

## Ejecutar

```bash
npm run dev   # desarrollo con --watch
npm start     # producción
```

Por defecto escucha en `http://localhost:4000`.

## API

- `GET /api/health` — estado del servicio
- `GET /api/cms/pages` — lista páginas
- `GET /api/cms/pages/:slug` — página por slug
- `GET /api/jobs?query=...&country=MX&page=1&limit=10` — búsqueda JSearch
- `POST /api/chat` — cuerpo: `{ "messages": [ { "role": "user", "content": "..." } ] }`
