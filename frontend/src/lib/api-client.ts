import type { ApiErrorBody, FieldError } from "./types";

/**
 * Cliente HTTP para componentes de navegador. Todas las llamadas van a /api en el
 * mismo origen; Next las reenvía al backend (rewrite en next.config.ts).
 * El navegador adjunta la cookie de sesión (HttpOnly) por sí mismo: este código
 * nunca la lee ni guarda credenciales.
 */

const CSRF_COOKIE = "XSRF-TOKEN";
const CSRF_HEADER = "X-XSRF-TOKEN";
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors: FieldError[];

  constructor(
    status: number,
    code: string,
    message: string,
    fieldErrors: FieldError[] = [],
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

function connectionError(): ApiError {
  return new ApiError(
    0,
    "NETWORK_ERROR",
    "No se pudo conectar con el servidor. Comprueba tu conexión e inténtalo de nuevo.",
  );
}

function readCookie(name: string): string | null {
  const entry = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : null;
}

/** El token CSRF vive en una cookie legible; si aún no existe, se pide al backend. */
async function getCsrfToken(): Promise<string> {
  const existing = readCookie(CSRF_COOKIE);
  if (existing) return existing;
  try {
    await fetch("/api/auth/csrf", { cache: "no-store" });
  } catch {
    throw connectionError();
  }
  const issued = readCookie(CSRF_COOKIE);
  if (!issued) {
    throw new ApiError(
      0,
      "CSRF_UNAVAILABLE",
      "No se pudo obtener el token de seguridad. Recarga la página.",
    );
  }
  return issued;
}

async function toApiError(response: Response): Promise<ApiError> {
  try {
    const body = (await response.json()) as ApiErrorBody;
    if (typeof body.code === "string" && typeof body.message === "string") {
      return new ApiError(
        response.status,
        body.code,
        body.message,
        body.fieldErrors ?? [],
      );
    }
  } catch {
    // Sin cuerpo JSON: respuesta del proxy o del servidor fuera del formato de la API.
  }
  return new ApiError(
    response.status,
    "SERVER_ERROR",
    "El servidor no respondió correctamente.",
  );
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  /** Cuerpo JSON (CRUD). */
  json?: unknown;
  /** Cuerpo application/x-www-form-urlencoded (sólo el login de Spring Security). */
  form?: Record<string, string>;
};

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const method = options.method ?? "GET";
  const headers = new Headers({ Accept: "application/json" });
  let body: BodyInit | undefined;

  if (options.json !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(options.json);
  } else if (options.form) {
    body = new URLSearchParams(options.form);
  }
  if (!SAFE_METHODS.has(method)) {
    headers.set(CSRF_HEADER, await getCsrfToken());
  }

  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      headers,
      body,
      cache: "no-store",
    });
  } catch {
    throw connectionError();
  }

  if (!response.ok) {
    const error = await toApiError(response);
    // Sesión caducada durante el uso: navegación completa al login (vacía la caché del
    // router y no deja la pantalla caducada en el historial). El login fallido responde
    // INVALID_CREDENTIALS, no UNAUTHENTICATED, así que no entra aquí.
    if (error.code === "UNAUTHENTICATED") {
      window.location.replace("/login?motivo=expirada");
    }
    throw error;
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
