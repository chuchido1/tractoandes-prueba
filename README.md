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

## Verificaciones realizadas

Entorno: macOS con Apple silicon (arm64), Docker 29.5.2 mediante Colima, Docker Compose 5.7.0, Chrome. Fechas: 2–3 de noviembre de 2026. Cada rama se verificó al desarrollarla (los detalles están en la descripción de su Pull Request); la rama `fix/integration-verification` repitió lo esencial **desde un checkout limpio de `main`** (clonado en un directorio aparte y con un proyecto de Docker propio, `-p tractoandes-clean`, para no tocar el volumen de desarrollo).

### Comprobado

| Qué | Cómo y resultado |
|---|---|
| Arranque desde checkout limpio, **sin `.env`** | `docker compose build --no-cache` terminó en 44 s; `docker compose up --build` dejó el frontend respondiendo en ~15 s. Orden db → backend → frontend con healthchecks. |
| Migraciones y seed en base vacía | Flyway aplicó las 8 migraciones (todas `success`); 2 usuarios con hash BCrypt (`$2y$10$…`, 60 caracteres), 15 libros con 15 ISBN distintos. El puerto 5432 no se publica. |
| API en 43 comprobaciones automatizadas con `curl` | **43 correctas, 0 fallidas**, tres ejecuciones seguidas contra el backend y una a través del proxy de Next (cookies, CSRF y logout atraviesan el rewrite). Cubren: 401 sin sesión, CSRF, credenciales incorrectas, correo duplicado, registro con `role` inyectado (queda CONSULTA), logout e invalidación, CRUD, ISBN arbitrario/duplicado en crear y editar, edición con el propio ISBN, campos en blanco, año futuro, decimales, páginas 0 y negativas, sinopsis de 5000 (válida) y 5001 caracteres (400), estado inválido, id inexistente (404) y malformado (400), permisos de CONSULTA (403) y cabeceras de caché. |
| Concurrencia de ISBN | 12 `POST` simultáneos con el mismo ISBN → exactamente **un 201 y once 409**; queda un solo libro. La unicidad la decide PostgreSQL. |
| Restricciones en la base de datos | Probadas saltándose la aplicación: ISBN duplicado, `paginas = 0`, ISBN/título en blanco, correo con mayúsculas, rol y estado de lectura inválidos → rechazados por `UNIQUE`/`CHECK`. |
| Persistencia | Con cambios del usuario hechos (libro creado, libro del seed editado, libro del seed eliminado, cuenta registrada): `docker compose down` **sin `-v`** + `up`. Foto de la base antes y después **idéntica**: el libro eliminado no vuelve, la edición no se sobrescribe, el hash del admin no cambia, no hay duplicados y Flyway dice «up to date». |
| Sobrescribir la configuración con `.env` | Con un `.env` (ignorado por Git) cambiando base, usuario, contraseña, puertos, `SESSION_TIMEOUT` y `SESSION_COOKIE_SECURE`: el backend arrancó con esos valores, la contraseña demo fue **rechazada** desde otro contenedor de la red y la nueva aceptada. |
| Caducidad por inactividad y cookie | Con `SESSION_TIMEOUT=1m`: a los 0, 40 y 80 s con actividad → 200 (la actividad renueva la sesión); tras 70 s sin actividad → 401; un `POST` con la sesión caducada → 401 (no 403: el CSRF sigue siendo válido). Con `SESSION_COOKIE_SECURE=true` la cookie sale `Secure; HttpOnly; SameSite=Lax`. |
| Interfaz (Chrome) | Redirección al login sin sesión; login/registro con errores por campo; CRUD completo y formulario compartido; confirmar y cancelar el borrado; búsqueda, género y estado combinados; paginación (incluida la página vacía tras borrar el último elemento de la última página); roles (CONSULTA sin acciones, «Sin permisos» y 403 en peticiones forzadas); sesión caducada durante el uso; backend detenido (mensaje en español y recuperación); estado de catálogo vacío; títulos y sinopsis con HTML/`<script>` mostrados como texto. |
| Caché de respuestas privadas | Páginas con `Cache-Control: private, no-cache, no-store`; API con `no-cache, no-store`. |
| Calidad del código | `npm run lint`, `npm run typecheck`, `npm run build` y `./mvnw package` sin errores; `npm audit --omit=dev`: 0 vulnerabilidades. |

### Fallido y corregido

| Defecto | Dónde se detectó | Corrección |
|---|---|---|
| La imagen Alpine de PostgreSQL ordena con collation `C` («El Hobbit» antes que «El amor», tildes después de la «z»). | Al probar el listado (rama 3). | `V5` aplica la collation `es-x-icu` a `titulo`. |
| Con esa collation `lower()` no convierte mayúsculas con tilde, así que la búsqueda sin distinguir mayúsculas fallaría con «Ángel». | Al diseñar la búsqueda (rama 5); comprobado: `lower('ÁNGEL')` da `Ángel` con `C` y `ángel` con ICU. | `V6` aplica la misma collation a `autor` y `genero`. |
| Con el backend caído se veía la página de error **por defecto de Next, en inglés**: un `error.tsx` no envuelve al layout de su mismo segmento y la excepción sale del layout protegido. | Probando el fallo de conexión (rama 4). | `error.tsx` movido a la raíz de `app/`. |
| Las rutas inexistentes mostraban el 404 de Next **en inglés**. | Verificación integral (esta rama). | `not-found.tsx` propio en español, que conserva el código 404. |

### No comprobado o sin explicar

- **Un 400 aislado sin explicar:** en la primera ejecución de la batería de 43 comprobaciones, el caso «sinopsis de exactamente 5000 caracteres» devolvió 400 en lugar de 201. No se reprodujo ni a mano (varios tamaños, incluido 5000) ni en las cinco ejecuciones posteriores de la batería (cuatro directas y una por el proxy), y no identifiqué la causa; lo dejo anotado en lugar de ocultarlo.
- **Descarga de imágenes desde cero:** las imágenes base (`postgres`, `node`, `eclipse-temurin`) ya estaban en la caché local de Docker; no probé una descarga completa desde un registro vacío.
- **Arquitectura amd64:** sólo se probó arm64. Las imágenes oficiales son multi-arquitectura, pero no lo comprobé.
- **Otros navegadores** distintos de Chrome, lectores de pantalla y pantallas pequeñas.
- **HTTPS real:** sólo se comprobó que la cookie sale con el atributo `Secure`; no se sirvió la aplicación por HTTPS.
- **Cambio de rol con la sesión abierta** (el rol se lee al iniciar sesión; el comportamiento es el documentado, pero no lo probé).
- **Varias pestañas o usuarios simultáneos** en el mismo navegador, y reinicio del equipo con `restart: unless-stopped`.
- **Clics de ratón de la herramienta de automatización:** durante la verificación de roles dejaron de llegar a la página (ni `pointerdown`). Comprobé que no era la aplicación (el mismo botón disparado por JavaScript funciona) y para algunos pasos envié los formularios con `requestSubmit()`, que ejecuta el mismo manejador de React.

## Fuera del alcance actual

- Despliegue público: pendiente por decisión del solicitante.
- CI/CD: fuera del alcance actual y aplazado.
