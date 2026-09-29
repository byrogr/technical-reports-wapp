# CLAUDE.md

Contexto e instrucciones para Claude Code en este proyecto. Léelo antes de generar o
modificar código.

## Proyecto

Panel web del Sistema de Informes Técnicos de mantenimiento para Scontrol Ingeniería S.A.C.
Es el frontend de la API REST del repositorio `technical-reports` (Spring Boot).
El diseño completo (pantallas, rutas, tokens visuales, integración con la API, fases) está
en `DESIGN.md` en esta misma raíz — léelo también antes de implementar cualquier fase.

El contrato de la API es `openapi.yaml` (copia del `docs/openapi.yaml` del backend). Las
reglas de negocio están en el `docs/API.md` del backend; si una regla no está clara,
pregunta antes de inventarla en el frontend.

## Stack

- Vite + React 19 + TypeScript (`strict: true`)
- Tailwind CSS v4 + shadcn/ui (Radix) + lucide-react
- React Router v7
- TanStack Query (estado de servidor)
- openapi-fetch + openapi-typescript (tipos generados desde `openapi.yaml`) — **no usar axios**
- react-hook-form + zod
- date-fns
- Vitest + Testing Library + MSW
- npm

No agregar librerías de estado global (Redux, Zustand, etc.) ni otra librería de
componentes: si shadcn no tiene algo, se construye con Radix + Tailwind.

## Convenciones de código (obligatorias)

**Idioma:** todo lo que se convierte en código va en inglés — nombres de archivos,
componentes, variables, funciones, rutas (`/reports`, `/clients`). Los **textos visibles
en la UI van en español** y se escriben directamente en el JSX (no hay i18n). Los
comentarios pueden ir en español.

**Documentación:** todo archivo de componente, hook o módulo creado lleva un JSDoc básico
(no extenso) en la cabecera, con autor. No se documenta cada función.

```tsx
/**
 * Listado de informes técnicos con filtros por cliente, equipo y fechas.
 *
 * @author Roger Rojas Effio - roger.rojas@rmsolutions.pe
 */
export function ReportListPage() {
  // ...
}
```

No aplica a `src/components/ui/` (generados por el CLI de shadcn) ni a `src/api/schema.d.ts`.

**TypeScript y React:**
- Componentes de función con `export function Name()`; un componente principal por archivo,
  archivo en `PascalCase.tsx`. Hooks en `useSomething.ts`.
- Prohibido `any`. Los tipos de la API se toman de `schema.d.ts`
  (`components['schemas']['TechnicalReportResponse']`) mediante alias en cada feature;
  **no redefinir DTOs a mano**.
- `src/api/schema.d.ts` es generado: nunca editarlo. Si falta algo, se regenera con
  `npm run api:types` desde un `openapi.yaml` actualizado.
- Las páginas no llaman al cliente HTTP directamente: usan los hooks de su `features/<x>/`.
- Sin lógica de negocio duplicada del backend (numeración, validación de catálogos activos,
  dependencias al borrar): el backend es la fuente de verdad y el frontend muestra su error.

**Estilos:**
- Solo Tailwind y los tokens de `src/index.css` (sección 6 de `DESIGN.md`). No usar
  colores hexadecimales sueltos en componentes: si falta un color, se agrega como token.
- Los componentes de shadcn se agregan con su CLI (`npx shadcn@latest add <comp>`) y se
  pueden ajustar al diseño.
- Íconos solo de `lucide-react`. Botones de solo ícono siempre con `aria-label`.

**Fechas:** toda conversión entre la API y la UI pasa por `src/lib/format.ts`. Nunca usar
`toISOString()` para valores que se envían a la API (ver `DESIGN.md` §7).

**Arquitectura:** SPA simple organizada por funcionalidad (`features/`). Sin SSR, sin
micro-frontends, sin monorepo.

**Alcance:** no agregar funcionalidad fuera de lo definido en `DESIGN.md` (dashboard,
modo oscuro, i18n, gestión de usuarios, etc.) salvo que se pida explícitamente.

## Control de versiones (Git)

**No ejecutes `git commit` ni `git push` por tu cuenta.** El commit lo hago yo
manualmente después de revisar los cambios.

En su lugar, al terminar una tarea o fase, **sugiere el mensaje de commit** siguiendo
el estándar [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope opcional>): <descripción corta en minúsculas, sin punto final>

[cuerpo opcional explicando el porqué, no el qué]
```

Tipos permitidos: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `build`, `style`.

Ejemplos:
```
feat(auth): add login page and protected routes
feat(reports): add report list with url filters
fix(reports): send local datetime without utc conversion
build: add nginx dockerfile for local stack
```

Si los cambios de una tarea tocan varios módulos de forma no relacionada, sugiere
mensajes de commit separados por módulo en vez de uno solo genérico.

## Cómo trabajar en este proyecto

- Implementa **una fase de `DESIGN.md` a la vez**, en el orden en que están listadas.
  No adelantes fases posteriores sin que se confirme que la actual funciona.
- Antes de escribir código nuevo, revisa si ya existen componentes/hooks similares para
  mantener el mismo estilo (ej. reutilizar `PageHeader`, `StatusBadge`, `ConfirmDialog`).
- Antes de dar una fase por terminada: `npm run typecheck`, `npm run lint` y `npm test`
  sin errores.
- Al terminar una fase, resume brevemente qué se implementó y qué falta probar
  manualmente en el navegador (ej. "crea un informe y descarga el PDF").

## Comandos útiles

```bash
npm install
npm run dev              # http://localhost:5173, proxy /api -> http://localhost:8080
npm run build            # genera dist/
npm run typecheck        # tsc --noEmit
npm run lint
npm test                 # vitest
npm run api:types        # regenera src/api/schema.d.ts desde openapi.yaml
```

El backend debe estar corriendo para `npm run dev` (desde el repo `technical-reports`:
`docker compose -f compose.local.yaml up -d --build`). Las credenciales son las de
`ADMIN_EMAIL` / `ADMIN_PASSWORD` con que se creó el primer usuario.

**Cuando cambie la API:** copiar el `docs/openapi.yaml` actualizado del backend a la raíz
de este repo, correr `npm run api:types` y corregir los errores de compilación que aparezcan.
