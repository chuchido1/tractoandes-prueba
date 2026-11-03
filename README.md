# Catálogo de libros — Prueba técnica Tractoandes

Aplicación web para administrar el catálogo de un club de lectura: frontend en Next.js, backend independiente en Spring Boot y PostgreSQL, todo con Docker Compose.

## 1. Descripción del proyecto y stack elegido

Sólo los usuarios registrados pueden consultar el catálogo; sólo los administradores pueden modificarlo. Funcionalidad:

- Registro, inicio y cierre de sesión, con rutas protegidas en frontend **y** backend.
- CRUD de libros (listado en tabla, detalle, crear, editar y eliminar con confirmación) con validación en el servidor y errores visibles en la interfaz.
- Extras opcionales del enunciado ya implementados: búsqueda por título o autor, filtro por género, paginación, roles `ADMIN`/`CONSULTA` y estado de lectura con filtro (ver «Estado real de los extras» en el apartado 6).

```
Navegador ──► frontend (Next.js :3000) ──rewrite /api/*──► backend (Spring Boot :8080) ──► db (PostgreSQL :5432)
              mismo origen, sin CORS                        sesiones, reglas, validación    sólo red interna de Docker
```

El navegador sólo habla con `http://localhost:3000`. Next.js sirve las pantallas y **reenvía** `/api/*` al backend; no contiene lógica de negocio (no se usan API Routes ni Server Actions como backend). La autenticación, las reglas y el acceso a datos viven en Spring.

| Capa | Elección | Por qué |
|---|---|---|
| Backend | **Spring Boot 4.1.2**, Java 21, Spring MVC | Estándar de la industria para APIs REST; controlador → servicio → repositorio separa responsabilidades. Java 21 es LTS. |
| Seguridad | **Spring Security** con **sesiones** y **BCrypt** | Framework probado: aporta de serie la rotación del id de sesión, CSRF y autorización por rol. Sesión en servidor = cierre de sesión real. |
| Acceso a datos | Spring Data JPA + Hibernate, **Flyway** | JPA evita SQL repetitivo; Flyway versiona el esquema (el enunciado exige migraciones) y Hibernate sólo lo **valida**. |
| Base de datos | **PostgreSQL 18** (imagen oficial) | Pedido por el enunciado; sus restricciones (`UNIQUE`, `CHECK`) garantizan las invariantes aunque falle la aplicación. |
| Frontend | **Next.js 16.4.4** (App Router) + TypeScript | Pedido por el enunciado. Rutas protegidas validadas en el servidor y componentes cliente sólo donde hay interactividad. |
| Interfaz | **Tailwind CSS 4** + **shadcn/ui** (sólo los componentes usados) | Componentes accesibles y consistentes sin escribir CSS a mano; el código queda en el repositorio. |
| Estado | `fetch` y estado local de React | Suficiente para esta app; sin Redux, Axios ni bibliotecas extra. |
| Contenedores | Docker + Docker Compose | `docker compose up --build` levanta todo sin instalar nada. |

**Pantallas**

| Ruta | Pantalla |
|---|---|
| `/login`, `/register` | Acceso y registro (públicas). |
| `/books` | Listado en tabla con búsqueda, filtros, paginación y, para ADMIN, edición y borrado. |
| `/books/new` | Crear libro (ADMIN). |
| `/books/{id}` | Detalle. |
| `/books/{id}/edit` | Editar, con el mismo formulario que crear (ADMIN). |

**Versiones efectivas**

| Pieza | Versión |
|---|---|
| Spring Boot / Spring Framework | 4.1.2 / 7.0.10 |
| Spring Security / Spring Data JPA | 7.1.2 / 4.1.2 |
| Hibernate / Flyway / driver JDBC | 7.4.13.Final / 12.4.0 / 42.7.14 |
| Jackson / Tomcat embebido | 3.1.7 / 11.0.27 |
| Java (compilación e imagen) | 21 (Eclipse Temurin 21.0.13) |
| PostgreSQL | 18.6 (`postgres:18.6-alpine`) |
| Node.js (imagen) | 24.19.0 (`node:24.19.0-alpine`) |
| Next.js / React / TypeScript | 16.4.4 / 19.3.0 / 5.9.3 |
| Tailwind CSS / shadcn (CLI) | 4.3.4 / 4.23.0 |

