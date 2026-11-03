import type { User } from "./types";

/**
 * Sólo ADMIN puede crear, editar y eliminar libros. Esto únicamente decide qué se
 * muestra: el backend es quien impide las escrituras (403) aunque alguien fuerce la petición.
 */
export function canWriteCatalog(user: User): boolean {
  return user.role === "ADMIN";
}

export function roleLabel(role: User["role"]): string {
  return role === "ADMIN" ? "Administrador" : "Consulta";
}
