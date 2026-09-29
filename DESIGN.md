# Design Doc — Panel web de Informes Técnicos (Scontrol Ingeniería)

## 1. Objetivo

Panel web para operar el sistema de informes técnicos de mantenimiento: iniciar sesión,
gestionar clientes, equipos y catálogos, registrar informes y descargar el PDF.

Consume la API REST del repositorio `technical-reports` (backend Spring Boot). El
contrato es su `docs/openapi.yaml` (OpenAPI 3.1) y la referencia funcional su `docs/API.md`.
Este repositorio **no** contiene lógica de negocio: las reglas (numeración, validaciones
de catálogo, borrados con dependencias) viven en el backend; el panel las refleja en la
UI y muestra los errores que devuelve la API.

Usuarios: 1-2 personas de Scontrol, en escritorio. Bajo volumen, sin paginación.

## 2. Alcance

### Dentro del alcance (MVP)

- Login con JWT y cierre de sesión.
- Layout con menú lateral (aside) colapsable.
- Informes: listado con filtros, detalle, creación, edición y descarga del PDF.
- Clientes: listado, alta, edición, borrado; equipos de cada cliente (alta, edición, borrado).
- Catálogos: listado por tipo, alta, edición del valor, activar/desactivar.

### Fuera de alcance (agregar después, solo si se pide)

- Dashboard con métricas (la API no tiene endpoint de estadísticas).
- Gestión de usuarios, roles, registro público, recuperar contraseña.
- Modo oscuro, internacionalización (la UI es solo en español).
- Diseño optimizado para móvil (debe verse bien en tablet/escritorio; en móvil basta con
  que sea usable).
- Adjuntos o fotos en informes (el backend no los soporta).

## 3. Stack tecnológico

| Pieza | Elección | Motivo |
|---|---|---|
| Build | **Vite** + **React 19** + **TypeScript** (strict) | SPA estática, arranque inmediato, sin servidor Node en producción |
| Estilos | **Tailwind CSS v4** | Tokens de diseño como variables CSS, sin hojas de estilo sueltas |
| Componentes | **shadcn/ui** (Radix) + **lucide-react** | Los componentes se copian al repo y se ajustan; incluye `Sidebar`, `Table`, `Dialog`, `Form`, `Select`, `Sonner` |
| Rutas | **React Router** (modo data/declarativo, v7) | Suficiente para ~10 rutas |
| Datos | **TanStack Query** | Caché, estados de carga, invalidación tras mutaciones |
| Cliente HTTP | **openapi-fetch** + tipos generados con **openapi-typescript** | Tipos de request/response derivados del `openapi.yaml`; si el backend cambia un DTO, el panel deja de compilar |
| Formularios | **react-hook-form** + **zod** | Validación en cliente alineada con las reglas de `API.md` |
| Fechas | **date-fns** | Formateo `dd/MM/yyyy HH:mm` |
| Fuente | **Geist** y **Geist Mono** (`@fontsource-variable/*`) | Autoalojadas, sin depender de Google Fonts |
| Tests | **Vitest** + **Testing Library** + **MSW** | MSW simula la API con los mismos tipos generados |
| Paquetes | **npm** | Sin herramientas extra |

No se usa: Redux/Zustand (el estado de servidor lo lleva TanStack Query y el de sesión un
Context), Next.js (no hace falta SSR), axios (openapi-fetch ya cubre el caso).

## 4. Arquitectura

SPA en capas simples, organizada por funcionalidad:

```
src/
├── api/
│   ├── schema.d.ts          # GENERADO por openapi-typescript — no editar a mano
│   ├── client.ts            # instancia openapi-fetch + middleware (token, 401)
│   └── problem.ts           # tipo ProblemDetail y helpers para errores
├── auth/
│   ├── AuthProvider.tsx     # Context: token, login(), logout()
│   ├── RequireAuth.tsx      # guard de rutas privadas
│   └── tokenStorage.ts
├── components/
│   ├── ui/                  # componentes shadcn (generados por su CLI)
│   ├── layout/              # AppShell, AppSidebar, PageHeader
│   └── ...                  # StatusBadge, EmptyState, ConfirmDialog, FieldError
├── features/
│   ├── reports/             # páginas, hooks de query, schema zod, columnas
│   ├── clients/             # clientes + equipos
│   └── catalogs/
├── lib/                     # utils (cn), format.ts (fechas), queryClient.ts
├── routes.tsx
└── main.tsx
```

