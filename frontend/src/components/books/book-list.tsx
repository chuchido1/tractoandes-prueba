"use client";

import { useState } from "react";
import Link from "next/link";
import { BookFiltersBar } from "@/components/books/book-filters";
import { BookTable } from "@/components/books/book-table";
import { Pagination } from "@/components/books/pagination";
import { LoadError, LoadingMessage } from "@/components/load-state";
import { Button } from "@/components/ui/button";
import { listBooks, listGenres } from "@/lib/books-api";
import type { Book, BookFilters, Page } from "@/lib/types";
import { useApiResource } from "@/lib/use-api-resource";

const NO_FILTERS: BookFilters = { q: "", genre: "", status: "" };

/** Si la página pedida quedó vacía (p. ej. se borró su último libro), muestra la última que exista. */
async function fetchPage(filters: BookFilters, page: number): Promise<Page<Book>> {
  const result = await listBooks(filters, page);
  if (result.items.length === 0 && result.totalPages > 0 && page > 0) {
    return listBooks(filters, result.totalPages - 1);
  }
  return result;
}

export function BookList({ canWrite }: { canWrite: boolean }) {
  const [filters, setFilters] = useState<BookFilters>(NO_FILTERS);
  const [page, setPage] = useState(0);
  const { data: books, error, loading, reload } = useApiResource(
    () => fetchPage(filters, page),
    `${filters.q}|${filters.genre}|${filters.status}|${page}`,
  );
  // Los géneros sólo alimentan el filtro: si fallan, el filtro queda sin opciones.
  const { data: genres } = useApiResource(listGenres, "genres");

  function changeFilters(next: BookFilters) {
    setFilters(next);
    setPage(0);
  }

  function handleDeleted() {
    // Al borrar el único libro de una página que no es la primera, se retrocede una.
    if (books && books.items.length === 1 && books.page > 0) {
      setPage(books.page - 1);
    } else {
      reload();
    }
  }

  const filtering = filters.q !== "" || filters.genre !== "" || filters.status !== "";

  return (
    <div className="grid gap-4">
      <BookFiltersBar
        filters={filters}
        genres={genres ?? []}
        onChange={changeFilters}
      />
      {error ? (
        <LoadError error={error} onRetry={reload} />
      ) : !books ? (
        <LoadingMessage>Cargando libros…</LoadingMessage>
      ) : books.totalItems === 0 ? (
        <EmptyState
          filtering={filtering}
          canWrite={canWrite}
          onClear={() => changeFilters(NO_FILTERS)}
        />
      ) : (
        <div
          aria-busy={loading}
          className={loading ? "grid gap-4 opacity-60" : "grid gap-4"}
        >
          <BookTable books={books.items} canWrite={canWrite} onDeleted={handleDeleted} />
          <Pagination page={books} disabled={loading} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}

type EmptyStateProps = { filtering: boolean; canWrite: boolean; onClear: () => void };

function EmptyState({ filtering, canWrite, onClear }: EmptyStateProps) {
  if (filtering) {
    return (
      <div className="grid justify-items-center gap-3 py-12 text-center">
        <p className="text-muted-foreground">
          No se encontraron libros con esa búsqueda.
        </p>
        <Button variant="outline" onClick={onClear}>
          Limpiar filtros
        </Button>
      </div>
    );
  }
  return (
    <div className="grid justify-items-center gap-3 py-12 text-center">
      <p className="text-muted-foreground">Todavía no hay libros en el catálogo.</p>
      {canWrite && (
        <Button asChild>
          <Link href="/books/new">Agregar el primer libro</Link>
        </Button>
      )}
    </div>
  );
}
