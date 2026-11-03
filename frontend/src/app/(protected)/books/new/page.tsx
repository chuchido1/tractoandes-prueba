import type { Metadata } from "next";
import { CreateBook } from "@/components/books/create-book";
import { NoPermission } from "@/components/no-permission";
import { canWriteCatalog } from "@/lib/permissions";
import { requireUser } from "@/lib/server-auth";

export const metadata: Metadata = { title: "Nuevo libro" };

export default async function NewBookPage() {
  if (!canWriteCatalog(await requireUser())) return <NoPermission />;
  return (
    <section className="grid gap-4">
      <h1 className="text-2xl font-semibold">Nuevo libro</h1>
      <CreateBook />
    </section>
  );
}
