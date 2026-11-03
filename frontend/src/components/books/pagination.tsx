import { Button } from "@/components/ui/button";
import type { Book, Page } from "@/lib/types";

type PaginationProps = {
  page: Page<Book>;
  disabled: boolean;
  onPageChange: (page: number) => void;
};

export function Pagination({ page, disabled, onPageChange }: PaginationProps) {
  const first = page.page * page.size + 1;
  const last = first + page.items.length - 1;
  return (
    <nav
      aria-label="Paginación"
      className="flex flex-wrap items-center justify-between gap-3"
    >
      <p className="text-sm text-muted-foreground">
        {first}–{last} de {page.totalItems} libros
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || page.page === 0}
          onClick={() => onPageChange(page.page - 1)}
        >
          Anterior
        </Button>
        <span className="text-sm">
          Página {page.page + 1} de {page.totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || page.page + 1 >= page.totalPages}
          onClick={() => onPageChange(page.page + 1)}
        >
          Siguiente
        </Button>
      </div>
    </nav>
  );
}