- Cada `features/<x>/` expone sus páginas y sus hooks (`useReports`, `useCreateReport`...).
  Las páginas no llaman a `client` directamente: pasan por los hooks.
- `openapi.yaml` se guarda en la raíz del repo como copia versionada del contrato del
  backend. `npm run api:types` regenera `src/api/schema.d.ts` a partir de él.

## 5. Pantallas y rutas

| Ruta | Pantalla | Endpoints |
|---|---|---|
| `/login` | Login (pública) | `POST /api/auth/login` |
| `/` | Redirige a `/reports` | — |
| `/reports` | Listado de informes con filtros | `GET /api/technical-reports`, `GET /api/clients`, `GET /api/clients/{id}/equipment` |
| `/reports/new` | Crear informe | `POST /api/technical-reports` + catálogos, clientes, equipos |
| `/reports/:id` | Detalle + descarga PDF | `GET /api/technical-reports/{id}`, `GET .../{id}/document` |
| `/reports/:id/edit` | Editar informe | `GET` + `PUT /api/technical-reports/{id}` |
| `/clients` | Lista de clientes + detalle del seleccionado | `GET /api/clients` |
| `/clients/:id` | Cliente seleccionado y sus equipos | `GET/PUT/DELETE /api/clients/{id}`, `GET/POST .../equipment`, `PUT/DELETE /api/equipment/{id}` |
| `/catalogs?type=ACTION` | Catálogos por pestaña | `GET/POST /api/catalogs`, `PUT /api/catalogs/{id}` |

Menú lateral: **Operación** → Informes, Clientes y equipos · **Configuración** → Catálogos.
Al pie, el email del usuario (claim `sub` del JWT) y el botón de cerrar sesión.

### Detalle por pantalla

**Listado de informes**
- Columnas: N° (mono, enlace al detalle), Cliente, Equipo (modelo + N/S), Acción,
  Estado final (badge), Término (fecha y hora), botón de descargar PDF.
- Filtros: Cliente, Equipo (deshabilitado hasta elegir cliente; carga los equipos de ese
  cliente), Desde, Hasta, Limpiar. Los filtros viven en la **query string**
  (`?clientId=3&from=2026-09-01`) para que la vista se pueda recargar y compartir.
- Estado vacío con mensaje cuando no hay resultados.

**Formulario de informe (crear y editar)**
- Secciones: *Equipo* (cliente, equipo, componente afectado), *Intervención* (evento/falla,
  acción, detalle), *Periodo* (inicio, término), *Estado del equipo* (inicial, final),
  *Firmas* (personal técnico, responsable).
- El cliente no se envía: solo filtra la lista de equipos. Al editar, se preselecciona a
  partir de `clientId` del informe.
- Selects de catálogo: solo opciones **activas**; al editar se agrega además la opción
  actual del informe aunque esté inactiva (el backend la acepta), marcada como "(inactiva)".
- Validación en cliente: obligatorios de la tabla de `API.md`; `startDatetime <= endDatetime`;
  `affectedComponent` máx. 255.
- Barra inferior fija con Cancelar y Guardar. Al guardar, navega al detalle y muestra un
  toast "Informe 008-0042 creado".

**Detalle de informe**
- Cabecera: número, badge de estado final, cliente · equipo · acción; botones Editar y
  Descargar PDF.
- Tarjetas: Equipo, Intervención (con estado inicial → final), Detalle (respeta saltos de
  línea), y en columna lateral Firmas y Registro (creado por, fecha).

**Clientes y equipos** (vista maestro-detalle)
- Columna izquierda: buscador (filtro en cliente, por nombre o documento) y lista de clientes.
- Derecha: datos del cliente (documento, email), Editar, Eliminar; tabla de equipos con
  "Ver informes" (enlaza a `/reports?clientId=..&equipmentId=..`), editar y eliminar.
- Alta/edición de cliente y de equipo en `Dialog`. `documentType` y `documentNumber` van
  juntos o ninguno; RUC = 11 dígitos, DNI = 8.
- Eliminar siempre con `ConfirmDialog`. Un `409` (tiene equipos / tiene informes) se muestra
  con el `detail` de la API.

**Catálogos**
- Pestañas por tipo: Acción (`ACTION`), Estado (`STATUS`), Evento / falla (`EVENT_FAILURE`),
  Personal (`PERSONNEL`), Responsable (`SUPERVISOR`), con contador.
