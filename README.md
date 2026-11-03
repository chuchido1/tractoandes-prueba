# Catálogo de libros — Prueba técnica Tractoandes

Aplicación web para administrar el catálogo de un club de lectura. Proyecto en construcción: este README crece con cada rama y la versión final sigue la estructura pedida en la prueba.

## Estado actual

Funcionan los tres servicios (Next.js, Spring Boot, PostgreSQL) orquestados con Docker Compose y la **autenticación** completa (registro, login, logout y rutas protegidas). Todavía no hay catálogo de libros.

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

## Credenciales de prueba

| Correo | Contraseña |
|---|---|
| `admin@clublectura.test` | `Admin1234` |

Son datos de demostración que crea la migración `V2__seed_usuario_admin.sql` (sólo se guarda el hash BCrypt). También puedes crear una cuenta en http://localhost:3000/register.

## Autenticación

Se usan **sesiones de Spring Security** (no JWT) con contraseñas hasheadas con **BCrypt**.

- **Por qué sesiones:** la aplicación es una sola instancia con un solo frontend; la sesión vive en el servidor, se puede invalidar de verdad al cerrar sesión y el navegador sólo guarda una cookie `HttpOnly` que JavaScript no puede leer. Un JWT exigiría guardarlo en el cliente y resolver su revocación.
- **Cookie de sesión:** `HttpOnly`, `SameSite=Lax`, `Secure` configurable (`SESSION_COOKIE_SECURE`; `false` para `http://localhost`).
- **Fijación de sesión:** al autenticar, Spring cambia el identificador de sesión. También rota el token CSRF.
- **Caducidad:** por inactividad (`SESSION_TIMEOUT`, 30 minutos por defecto).
- **CSRF:** cookie `XSRF-TOKEN` + cabecera `X-XSRF-TOKEN` en toda petición que no sea de lectura. Un fallo devuelve `403 CSRF_INVALID`.
- **Rutas protegidas:** el backend responde `401` a cualquier ruta que no sea de autenticación sin sesión. El frontend valida la sesión **contra el backend** en el servidor (`requireUser()`), no sólo comprueba que exista la cookie.
- **Límite conocido:** las sesiones están en memoria. Si el backend se reinicia, se cierran todas las sesiones; usuarios y libros siguen en PostgreSQL.
- El login recibe un formulario `application/x-www-form-urlencoded` (así lo procesa Spring Security); el resto de la API usa JSON.

## Endpoints del backend

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/auth/csrf` | Emite la cookie `XSRF-TOKEN` (204). Público. |
| POST | `/api/auth/register` | Crea una cuenta (201). Público. |
| POST | `/api/auth/login` | Inicia sesión con `email` y `password` (formulario). Devuelve el usuario. |
| POST | `/api/auth/logout` | Invalida la sesión (204). |
| GET | `/api/auth/me` | Usuario de la sesión actual; 401 si no hay sesión. |

Todos los errores siguen un formato único: `{ status, code, message, fieldErrors, path, timestamp }`.

## Servicios

| Servicio | Imagen | Función |
|---|---|---|
| `db` | `postgres:18.6-alpine` | Base de datos. Datos en el volumen `pgdata`. |
| `backend` | `backend/Dockerfile` (Java 21, Spring Boot 4.1.2) | API REST. Espera a que `db` esté saludable. |
| `frontend` | `frontend/Dockerfile` (Node 24, Next.js 16.4.4) | Interfaz. Espera a que `backend` esté saludable. |

Comunicación interna: `frontend` → `http://backend:8080`, `backend` → `db:5432` (nombres de servicio, nunca `localhost` entre contenedores).

## Versiones

Spring Boot 4.1.2 · Java 21 · PostgreSQL 18.6 · Node 24.19.0 · Next.js 16.4.4 · React 19.3.0 · TypeScript 5.9.3 · Tailwind CSS 4.3.4 · shadcn 4.23.0

## Fuera del alcance actual

- Despliegue público: pendiente por decisión del solicitante.
- CI/CD: fuera del alcance actual y aplazado.
