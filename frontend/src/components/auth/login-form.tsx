"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FormAlert } from "@/components/form-alert";
import { TextField } from "@/components/text-field";
import { Button } from "@/components/ui/button";
import { login } from "@/lib/auth-api";
import { describeError } from "@/lib/errors";

type LoginFormProps = {
  notice?: string;
};

export function LoginForm({ notice }: LoginFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSubmitting(true);
    setError(null);
    try {
      await login(String(data.get("email")).trim(), String(data.get("password")));
      router.replace("/books");
      // Vuelve a pedir al servidor lo que dependía de la sesión anterior (caché del router).
      router.refresh();
    } catch (err) {
      setError(describeError(err));
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-4">
      {notice && <FormAlert variant="default" message={notice} />}
      {error && <FormAlert message={error} />}
      <TextField
        name="email"
        label="Correo electrónico"
        type="email"
        autoComplete="email"
      />
      <TextField
        name="password"
        label="Contraseña"
        type="password"
        autoComplete="current-password"
      />
      <Button type="submit" disabled={submitting}>
        {submitting ? "Entrando…" : "Iniciar sesión"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        ¿No tienes cuenta?{" "}
        <Link href="/register" className="text-foreground underline">
          Regístrate
        </Link>
      </p>
    </form>
  );
}