Todas las dependencias del frontend están fijadas sin prefijos (`package-lock.json` incluido); Spring Boot administra las versiones del backend.

## 2. Requisitos previos

- **Docker con Docker Compose v2** (Docker Desktop, OrbStack, Colima o Docker Engine en Linux).
- Conexión a internet la primera vez (descarga imágenes base y dependencias durante el build).
- Puertos **3000** (frontend) y **8080** (backend) libres; se pueden cambiar (ver apartado 3). El puerto 5432 **no se publica**, así que no choca con un PostgreSQL local.

No hace falta instalar Java, Maven, Node ni PostgreSQL, ni generar un JAR, ni ejecutar migraciones o el seed a mano.

Probado en macOS con Apple silicon (arm64), Docker 29.5.2 mediante Colima y Compose 5.7.0.

## 3. Cómo levantar el proyecto paso a paso

1. Clona el repositorio y entra en la carpeta:
   ```bash
   git clone https://github.com/chuchido1/tractoandes-prueba.git
   cd tractoandes-prueba
   ```
2. *(Opcional)* Personaliza la configuración. **No hace falta `.env`**: `docker-compose.yml` trae valores de demostración. Si quieres cambiarlos:
   ```bash
   cp .env.example .env   # y edita los valores
   ```
   `.env` está ignorado por Git; `.env.example` sí se versiona.
3. Levanta todo:
   ```bash
   docker compose up --build
   ```
   El primer arranque tarda unos minutos (construye las imágenes). Compose espera a que la base de datos esté lista (healthcheck), luego arranca el backend (que aplica las migraciones y el seed) y por último el frontend.
4. Abre la aplicación:
   - Frontend: http://localhost:3000
   - Backend (para probar con `curl`): http://localhost:8080 — el navegador usa siempre `http://localhost:3000/api/*`.
5. Inicia sesión con una cuenta de prueba (apartado 4).
6. Para detener: `Ctrl+C` o `docker compose down`. **Los datos se conservan** en el volumen `pgdata`. Para empezar de cero (borra los datos): `docker compose down -v`.

**Variables de entorno** (todas opcionales; valores por defecto sólo para demostración local):

| Variable | Por defecto | Para qué |
|---|---|---|
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | `catalog`, `catalog`, `catalog_demo` | Base de datos; el backend usa las mismas. |
| `FRONTEND_PORT`, `BACKEND_PORT` | `3000`, `8080` | Puertos publicados en tu máquina. |
| `SESSION_TIMEOUT` | `30m` | Inactividad tras la cual caduca la sesión. |
| `SESSION_COOKIE_SECURE` | `false` | Poner `true` al servir por HTTPS (con `false` la cookie funciona en `http://localhost`). |
| `BACKEND_INTERNAL_URL` | `http://backend:8080` | Dirección del backend vista desde el contenedor del frontend. Se fija **durante el build** de la imagen (el rewrite de `/api` se evalúa en `next build`). |

**Servicios de Docker Compose**

| Servicio | Imagen | Función | Se comunica con |
|---|---|---|---|
| `db` | `postgres:18.6-alpine` | Base de datos. Datos en el volumen nombrado `pgdata` (montado en `/var/lib/postgresql`, la ruta de PostgreSQL 18). Healthcheck con `pg_isready` por TCP. | — |
| `backend` | `backend/Dockerfile` (multi-etapa, usuario no root) | API REST. Espera a que `db` esté `healthy`. | `db:5432` |
| `frontend` | `frontend/Dockerfile` (multi-etapa, `output: standalone`, usuario no root) | Interfaz y proxy de `/api`. Espera a que `backend` esté `healthy`. | `backend:8080` |

