# Panel web — Informes Técnicos (Scontrol Ingeniería)

Frontend de la API REST del repositorio `technical-reports`. Ver `DESIGN.md` (diseño y
fases) y `CLAUDE.md` (convenciones de código) antes de contribuir.

## Comandos

```bash
npm install
npm run dev              # http://localhost:5173, proxy /api -> http://localhost:8080
npm run build             # genera dist/
npm run typecheck         # tsc --noEmit
npm run lint
npm test                  # vitest
npm run api:types         # regenera src/api/schema.d.ts desde openapi.yaml
```

El backend debe estar corriendo para `npm run dev` (repo `technical-reports`:
`docker compose -f compose.local.yaml up -d --build`).

## Stack local completo (Docker)

Con el backend ya corriendo (paso anterior), levanta el panel detrás de nginx:

```bash
docker compose -f compose.local.yaml up -d --build
```

Sirve el panel en http://127.0.0.1:8081, con `/api` reenviado al contenedor del backend
por la red de Docker (ver comentarios en `compose.local.yaml` si el nombre de esa red
no coincide con el de tu instalación).

## Despliegue

Ver `AZURE_DEPLOYMENT.md`.