- Fila: valor, pill Activa/Inactiva, switch para activar/desactivar, editar valor inline.
- Campo superior para agregar una opción al tipo actual. `409` = ya existe.
- No hay borrado.

## 6. Diseño visual

Referencia: mockup en Claude (lienzo "Technical Reports Panel", 6 pantallas + componente
Sidebar). Estilo minimalista inspirado en paneles tipo Infobip: aside claro, mucho
blanco, un solo color de acento, bordes finos en vez de sombras.

### Tokens (variables CSS en `src/index.css`, mapeadas al tema de shadcn)

| Token | Valor | Uso |
|---|---|---|
| `--background` | `#FFFFFF` | Fondo del contenido |
| `--foreground` | `#17181C` | Texto principal |
| `--muted-foreground` | `#5E6370` | Texto secundario, labels, cabeceras de tabla |
| `--border` | `#E7E6E1` | Bordes de tarjetas y tablas |
| `--input` | `#DAD9D4` | Borde de inputs y botones secundarios |
| `--muted` | `#FAFAF8` | Cabecera de tabla, fondo del formulario |
| `--sidebar` | `#F5F5F2` | Fondo del aside |
| `--primary` | `#C2410C` | Botón primario, ítem activo, enlaces (contraste 5.2:1 con blanco) |
| `--primary-hover` | `#9A3412` | Hover de primario y enlaces |
| `--accent` | `#FDF1EA` | Fondo del ítem seleccionado en listas |
| `--destructive` | `#A3221A` | Eliminar, errores |

**Badges de estado** (texto / fondo / punto): Operativo `#0B6B53 / #E7F4EE / #12966F`,
Inoperativo `#A3221A / #FCEBEA / #D63B2F`, En Obs. `#8A4E08 / #FDF3E3 / #D98A1C`. Cualquier
otro valor del catálogo STATUS: gris `#4B505B / #EFEEEA / #8A8F99`. El mapeo es por el
texto del valor (normalizado), con gris por defecto.

### Reglas

- Tipografía: Geist 14px base; títulos de página 26px/600 con `letter-spacing: -0.02em`;
  labels 13px/500; cabeceras de tabla 12.5px/500 en `--muted-foreground`. Números de
  informe en Geist Mono.
- Radios: 8px en controles, 12px en tarjetas y tablas, `999px` en badges.
- Alturas: inputs y botones 40px (38px en la barra de filtros), filas de tabla 56px.
- Aside: 248px expandido, 64px colapsado (solo íconos con tooltip); estado recordado en
  `localStorage`. Ítem activo: fondo blanco, borde `--border`, texto `--primary`.
- Contenido: padding `36px 40px`. Cabecera de página = título + descripción a la izquierda,
  acción principal a la derecha.
- Accesibilidad: botones reales (`<button>`, `<a>`), `aria-label` en botones de solo ícono,
  `aria-current="page"` en el menú, `aria-invalid` + mensaje asociado en campos con error.

## 7. Integración con la API

### Cliente y tipos

- `npm run api:types` → `openapi-typescript openapi.yaml -o src/api/schema.d.ts`.
- `client.ts` crea `createClient<paths>({ baseUrl: import.meta.env.VITE_API_URL ?? '' })`
  con un middleware que agrega `Authorization: Bearer <token>` y, ante un `401` en
  cualquier endpoint que no sea el login, cierra la sesión y redirige a `/login`
  (guardando la ruta para volver después).
- **A verificar en la Fase 1:** el `openapi.yaml` actual declara las respuestas como
  `'*/*'`. Si openapi-fetch no infiere bien los tipos de respuesta con ese media type,
  pedir en el backend `springdoc.default-produces-media-type=application/json` y regenerar
  el spec, en vez de tipar a mano.

### Sesión

- El token y su expiración (`Date.now() + expiresIn * 1000`) se guardan en `localStorage`,
  para que la sesión sobreviva a recargas durante la jornada (10 h).
- Al arrancar, si el token expiró se descarta. No hay refresh token: al expirar se vuelve
  a hacer login.
- El email del usuario se lee del claim `sub` del JWT (decodificando el payload, sin validar
  la firma: eso lo hace el backend).

### Errores (ProblemDetail, RFC 9457)

