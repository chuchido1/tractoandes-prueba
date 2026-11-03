# Etapa 1: dependencias exactas según package-lock.json.
FROM node:24.19.0-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Etapa 2: build. BACKEND_INTERNAL_URL se fija aquí porque el rewrite de
# next.config.ts se evalúa durante `next build`.
FROM node:24.19.0-alpine AS build
WORKDIR /app
ARG BACKEND_INTERNAL_URL=http://backend:8080
ENV BACKEND_INTERNAL_URL=$BACKEND_INTERNAL_URL \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Etapa 3: servidor mínimo (output standalone), sin usuario root.
FROM node:24.19.0-alpine AS runner
WORKDIR /app
ARG BACKEND_INTERNAL_URL=http://backend:8080
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000 \
    BACKEND_INTERNAL_URL=$BACKEND_INTERNAL_URL
RUN addgroup -S app && adduser -S app -G app
COPY --from=build --chown=app:app /app/.next/standalone ./
COPY --from=build --chown=app:app /app/.next/static ./.next/static
USER app
EXPOSE 3000
CMD ["node", "server.js"]
