import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Iniciar sesión" };

type LoginPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { motivo, registrado } = await searchParams;
  const notice =
    motivo === "expirada"
      ? "Tu sesión ha expirado. Inicia sesión de nuevo."
      : registrado === "1"
        ? "Cuenta creada. Ya puedes iniciar sesión."
        : undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Iniciar sesión</CardTitle>
        <CardDescription>Accede al catálogo de libros del club.</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm notice={notice} />
      </CardContent>
    </Card>
  );
}
