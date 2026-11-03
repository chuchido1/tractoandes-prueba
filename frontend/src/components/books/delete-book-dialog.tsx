"use client";

import { useState, type MouseEvent } from "react";
import { FormAlert } from "@/components/form-alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api-client";
import { deleteBook } from "@/lib/books-api";
import { describeError } from "@/lib/errors";
import type { Book } from "@/lib/types";

type DeleteBookDialogProps = {
  book: Pick<Book, "id" | "title">;
  onDeleted: () => void;
};

/** Botón «Eliminar» que pide confirmación antes de borrar. */
export function DeleteBookDialog({ book, onDeleted }: DeleteBookDialogProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setError(null);
  }

  async function confirmDelete(event: MouseEvent<HTMLButtonElement>) {
    // El diálogo se cierra sólo cuando el borrado termina bien.
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      await deleteBook(book.id);
      setOpen(false);
      onDeleted();
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        // Ya lo había borrado otra persona: el resultado buscado es el mismo.
        setOpen(false);
        onDeleted();
      } else {
        setError(describeError(err));
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Eliminar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar este libro?</AlertDialogTitle>
          <AlertDialogDescription>
            Se eliminará «{book.title}» del catálogo. Esta acción no se puede
            deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && <FormAlert message={error} />}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={confirmDelete}
            disabled={pending}
          >
            {pending ? "Eliminando…" : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
