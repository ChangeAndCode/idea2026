# Páginas (estructura Umbraco → IDEA2026)

## Jerarquía en Umbraco (DDEyC)

- **Home** (landing) → `/`
- **DDEyC** (sección raíz) → `/pagina/ddeyc`
  - **Emprendimiento** → `/pagina/emprendimiento`
    - Incubadoras → `/pagina/incubadoras`
    - INCUBECH, Becas con universidades
    - Branding, Propiedad Intelectual, Permisos y licencias
    - Mi situación fiscal → SAT en el SARE, Guía para apertura de negocios
    - Emprendimientos con base tecnológica
  - **Capacitación** → `/pagina/capacitacion`
    - MIFAM, ENCES, Capital de emprendimiento, Aulas digitales
  - **Ferias y Eventos** → `/pagina/ferias-y-eventos`
    - Tianguis de productores, Impulso a eventos y festividades
  - **Sector Industrial** → `/pagina/sector-industrial`
    - Desarrollo de proveedores, Clúster, Atracción de inversión
  - **Apoyos y Financiamientos** → `/pagina/apoyos-y-financiamientos`
    - Proyectos productivos, FOMECH, Impulso municipal
    - Otros programas de la red → FIDEAPECH, FIPES
- **Bolsa de trabajo** (JobListingsPage) → `/bolsa` (no es CMS)

## Navegación

- **Dropdown (landing):** las opciones "Respuestas disponibles" tienen `ComboBoxThirdUrl` = `/bolsa` o `/pagina/:slug`. El slug se obtiene del nombre (minúsculas, sin acentos, espacios → guiones). Ej.: "INCUBECH" → `incubech`, "Proyectos productivos" → `proyectos-productivos`.
- **Menú header:** EMPRENDIMIENTO → `/pagina/emprendimiento`, etc.
- **Front:** `Page.svelte` hace `GET /api/cms/pages/:slug` y muestra título y body desde MongoDB (`cms_pages`).

## Seeds

1. `npm run seed:search-combo` — rellena `searchCombos.landing` con opciones de los 3 dropdowns (desde Umbraco home.config).
2. `npm run seed:cms-pages` — rellena `cms_pages` con una entrada por página hija (slug, title, body placeholder) para que cada `/pagina/:slug` tenga contenido.

## Fuentes

- Estructura y Path/NodeName: `Umbraco---DDEyC/DD/uSync/v9/Content/*.config`
- Opciones del dropdown: `home.config` → `searchComboContents`
