# Catálogo de libros — Prueba técnica Tractoandes

Aplicación web para administrar el catálogo de un club de lectura. Proyecto en construcción: este README crece con cada rama y la versión final sigue la estructura pedida en la prueba.

## Estado actual

Esqueleto funcional de los tres servicios (Next.js, Spring Boot, PostgreSQL) orquestados con Docker Compose. Todavía no hay autenticación ni catálogo.

## Requisitos previos

- Docker con Docker Compose v2 (Docker Desktop, OrbStack o Colima).
- No hace falta instalar Java, Node, Maven ni PostgreSQL.

## Cómo levantar el proyecto

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8080 (el navegador usa `http://localhost:3000/api/*`, que Next reenvía al backend)
- PostgreSQL: sólo accesible desde la red interna de Docker (puerto 5432 no publicado)

No se necesita `.env`: `docker-compose.yml` trae valores de demostración. Para cambiarlos, copia `.env.example` a `.env` y edítalo.

## Servicios

| Servicio | Imagen | Función |
|---|---|---|
| `db` | `postgres:18.6-alpine` | Base de datos. Datos en el volumen `pgdata`. |
| `backend` | `backend/Dockerfile` (Java 21, Spring Boot 4.1.2) | API REST. Espera a que `db` esté saludable. |
| `frontend` | `frontend/Dockerfile` (Node 24, Next.js 16.4.4) | Interfaz. Espera a que `backend` esté saludable. |

Comunicación interna: `frontend` → `http://backend:8080`, `backend` → `db:5432` (nombres de servicio, nunca `localhost` entre contenedores).

## Versiones

Spring Boot 4.1.2 · Java 21 · PostgreSQL 18.6 · Node 24.19.0 · Next.js 16.4.4 · React 19.3.0 · TypeScript 5.9.3 · Tailwind CSS 4.3.4

## Fuera del alcance actual

- Despliegue público: pendiente por decisión del solicitante.
- CI/CD: fuera del alcance actual y aplazado.
