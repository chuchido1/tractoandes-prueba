import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { User } from "./types";

const SESSION_COOKIE = "JSESSIONID";
const backendUrl = process.env.BACKEND_INTERNAL_URL ?? "http://localhost:8080";

/**
 * Pregunta al backend quién es el usuario de la sesión actual. Que exista la
 * cookie no basta: sólo Spring sabe si la sesión sigue siendo válida.
 * Si el backend no responde, la excepción llega al error.tsx de la ruta.
 */
const fetchCurrentUser = cache(async (): Promise<User | null> => {
  const sessionId = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const response = await fetch(`${backendUrl}/api/auth/me`, {
    headers: { Cookie: `${SESSION_COOKIE}=${sessionId}` },
    cache: "no-store",
  });
  if (response.status === 401) return null;
  if (!response.ok) {
    throw new Error(`El backend respondió ${response.status} al validar la sesión`);
  }
  return (await response.json()) as User;
});

/**
 * Verifica la sesión o redirige al login. Se llama desde el layout protegido
 * y desde cada página protegida: los layouts no se vuelven a ejecutar en las
 * navegaciones del cliente, así que no pueden ser la única comprobación.
 * `cache` evita repetir la petición dentro de un mismo render.
 */
export async function requireUser(): Promise<User> {
  const user = await fetchCurrentUser();
  if (!user) redirect("/login");
  return user;
}