Los servicios se hablan por **nombre de servicio** dentro de la red de Compose (nunca `localhost` entre contenedores); el navegador nunca resuelve `backend` ni `db`.

**Migraciones, seed y persistencia.** El esquema lo crean migraciones SQL de Flyway (`backend/src/main/resources/db/migration`, de `V1` a `V8`) al arrancar el backend; Hibernate sólo valida (`ddl-auto=validate`). El seed (usuarios de prueba y 15 libros) también son migraciones versionadas: se ejecutan **una sola vez**, por eso no se duplican al reiniciar, no recrean libros eliminados ni sobrescriben cambios ni contraseñas. Los datos sobreviven a `docker compose down`/`up` mientras se conserve el volumen.

## 4. Credenciales del usuario de prueba

| Rol | Correo | Contraseña | Puede |
|---|---|---|---|
| ADMIN | `admin@clublectura.test` | `Admin1234` | Ver, crear, editar y eliminar libros. |
| CONSULTA | `consulta@clublectura.test` | `Consulta1234` | Sólo ver, buscar y filtrar. |

Son datos de demostración que crean las migraciones `V2` y `V7` (sólo se guarda el hash BCrypt). También puedes crear una cuenta en http://localhost:3000/register: **las cuentas nuevas son siempre CONSULTA**.

## 5. Endpoints del backend

Todas las rutas cuelgan de `/api`. Salvo las públicas, exigen sesión (si no: `401`).

| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| GET | `/api/auth/csrf` | Emite la cookie `XSRF-TOKEN` (204). | Público |
| POST | `/api/auth/register` | Crea una cuenta con `name`, `email`, `password` (JSON, 201). Siempre rol CONSULTA. | Público |
| POST | `/api/auth/login` | Inicia sesión con `email` y `password` (**formulario** `application/x-www-form-urlencoded`). Devuelve el usuario y la cookie de sesión. | Público |
| POST | `/api/auth/logout` | Invalida la sesión en el servidor (204). | Cualquiera |
| GET | `/api/auth/me` | Usuario de la sesión actual (incluye `role`). | Sesión |
| GET | `/api/books?q=&genre=&status=&page=&size=` | Lista paginada y filtrada: `{ items, page, size, totalItems, totalPages }`. | Sesión |
| GET | `/api/books/genres` | Géneros existentes, sin repetir. | Sesión |
| GET | `/api/books/{id}` | Detalle de un libro. | Sesión |
| POST | `/api/books` | Crea un libro (201 con cabecera `Location`). | ADMIN |
| PUT | `/api/books/{id}` | Edita un libro (200). | ADMIN |
| DELETE | `/api/books/{id}` | Elimina un libro (204). | ADMIN |

**Parámetros del listado:** `q` (texto en título **o** autor), `genre` (género exacto), `status` (`PENDIENTE`, `LEYENDO` o `LEIDO`), `page` (desde 0, por defecto 0) y `size` (1–50, por defecto 10). Los filtros se combinan con **AND**, se aplican en la base de datos antes de paginar y el orden es estable (título e id).

**Cuerpo de un libro (JSON):** `isbn`, `title`, `author`, `genre`, `publicationYear`, `pages`, `synopsis` (opcional), `readingStatus` (opcional). `id`, `createdAt` y `updatedAt` los genera el sistema.

**Códigos HTTP:** `200` consultas y actualizaciones · `201` creación · `204` eliminación y logout · `400` datos o parámetros inválidos (incluye un `id` que no es UUID) · `401` sin sesión · `403` sin permiso o CSRF inválido · `404` libro inexistente · `409` ISBN o correo duplicado.

**Formato de error** (el mismo para controladores y para Spring Security):

```json
{
  "status": 400,
  "code": "VALIDATION_ERROR",
  "message": "Los datos enviados no son válidos.",
  "fieldErrors": [{ "field": "pages", "message": "El número de páginas debe ser mayor que cero." }],
  "path": "/api/books",
  "timestamp": "2026-11-03T05:56:31.036Z"
}
```

