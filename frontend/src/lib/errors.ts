import { ApiError } from "./api-client";

/**
 * Texto para mostrar al usuario. Los mensajes del backend ya vienen en español
 * y son específicos (validación, duplicados, permisos, inexistente), así que se
 * muestran tal cual; sólo se reescriben los fallos de conexión y de servidor,
 * cuyo mensaje no lo genera la API.
 */
export function describeError(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "Ocurrió un error inesperado. Inténtalo de nuevo.";
  }
  if (error.status === 0) return error.message;
  if (error.status >= 500) {
    return "El servidor tuvo un problema. Inténtalo de nuevo en unos minutos.";
  }
  return error.message;
}

/** Errores de validación por campo, indexados por nombre de campo. */
export function fieldErrorsOf(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError)) return {};
  return Object.fromEntries(
    error.fieldErrors.map(({ field, message }) => [field, message]),
  );
}