| Caso | Tratamiento en UI |
|---|---|
| `400` con `errors[]` | Cada `{field, message}` se asigna al campo del formulario con `setError`. Los que no correspondan a un campo, en un aviso sobre el formulario |
| `400` sin `errors[]`, `409` | Toast o aviso con el `detail` de la respuesta |
| `404` | Página "No encontrado" con enlace de vuelta al listado |
| `401` | Logout y redirección a `/login` (en el login: "Correo o contraseña incorrectos") |
| Red / `5xx` | Toast genérico "No se pudo conectar con el servidor" |

Enviar `Accept-Language: es` para que los mensajes de validación lleguen en español.

### Fechas y horas

- La API usa ISO-8601 **sin zona horaria**, en hora de Perú (`2026-03-02T18:00:00`); los
  filtros usan `yyyy-MM-dd`.
- Los `<input type="datetime-local">` producen `yyyy-MM-ddTHH:mm`: se envía agregando `:00`.
- **Nunca usar `Date.toISOString()`** para construir valores que se envían: convierte a UTC
  y desplaza 5 horas. Las funciones de conversión viven solo en `lib/format.ts`.

### Descarga del PDF

`GET /api/technical-reports/{id}/document` requiere el token, así que no sirve un `<a href>`
directo: se hace `fetch` con el header, se obtiene el `Blob`, se crea un object URL y se
dispara la descarga con el nombre de `Content-Disposition` (o `informe-<número>.pdf`).

### Caché (TanStack Query)

- Claves: `['reports', filtros]`, `['report', id]`, `['clients']`, `['client', id]`,
  `['equipment', clientId]`, `['catalogs', type]`.
- Tras crear/editar/eliminar se invalidan las claves afectadas (no se hacen updates
  optimistas; el volumen no lo justifica).
- Los catálogos cambian poco: `staleTime` de 5 minutos.

## 8. Desarrollo local y despliegue

- **Desarrollo:** `npm run dev` con proxy de Vite (`/api` → `http://localhost:8080`), así no
  hace falta CORS. El backend se levanta desde su repo (`docker compose -f compose.local.yaml up -d --build`).
- **Stack local completo:** imagen `nginx:alpine` que sirve `dist/` y hace reverse proxy de
  `/api` al contenedor del backend (misma red de Docker). `try_files ... /index.html` para
  las rutas de la SPA.
- **Producción (Azure):** Azure Static Web Apps (plan Free) sirviendo `dist/`, con
  `staticwebapp.config.json` para el fallback de rutas. La API sigue en App Service en otro
  dominio, así que `VITE_API_URL` apunta a ella y **el backend debe habilitar CORS** para el
  dominio del panel (hoy `AZURE_DEPLOYMENT.md` dice que no se configura). Es un cambio
  pendiente en el repo del backend, no en este.

## 9. Estrategia de tests

- **Vitest + Testing Library** para componentes y hooks con lógica (formulario de informe,
  mapeo de errores, conversión de fechas, badge de estado).
- **MSW** simula la API en los tests con respuestas tipadas con `schema.d.ts`.
- `lib/format.ts` y `api/problem.ts` con tests unitarios completos: son donde es más fácil
  romper algo sin notarlo.
- Sin tests E2E en el MVP.

## 10. Fases de desarrollo

**Fase 1 — Base**
1. Scaffold: Vite + React + TS, Tailwind, shadcn/ui (init + componentes base), Geist,
   tokens de la sección 6, ESLint + Prettier, Vitest.
2. `openapi.yaml` + `npm run api:types` + `client.ts` con middleware de token y 401.
3. Login, `AuthProvider`, `RequireAuth`, logout.
4. `AppShell` con aside colapsable, rutas vacías de las 3 secciones y página 404.

**Fase 2 — Maestros**
5. Catálogos (pestañas, alta, edición, activar/desactivar).
6. Clientes y equipos (maestro-detalle, diálogos, confirmación de borrado, errores 409).

**Fase 3 — Informes**
7. Listado con filtros en la query string.
8. Detalle + descarga del PDF.
9. Formulario de creación y edición.

**Fase 4 — Entrega**
10. Dockerfile (build + nginx) y su integración en el compose local.
11. Despliegue en Azure Static Web Apps (+ CORS en el backend).

## 11. Notas para el desarrollo con Claude Code CLI

1. Crear el repo, copiar este `DESIGN.md`, el `CLAUDE.md` y el `openapi.yaml` del backend.
2. Pedir la Fase 1 completa; revisar que el login funcione contra el backend local antes
   de seguir.
3. Una fase a la vez, probando en el navegador cada pantalla contra la API real.