Códigos de aplicación: `VALIDATION_ERROR`, `MALFORMED_REQUEST`, `INVALID_PARAMETER`, `UNAUTHENTICATED`, `INVALID_CREDENTIALS`, `FORBIDDEN`, `CSRF_INVALID`, `NOT_FOUND`, `METHOD_NOT_ALLOWED`, `UNSUPPORTED_MEDIA_TYPE`, `ISBN_DUPLICATED`, `EMAIL_DUPLICATED` e `INTERNAL_ERROR`.

## 6. Decisiones técnicas, pendientes y mejoras futuras

### Autenticación y sus límites

Se eligieron **sesiones de Spring Security** (no JWT) con contraseñas hasheadas con **BCrypt**.

- **Por qué sesiones:** una sola instancia y un solo frontend. La sesión vive en el servidor, así que cerrar sesión la invalida de verdad; el navegador sólo guarda una cookie `HttpOnly` que JavaScript no puede leer, y no hay token que guardar ni revocar en el cliente. Un JWT habría exigido almacenarlo en el navegador y resolver su revocación.
- **Cookie de sesión:** `HttpOnly`, `SameSite=Lax` y `Secure` configurable (`SESSION_COOKIE_SECURE`; `false` para `http://localhost`).
- **Fijación de sesión:** al autenticar, Spring cambia el identificador de sesión y rota el token CSRF.
- **Caducidad:** por inactividad (`SESSION_TIMEOUT`, 30 minutos por defecto); la actividad la renueva.
- **CSRF:** cookie `XSRF-TOKEN` + cabecera `X-XSRF-TOKEN` en toda petición que no sea de lectura. Un fallo devuelve `403 CSRF_INVALID`, distinto de la falta de permisos (`403 FORBIDDEN`).
- **Rutas protegidas en ambos lados:** el backend responde `401` a todo el catálogo sin sesión; el frontend valida la sesión **contra el backend** en el servidor (`requireUser()`), no sólo comprueba que exista una cookie.
- **Contraseñas:** sólo se guarda el hash BCrypt; nunca se devuelve. Se exigen de 8 a 72 bytes (BCrypt ignora lo que pasa de 72; se rechaza en vez de truncar en silencio).
- **Nada sensible en el navegador:** ni contraseñas ni ids de sesión en `localStorage`; las respuestas privadas salen con `Cache-Control: no-store`.
- **Diferencia de formato:** el login es un formulario URL-encoded porque lo procesa un filtro estándar de Spring Security; el resto de la API usa JSON.

**Límites conocidos**

- Las sesiones están **en memoria**: si el backend se reinicia, se cierran todas (el usuario vuelve al login); usuarios y libros siguen en PostgreSQL. Con varias instancias del backend harían falta sesiones compartidas.
- El rol viaja en la sesión: un cambio de rol en la base de datos aplica en el siguiente inicio de sesión.
- No hay límite de intentos de inicio de sesión, recuperación de contraseña ni verificación de correo (no se pidieron).
- No hay administración de usuarios: un segundo ADMIN sólo se crea desde la base de datos.

### Decisiones técnicas

