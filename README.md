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
