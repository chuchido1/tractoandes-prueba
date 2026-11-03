"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FormAlert } from "@/components/form-alert";
import { TextField } from "@/components/text-field";
import { Button } from "@/components/ui/button";
import { register } from "@/lib/auth-api";
import { describeError, fieldErrorsOf } from "@/lib/errors";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSubmitting(true);
    setError(null);
    setFieldErrors({});
    try {
      await register({
        name: String(data.get("name")).trim(),
        email: String(data.get("email")).trim(),
        password: String(data.get("password")),
      });
      router.push("/login?registrado=1");
    } catch (err) {
      setFieldErrors(fieldErrorsOf(err));
      setError(describeError(err));
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-4">
      {error && <FormAlert message={error} />}
      <TextField
        name="name"
        label="Nombre"
        autoComplete="name"
        error={fieldErrors.name}
      />
      <TextField
        name="email"
        label="Correo electrónico"
        type="email"
        autoComplete="email"
        error={fieldErrors.email}
      />
      <TextField
        name="password"
        label="Contraseña (mínimo 8 caracteres)"
        type="password"
        autoComplete="new-password"
        error={fieldErrors.password}
      />
      <Button type="submit" disabled={submitting}>
        {submitting ? "Creando cuenta…" : "Crear cuenta"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-foreground underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
