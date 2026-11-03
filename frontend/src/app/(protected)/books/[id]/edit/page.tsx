import type { Metadata } from "next";
import { EditBook } from "@/components/books/edit-book";
import { requireUser } from "@/lib/server-auth";

export const metadata: Metadata = { title: "Editar libro" };

export default async function EditBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;
  return (
    <section className="grid gap-4">
      <h1 className="text-2xl font-semibold">Editar libro</h1>
      <EditBook id={id} />
    </section>
  );
}
