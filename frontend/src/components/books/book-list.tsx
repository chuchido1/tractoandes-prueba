"use client";

import Link from "next/link";
import { BookTable } from "@/components/books/book-table";
import { LoadError, LoadingMessage } from "@/components/load-state";
import { Button } from "@/components/ui/button";
import { listBooks } from "@/lib/books-api";
import { useApiResource } from "@/lib/use-api-resource";

export function BookList() {
  const { data: books, error, loading, reload } = useApiResource(listBooks, "all");

  if (error) return <LoadError error={error} onRetry={reload} />;
  if (!books) return <LoadingMessage>Cargando libros…</LoadingMessage>;

  if (books.length === 0) {
    return (
      <div className="grid justify-items-center gap-3 py-12 text-center">
        <p className="text-muted-foreground">Todavía no hay libros en el catálogo.</p>
        <Button asChild>
          <Link href="/books/new">Agregar el primer libro</Link>
        </Button>
      </div>
    );
  }

  return (
    <div aria-busy={loading}>
      <BookTable books={books} onDeleted={reload} />
    </div>
  );
}
