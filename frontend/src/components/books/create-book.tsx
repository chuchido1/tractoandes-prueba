"use client";

import { BookForm } from "@/components/books/book-form";
import { createBook } from "@/lib/books-api";

// Un Server Component no puede pasar funciones a un componente cliente; por eso
// la función de envío se enlaza aquí, ya del lado del navegador.
export function CreateBook() {
  return (
    <BookForm
      submitLabel="Crear libro"
      submittingLabel="Creando…"
      cancelHref="/books"
      onSubmit={createBook}
    />
  );
}
