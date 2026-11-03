"use client";

import { BookForm } from "@/components/books/book-form";
import { LoadError, LoadingMessage } from "@/components/load-state";
import { getBook, updateBook } from "@/lib/books-api";
import { useApiResource } from "@/lib/use-api-resource";

export function EditBook({ id }: { id: string }) {
  const { data: book, error, reload } = useApiResource(() => getBook(id), id);

  if (error) return <LoadError error={error} onRetry={reload} backHref="/books" />;
  if (!book) return <LoadingMessage>Cargando libro…</LoadingMessage>;

  return (
    <BookForm
      initialBook={book}
      submitLabel="Guardar cambios"
      submittingLabel="Guardando…"
      cancelHref={`/books/${id}`}
      onSubmit={(input) => updateBook(id, input)}
    />
  );
}
