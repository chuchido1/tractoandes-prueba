import type { Metadata } from "next";
import { EditBook } from "@/components/books/edit-book";
import { NoPermission } from "@/components/no-permission";
import { canWriteCatalog } from "@/lib/permissions";
import { requireUser } from "@/lib/server-auth";

export const metadata: Metadata = { title: "Editar libro" };

export default async function EditBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!canWriteCatalog(await requireUser())) return <NoPermission />;
  const { id } = await params;
  return (
    <section className="grid gap-4">
      <h1 className="text-2xl font-semibold">Editar libro</h1>
      <EditBook id={id} />
    </section>
  );
}
