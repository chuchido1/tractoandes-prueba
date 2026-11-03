# Catálogo de libros — Prueba técnica Tractoandes

Aplicación web para administrar el catálogo de un club de lectura. Proyecto en construcción: este README crece con cada rama y la versión final sigue la estructura pedida en la prueba.

## Estado actual

Funcionan los tres servicios (Next.js, Spring Boot, PostgreSQL) orquestados con Docker Compose, la **autenticación** completa (registro, login, logout y rutas protegidas) y la **API de libros** (CRUD con validaciones). Las pantallas del catálogo llegan en la siguiente rama.

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

| GET | `/api/books` | Lista los libros ordenados por título (alfabético español) y, a igualdad, por id. |
| GET | `/api/books/{id}` | Detalle de un libro. |
| POST | `/api/books` | Crea un libro (201 con cabecera `Location`). |
| PUT | `/api/books/{id}` | Edita un libro (200). |
| DELETE | `/api/books/{id}` | Elimina un libro (204). |

Todos los errores siguen un formato único: `{ status, code, message, fieldErrors, path, timestamp }`. Códigos HTTP: `400` datos o parámetros inválidos (incluye un `id` que no es UUID), `401` sin sesión, `403` sin permiso o CSRF inválido, `404` libro inexistente, `409` ISBN o correo duplicado.

## Reglas de los libros

| Campo (JSON) | Columna | Regla |
|---|---|---|
| `isbn` | `isbn` | Texto obligatorio, único, hasta 50 caracteres. Es texto arbitrario: no se valida formato ni dígito verificador. Se recortan los espacios de los extremos y se distingue mayúsculas de minúsculas. |
| `title`, `author`, `genre` | `titulo`, `autor`, `genero` | Texto obligatorio; no se aceptan vacíos ni sólo espacios. El género es libre (no se limita a los ejemplos del enunciado). |
| `publicationYear` | `anio_publicacion` | Entero obligatorio, no mayor al año actual (se calcula en cada petición). No hay año mínimo. |
| `pages` | `paginas` | Entero obligatorio mayor que cero. |
| `synopsis` | `sinopsis` | Opcional; si llega vacía se guarda como nula. |
| `id`, `createdAt`, `updatedAt` | `id`, `created_at`, `updated_at` | Los genera el sistema; si el cliente los envía se ignoran. |

- Un decimal donde se espera un entero (`12.5`, `10.0`) es un error 400 del campo; no se convierte en silencio.
- La unicidad del ISBN la garantiza PostgreSQL (`uk_books_isbn`), no sólo una consulta previa; editar un libro conservando su propio ISBN funciona.
- Las reglas básicas (no vacío, páginas > 0, ISBN único) también están como restricciones en la base de datos.
- El catálogo es compartido por todos los usuarios.
- Los nombres de columna siguen el enunciado (en español); el JSON y el código usan nombres en inglés.

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
