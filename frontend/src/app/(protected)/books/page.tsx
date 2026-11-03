import type { Metadata } from "next";
import { requireUser } from "@/lib/server-auth";

export const metadata: Metadata = { title: "Libros" };

export default async function BooksPage() {
  const user = await requireUser();
  return (
    <section className="grid gap-2">
      <h1 className="text-2xl font-semibold">Libros</h1>
      <p className="text-sm text-muted-foreground">
        Hola, {user.name}. El catálogo se incorpora en las siguientes ramas.
      </p>
    </section>
  );
}