- **Proxy del mismo origen:** el navegador llama a `/api` en su propio origen y un `rewrite` fijo de Next lo reenvía al backend. Así la cookie de sesión es de primera parte y no hace falta CORS. El rewrite sólo transporta: nada de lógica en Next.
- **`requireUser()` en el layout y en cada página protegida:** los layouts de Next no se vuelven a ejecutar en las navegaciones del cliente, así que no pueden ser la única comprobación (lo advierte su documentación).
- **Autorización en el backend:** `SecurityConfig` exige sesión para `GET /api/books/**` y el rol `ADMIN` para cualquier otro método sobre `/api/books/**`. Ocultar botones es sólo comodidad; una petición manipulada recibe `403`.
- **El cliente no elige su rol:** el registro no acepta campo de rol, el constructor de `User` fija `CONSULTA` y la columna tiene valor por defecto y `CHECK` en PostgreSQL (tres capas).
- **Unicidad en PostgreSQL:** el ISBN (y el correo) son `UNIQUE`; el servicio usa `saveAndFlush` y traduce la violación de la restricción a `409`. No hay consulta previa (tendría una condición de carrera). Probado con 12 peticiones simultáneas: un `201` y once `409`.
- **Seed como migraciones versionadas de Flyway:** se ejecutan una vez, no necesitan lógica de «insertar si no existe» y no pisan lo que haga el usuario.
- **Errores uniformes:** un `@RestControllerAdvice` (extiende `ResponseEntityExceptionHandler`) y un `JsonResponseWriter` para los filtros de seguridad dan el mismo formato a todos los errores.
- **Collation `es-x-icu` en `titulo`, `autor` y `genero`:** la imagen Alpine de PostgreSQL ordena con collation `C` (mayúsculas antes que minúsculas, tildes después de la «z», y `lower()` no convierte mayúsculas con tilde). Se fija en el esquema, no en el clúster.
- **Búsqueda con `Specification` de JPA:** consultas parametrizadas; los `%` y `_` del usuario se escapan. Un `q` o `genre` vacío o en blanco se ignora.
- **Sin dependencias que no hacen falta:** nada de Redux, Axios, MapStruct, Actuator, Redis ni colas.

### Reglas del enunciado y ambigüedades resueltas

| Tema | Decisión |
|---|---|
| ISBN | Texto arbitrario obligatorio y único, hasta 50 caracteres; no se valida formato ni dígito verificador. Se recortan los espacios de los extremos y se distingue mayúsculas de minúsculas. |
| Textos obligatorios | Título, autor, género e ISBN no pueden estar vacíos ni ser sólo espacios. El género es libre (no se limita a los ejemplos del enunciado). |
| Año de publicación | Entero, no mayor al año **actual** (se calcula en cada validación); no hay año mínimo. |
| Decimales | `12.5` o `10.0` donde se espera un entero dan `400` en ese campo; no se truncan. |
| Sinopsis | Opcional, hasta 5000 caracteres; vacía se guarda como nula. |
| `id` y fechas | Los genera el sistema; si el cliente los envía se ignoran. |
| Catálogo | **Compartido** por todos los usuarios. |
| Estado de lectura | `PENDIENTE`, `LEYENDO` o `LEIDO`, **por libro** (no por usuario). Opcional al enviar: al crear queda `PENDIENTE`, al editar se conserva. Sólo ADMIN lo cambia. |
| Búsqueda | `q` busca el texto en título **o** autor (contiene); no distingue mayúsculas pero **sí acentos** (`garcia` no encuentra `García`). `genre` y `status` filtran por igualdad; todo se combina con AND. |
| Paginación | `page` desde 0, `size` 1–50 (10 por defecto); fuera de rango → `400`. Una página fuera de rango devuelve la lista vacía con los totales. |
| Roles | ADMIN: CRUD completo. CONSULTA: sólo lectura. El registro público asigna CONSULTA desde el servidor. |
| Nombres | Las columnas siguen el enunciado (`titulo`, `autor`, `genero`, `anio_publicacion`, `paginas`, `sinopsis`); el JSON y el código usan nombres en inglés. |

### Estado real de los extras

| Extra del enunciado | Estado |
|---|---|
| Búsqueda por título o autor y filtro por género | **Implementado** y verificado. |
| Paginación | **Implementada** y verificada (incluye retroceder al borrar el último elemento de una página). |
| Roles `admin` y `consulta` | **Implementados** en backend y frontend, y verificados. |
| Estado de lectura por libro con filtro | **Implementado** y verificado. |
| Despliegue en un servidor gratuito | **Pendiente por decisión del solicitante.** No se ha ejecutado ni se ha preparado infraestructura de ningún proveedor. |
| CI/CD | **Fuera del alcance actual y aplazado.** No hay GitHub Actions ni pipelines. |

