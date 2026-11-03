"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormAlert } from "@/components/form-alert";
import { TextField } from "@/components/text-field";
import { TextareaField } from "@/components/textarea-field";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api-client";
import { listGenres } from "@/lib/books-api";
import { describeError, fieldErrorsOf } from "@/lib/errors";
import type { Book, BookInput } from "@/lib/types";
import { useApiResource } from "@/lib/use-api-resource";

type BookFormProps = {
  /** Libro a editar; sin él, el formulario crea uno nuevo. */
  initialBook?: Book;
  submitLabel: string;
  submittingLabel: string;
  cancelHref: string;
  onSubmit: (input: BookInput) => Promise<Book>;
};

function text(data: FormData, name: string): string {
  return String(data.get(name) ?? "");
}

function integer(data: FormData, name: string): number | null {
  const raw = text(data, name).trim();
  return raw === "" ? null : Number(raw);
}

function readBookInput(data: FormData): BookInput {
  return {
    isbn: text(data, "isbn"),
    title: text(data, "title"),
    author: text(data, "author"),
    genre: text(data, "genre"),
    publicationYear: integer(data, "publicationYear"),
    pages: integer(data, "pages"),
    synopsis: text(data, "synopsis"),
  };
}

/**
 * Formulario compartido por «crear» y «editar». Los campos no son controlados:
 * el navegador conserva lo escrito cuando el backend rechaza el envío.
 */
export function BookForm({
  initialBook,
  submitLabel,
  submittingLabel,
  cancelHref,
  onSubmit,
}: BookFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const { data: genres } = useApiResource(listGenres, "genres");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = readBookInput(new FormData(event.currentTarget));
    setSubmitting(true);
    setError(null);
    setFieldErrors({});
    try {
      const saved = await onSubmit(input);
      router.push(`/books/${saved.id}`);
    } catch (err) {
      const fields = fieldErrorsOf(err);
      if (err instanceof ApiError && err.code === "ISBN_DUPLICATED") {
        fields.isbn = err.message;
      }
      setFieldErrors(fields);
      setError(
        Object.keys(fields).length > 0
          ? "Revisa los campos marcados."
          : describeError(err),
      );
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-4">
      {error && <FormAlert message={error} />}
      <div className="grid gap-4 md:grid-cols-2">
        <TextField
          name="isbn"
          label="ISBN"
          defaultValue={initialBook?.isbn}
          error={fieldErrors.isbn}
          autoComplete="off"
        />
        <TextField
          name="title"
          label="Título"
          defaultValue={initialBook?.title}
          error={fieldErrors.title}
        />
        <TextField
          name="author"
          label="Autor"
          defaultValue={initialBook?.author}
          error={fieldErrors.author}
        />
        <div className="grid content-start">
          <TextField
            name="genre"
            label="Género"
            list="genre-options"
            autoComplete="off"
            defaultValue={initialBook?.genre}
            error={fieldErrors.genre}
          />
          {/* Sugerencias de los géneros ya usados; el campo sigue siendo libre. */}
          <datalist id="genre-options">
            {genres?.map((genre) => <option key={genre} value={genre} />)}
          </datalist>
        </div>
        <TextField
          name="publicationYear"
          label="Año de publicación"
          type="number"
          inputMode="numeric"
          defaultValue={initialBook?.publicationYear}
          error={fieldErrors.publicationYear}
        />
        <TextField
          name="pages"
          label="Páginas"
          type="number"
          inputMode="numeric"
          defaultValue={initialBook?.pages}
          error={fieldErrors.pages}
        />
      </div>
      <TextareaField
        name="synopsis"
        label="Sinopsis (opcional)"
        rows={5}
        defaultValue={initialBook?.synopsis ?? ""}
        error={fieldErrors.synopsis}
      />
      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? submittingLabel : submitLabel}
        </Button>
        <Button variant="outline" asChild>
          <Link href={cancelHref}>Cancelar</Link>
        </Button>
      </div>
    </form>
  );
}
