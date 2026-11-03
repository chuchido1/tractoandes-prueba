import type { Metadata } from "next";
import { CreateBook } from "@/components/books/create-book";
import { requireUser } from "@/lib/server-auth";

export const metadata: Metadata = { title: "Nuevo libro" };

export default async function NewBookPage() {
  await requireUser();
  return (
    <section className="grid gap-4">
      <h1 className="text-2xl font-semibold">Nuevo libro</h1>
      <CreateBook />
    </section>
  );
}
