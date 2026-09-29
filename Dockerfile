# Imagen del panel web: build con Vite y sirve dist/ con nginx.
# VITE_API_URL solo hace falta si el panel no comparte red con el backend
# (p. ej. detrás de otro proxy); en el stack local (compose.local.yaml) se deja
# vacío para que las llamadas a /api las resuelva el reverse proxy de nginx.

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL=
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
