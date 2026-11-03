import { apiFetch } from "./api-client";
import type { User } from "./types";

// Spring Security procesa el login como formulario URL-encoded (no JSON).
export function login(email: string, password: string): Promise<User> {
  return apiFetch<User>("/auth/login", {
    method: "POST",
    form: { email, password },
  });
}

export function register(input: {
  name: string;
  email: string;
  password: string;
}): Promise<User> {
  return apiFetch<User>("/auth/register", { method: "POST", json: input });
}

export function logout(): Promise<void> {
  return apiFetch<void>("/auth/logout", { method: "POST" });
}
