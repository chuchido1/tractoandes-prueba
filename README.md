# Catálogo de libros — Prueba técnica Tractoandes

Aplicación web para administrar el catálogo de un club de lectura. Proyecto en construcción: este README crece con cada rama y la versión final sigue la estructura pedida en la prueba.

## Estado actual

Funcionan los tres servicios (Next.js, Spring Boot, PostgreSQL) orquestados con Docker Compose, la **autenticación** completa (registro, login, logout y rutas protegidas), la **API de libros** (CRUD con validaciones), las **pantallas del catálogo** (tabla, detalle, crear, editar y eliminar con confirmación), **búsqueda, filtro por género y paginación**, **roles** (ADMIN y CONSULTA) y **estado de lectura** con filtro.

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

| Rol | Correo | Contraseña |
|---|---|---|
| ADMIN (crear, editar y eliminar) | `admin@clublectura.test` | `Admin1234` |
| CONSULTA (sólo lectura) | `consulta@clublectura.test` | `Consulta1234` |

Son datos de demostración que crean las migraciones `V2` y `V7` (sólo se guarda el hash BCrypt). También puedes crear una cuenta en http://localhost:3000/register: **las cuentas nuevas son siempre CONSULTA**.

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

## Roles y permisos

| | ADMIN | CONSULTA |
|---|---|---|
| Ver listado, detalle, buscar y filtrar | Sí | Sí |
| Crear, editar y eliminar libros | Sí | No (`403 FORBIDDEN`) |

- **Se aplica en el backend**: `SecurityConfig` exige sesión para `GET /api/books/**` y el rol `ADMIN` para cualquier otro método sobre `/api/books/**`. Ocultar botones en la interfaz es sólo comodidad; una petición manipulada recibe 403 igualmente.
- **El cliente no elige su rol**: el registro público no acepta ningún campo de rol (se ignora si se envía), el constructor de `User` fija `CONSULTA` y la columna `role` tiene `DEFAULT 'CONSULTA'` y un `CHECK` en PostgreSQL.
- El rol viaja en la sesión: si se cambia en la base de datos, se aplica en el siguiente inicio de sesión.
- No hay administración de usuarios (no se pidió): un ADMIN adicional sólo se crea desde la base de datos.
- En la interfaz, CONSULTA no ve «Nuevo libro» ni las acciones de la tabla, y `/books/new` y `/books/{id}/edit` muestran «Sin permisos».

## Estado de lectura

- Valores: `PENDIENTE`, `LEYENDO`, `LEIDO` (en la interfaz: Pendiente, Leyendo, Leído).
- **Pertenece al libro**, no a cada usuario: el catálogo es compartido, así que el estado es el mismo para todos.
- Opcional al enviar: al crear, si falta, queda `PENDIENTE`; al editar, si falta, se conserva el actual. Un valor inválido da 400 con los valores permitidos (el contrato distingue mayúsculas).
- Sólo ADMIN puede cambiarlo (es una edición del libro). Se filtra con `status`, combinable con `q` y `genre`.

## Pantallas

| Ruta | Pantalla |
|---|---|
| `/login`, `/register` | Acceso y registro (públicas). |
| `/books` | Listado en tabla con búsqueda, filtros, paginación y, para ADMIN, edición y borrado. |
| `/books/new` | Crear libro. |
| `/books/{id}` | Detalle. |
| `/books/{id}/edit` | Editar (usa el mismo formulario que crear). |

- Todas las rutas salvo login y registro validan la sesión en el servidor antes de renderizar.
- Los formularios muestran los errores del backend junto a cada campo (validación, ISBN duplicado) y conservan lo escrito cuando algo falla.
- Si la sesión caduca mientras se usa una pantalla, se vuelve al login con un aviso. Si el backend no responde, se muestra un mensaje de error en español en lugar de la página por defecto de Next.
- Borrar pide confirmación en un diálogo; cancelar no modifica nada.

