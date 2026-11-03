"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DeleteBookDialog } from "@/components/books/delete-book-dialog";
import { ReadingStatusBadge } from "@/components/books/reading-status-badge";
import { LoadError, LoadingMessage } from "@/components/load-state";
import { Button } from "@/components/ui/button";
import { getBook } from "@/lib/books-api";
import { useApiResource } from "@/lib/use-api-resource";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("es", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function BookDetail({ id, canWrite }: { id: string; canWrite: boolean }) {
  const router = useRouter();
  const { data: book, error, reload } = useApiResource(() => getBook(id), id);

  if (error) return <LoadError error={error} onRetry={reload} backHref="/books" />;
  if (!book) return <LoadingMessage>Cargando libro…</LoadingMessage>;

  const fields: [string, ReactNode][] = [
    ["ISBN", book.isbn],
    ["Autor", book.author],
    ["Género", book.genre],
    ["Estado de lectura", <ReadingStatusBadge key="status" status={book.readingStatus} />],
    ["Año de publicación", book.publicationYear],
    ["Páginas", book.pages],
    ["Creado", formatDate(book.createdAt)],
    ["Última modificación", formatDate(book.updatedAt)],
  ];

  return (
    <article className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-2xl font-semibold">{book.title}</h1>
        {canWrite && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/books/${book.id}/edit`}>Editar</Link>
            </Button>
            <DeleteBookDialog book={book} onDeleted={() => router.push("/books")} />
          </div>
        )}
      </div>
      <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {fields.map(([label, value]) => (
          <div key={label}>
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <section>
        <h2 className="text-sm text-muted-foreground">Sinopsis</h2>
        <p className="whitespace-pre-line">
          {book.synopsis ?? "Este libro no tiene sinopsis."}
        </p>
      </section>
      <div>
        <Button variant="link" asChild className="px-0">
          <Link href="/books">← Volver al listado</Link>
        </Button>
      </div>
    </article>
  );
}
