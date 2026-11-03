import Link from "next/link";
import { DeleteBookDialog } from "@/components/books/delete-book-dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Book } from "@/lib/types";

type BookTableProps = {
  books: Book[];
  onDeleted: () => void;
};

export function BookTable({ books, onDeleted }: BookTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Título</TableHead>
          <TableHead>Autor</TableHead>
          <TableHead>Género</TableHead>
          <TableHead className="text-right">Año</TableHead>
          <TableHead className="text-right">Páginas</TableHead>
          <TableHead>
            <span className="sr-only">Acciones</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {books.map((book) => (
          <TableRow key={book.id}>
            <TableCell className="font-medium">
              <Link href={`/books/${book.id}`} className="hover:underline">
                {book.title}
              </Link>
            </TableCell>
            <TableCell>{book.author}</TableCell>
            <TableCell>{book.genre}</TableCell>
            <TableCell className="text-right">{book.publicationYear}</TableCell>
            <TableCell className="text-right">{book.pages}</TableCell>
            <TableCell>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/books/${book.id}/edit`}>Editar</Link>
                </Button>
                <DeleteBookDialog book={book} onDeleted={onDeleted} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
