import type { Metadata } from "next";
import Link from "next/link";
import { BookList } from "@/components/books/book-list";
import { Button } from "@/components/ui/button";
import { canWriteCatalog } from "@/lib/permissions";
import { requireUser } from "@/lib/server-auth";

export const metadata: Metadata = { title: "Libros" };

export default async function BooksPage() {
  const canWrite = canWriteCatalog(await requireUser());
  return (
    <section className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Libros</h1>
        {canWrite && (
          <Button asChild>
            <Link href="/books/new">Nuevo libro</Link>
          </Button>
        )}
      </div>
      <BookList canWrite={canWrite} />
    </section>
  );
}