### Verificaciones realizadas

Entorno: macOS con Apple silicon (arm64), Docker 29.5.2 mediante Colima, Docker Compose 5.7.0, Chrome. Fechas: 2–3 de noviembre de 2026. Cada rama se verificó al desarrollarla (los detalles están en la descripción de su Pull Request); `fix/integration-verification` repitió lo esencial **desde un checkout limpio de `main`**, clonado en un directorio aparte y con un proyecto de Docker propio (`-p tractoandes-clean`) para no tocar el volumen de desarrollo.

**Comprobado**

| Qué | Cómo y resultado |
|---|---|
| Arranque desde checkout limpio, **sin `.env`** | `docker compose build --no-cache` terminó en 44 s; `docker compose up --build` dejó el frontend respondiendo en ~15 s. Orden db → backend → frontend con healthchecks. |
| Migraciones y seed en base vacía | Flyway aplicó las 8 migraciones (todas `success`); 2 usuarios con hash BCrypt (`$2y$10$…`, 60 caracteres), 15 libros con 15 ISBN distintos. El puerto 5432 no se publica. |
| API en 43 comprobaciones con `curl` | **43 correctas, 0 fallidas**, tres ejecuciones seguidas contra el backend y una a través del proxy de Next (cookies, CSRF y logout atraviesan el rewrite). Cubren: 401 sin sesión, CSRF, credenciales incorrectas, correo duplicado, registro con `role` inyectado (queda CONSULTA), logout e invalidación, CRUD, ISBN arbitrario y duplicado en crear y editar, edición con el propio ISBN, campos en blanco, año futuro, decimales, páginas 0 y negativas, sinopsis de 5000 (válida) y 5001 caracteres (400), estado inválido, id inexistente (404) y malformado (400), permisos de CONSULTA (403) y cabeceras de caché. |
| Concurrencia de ISBN | 12 `POST` simultáneos con el mismo ISBN → exactamente **un 201 y once 409**; queda un solo libro. |
| Restricciones en la base de datos | Probadas saltándose la aplicación: ISBN duplicado, `paginas = 0`, ISBN/título en blanco, correo con mayúsculas, rol y estado de lectura inválidos → rechazados por `UNIQUE`/`CHECK`. |
| Persistencia | Con cambios del usuario hechos (libro creado, libro del seed editado, libro del seed eliminado, cuenta registrada): `docker compose down` **sin `-v`** + `up`. Foto de la base antes y después **idéntica**: lo eliminado no vuelve, la edición no se sobrescribe, el hash del admin no cambia, no hay duplicados y Flyway dice «up to date». |
| Configuración con `.env` | Con un `.env` (ignorado por Git) cambiando base, usuario, contraseña, puertos, `SESSION_TIMEOUT` y `SESSION_COOKIE_SECURE`: el backend arrancó con esos valores, la contraseña demo fue **rechazada** desde otro contenedor de la red y la nueva aceptada. |
| Caducidad por inactividad y cookie | Con `SESSION_TIMEOUT=1m`: a los 0, 40 y 80 s con actividad → 200 (la actividad renueva la sesión); tras 70 s sin actividad → 401; un `POST` con la sesión caducada → 401 (no 403). Con `SESSION_COOKIE_SECURE=true` la cookie sale `Secure; HttpOnly; SameSite=Lax`. |
| Interfaz (Chrome) | Redirección al login sin sesión; login y registro con errores por campo; CRUD completo y formulario compartido; confirmar y cancelar el borrado; búsqueda, género y estado combinados; paginación (incluida la página vacía tras borrar el último elemento de la última página); roles (CONSULTA sin acciones, «Sin permisos» y 403 en peticiones forzadas); sesión caducada durante el uso; backend detenido (mensaje en español y recuperación); catálogo vacío; títulos y sinopsis con HTML o `<script>` mostrados como texto; 404 en español. |
| Caché de respuestas privadas | Páginas con `Cache-Control: private, no-cache, no-store`; API con `no-cache, no-store`. |
| Calidad del código | `npm run lint`, `npm run typecheck`, `npm run build` y `./mvnw package` sin errores; `npm audit --omit=dev`: 0 vulnerabilidades. |