## Endpoints del backend

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/auth/csrf` | Emite la cookie `XSRF-TOKEN` (204). Público. |
| POST | `/api/auth/register` | Crea una cuenta (201). Público. |
| POST | `/api/auth/login` | Inicia sesión con `email` y `password` (formulario). Devuelve el usuario. |
| POST | `/api/auth/logout` | Invalida la sesión (204). |
| GET | `/api/auth/me` | Usuario de la sesión actual; 401 si no hay sesión. |

| GET | `/api/books?q=&genre=&page=&size=` | Lista paginada y filtrada (ver «Búsqueda y paginación»). |
| GET | `/api/books/genres` | Géneros existentes, sin repetir (alimenta el filtro y las sugerencias del formulario). |
| GET | `/api/books/{id}` | Detalle de un libro. |
| POST | `/api/books` | Crea un libro (201 con cabecera `Location`). |
| PUT | `/api/books/{id}` | Edita un libro (200). |
| DELETE | `/api/books/{id}` | Elimina un libro (204). |

Todos los errores siguen un formato único: `{ status, code, message, fieldErrors, path, timestamp }`. Códigos HTTP: `400` datos o parámetros inválidos (incluye un `id` que no es UUID), `401` sin sesión, `403` sin permiso o CSRF inválido, `404` libro inexistente, `409` ISBN o correo duplicado.

## Búsqueda y paginación

`GET /api/books` acepta:

| Parámetro | Significado |
|---|---|
| `q` | Texto que debe aparecer en el **título O el autor** (contiene). |
| `genre` | Género exacto. Se combina con `q` mediante **AND**. |
| `status` | Estado de lectura (`PENDIENTE`, `LEYENDO` o `LEIDO`). También se combina con AND. |
| `page` | Número de página, desde 0 (por defecto 0). |
| `size` | Elementos por página, de 1 a 50 (por defecto 10). Fuera de rango → 400. |

- **Mayúsculas y acentos:** `q` y `genre` no distinguen mayúsculas (`GARCÍA` encuentra `García`, también con tilde) pero **sí distinguen acentos** (`garcia` no encuentra `García`). Se usa la collation ICU `es-x-icu` en las columnas, porque con la collation `C` de la imagen Alpine `lower()` no convertiría las mayúsculas con tilde.
- Los `%` y `_` que escriba el usuario se buscan como texto literal (se escapan). Las consultas son parametrizadas.
- Un `q` o `genre` vacío o en blanco se ignora.
- Los filtros se aplican en la base de datos **antes** de paginar. El orden es por título y, a igualdad, por id, así que las páginas son estables.
- Respuesta: `{ items, page, size, totalItems, totalPages }`. Una página fuera de rango devuelve `items` vacío con los totales correctos.
- En la interfaz, cambiar un filtro vuelve a la página 1; si se borra el único libro de una página que no es la primera, se retrocede una página. El texto se aplica al pulsar «Buscar» o Intro; el género, al elegirlo.

## Reglas de los libros

| Campo (JSON) | Columna | Regla |
|---|---|---|
| `isbn` | `isbn` | Texto obligatorio, único, hasta 50 caracteres. Es texto arbitrario: no se valida formato ni dígito verificador. Se recortan los espacios de los extremos y se distingue mayúsculas de minúsculas. |
| `title`, `author`, `genre` | `titulo`, `autor`, `genero` | Texto obligatorio; no se aceptan vacíos ni sólo espacios. El género es libre (no se limita a los ejemplos del enunciado). |
| `publicationYear` | `anio_publicacion` | Entero obligatorio, no mayor al año actual (se calcula en cada petición). No hay año mínimo. |
| `pages` | `paginas` | Entero obligatorio mayor que cero. |
| `synopsis` | `sinopsis` | Opcional; si llega vacía se guarda como nula. |
| `readingStatus` | `estado_lectura` | Opcional; ver «Estado de lectura». |
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