**Fallido y corregido**

| Defecto | Corrección |
|---|---|
| La imagen Alpine de PostgreSQL ordena con collation `C` («El Hobbit» antes que «El amor», tildes después de la «z»). | `V5`: collation `es-x-icu` en `titulo`. |
| Con esa collation `lower()` no convierte mayúsculas con tilde, así que la búsqueda sin distinguir mayúsculas fallaría con «Ángel» (comprobado: `lower('ÁNGEL')` da `Ángel` con `C` y `ángel` con ICU). | `V6`: la misma collation en `autor` y `genero`. |
| Con el backend caído se veía la página de error **por defecto de Next, en inglés**: un `error.tsx` no envuelve al layout de su mismo segmento. | `error.tsx` movido a la raíz de `app/`. |
| Las rutas inexistentes mostraban el 404 de Next **en inglés**. | `not-found.tsx` propio en español, que conserva el código 404. |

**No comprobado o sin explicar**

- **Un 400 aislado sin explicar:** en la primera ejecución de la batería, el caso «sinopsis de exactamente 5000 caracteres» devolvió 400 en lugar de 201. No se reprodujo ni a mano (varios tamaños, incluido 5000) ni en las cinco ejecuciones posteriores (cuatro directas y una por el proxy), y no identifiqué la causa; queda anotado en lugar de ocultarlo.
- **Descarga de imágenes desde cero:** las imágenes base ya estaban en la caché local de Docker; no probé una descarga completa desde un registro vacío.
- **Arquitectura amd64:** sólo se probó arm64 (las imágenes oficiales son multi-arquitectura, pero no lo comprobé).
- **Otros navegadores** distintos de Chrome, lectores de pantalla y pantallas pequeñas.
- **HTTPS real:** sólo se comprobó que la cookie sale con el atributo `Secure`; no se sirvió la aplicación por HTTPS.
- **Cambio de rol con la sesión abierta**, varias pestañas o usuarios simultáneos en el mismo navegador, y reinicio del equipo con `restart: unless-stopped`.
- **Clics de ratón de la herramienta de automatización:** durante la verificación de roles dejaron de llegar a la página (ni `pointerdown`). Comprobé que no era la aplicación (el mismo botón disparado por JavaScript funciona) y para algunos pasos envié los formularios con `requestSubmit()`, que ejecuta el mismo manejador de React.

### Pendientes y mejoras futuras

**Decididos fuera del alcance actual**

- **Despliegue público:** pendiente por decisión del solicitante. La configuración está pensada para adaptarse (variables de entorno, dirección interna del backend, cookie `Secure` configurable) pero no se ha preparado nada específico de un proveedor.
- **CI/CD:** fuera del alcance actual y aplazado.
- **Pruebas automatizadas** (JUnit con Testcontainers, Playwright): no se añadió infraestructura de pruebas por decisión de alcance; la verificación se hizo con compilación, lint, tipos, solicitudes HTTP y recorridos manuales (ver arriba).

**Con más tiempo**

- Sesiones compartidas (Spring Session con JDBC o Redis) para varias instancias y para que un reinicio no cierre sesiones.
- Límite de intentos de login, cambio y recuperación de contraseña, y administración de usuarios.
- Búsqueda que ignore acentos (`unaccent`) y trigramas (`pg_trgm`) para catálogos grandes: hoy `LIKE '%x%'` no usa índices.
- Filtros y página en la URL (enlaces compartibles y botón «atrás»).
- Control de concurrencia optimista al editar (hoy gana la última escritura).
- HTTPS delante de la aplicación, digests fijos para las imágenes base y copias de seguridad de PostgreSQL.
- Healthcheck del frontend y probar amd64 y otros navegadores.
