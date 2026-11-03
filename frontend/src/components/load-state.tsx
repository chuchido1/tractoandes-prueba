import Link from "next/link";
import { FormAlert } from "@/components/form-alert";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api-client";
import { describeError } from "@/lib/errors";

export function LoadingMessage({ children }: { children: string }) {
  return (
    <p role="status" className="py-8 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}

type LoadErrorProps = {
  error: unknown;
  onRetry: () => void;
  backHref?: string;
};

/** Error al cargar datos. Reintentar sólo tiene sentido si el fallo puede ser pasajero. */
export function LoadError({ error, onRetry, backHref }: LoadErrorProps) {
  const permanent =
    error instanceof ApiError && (error.status === 400 || error.status === 404);
  return (
    <div className="grid gap-3 py-4">
      <FormAlert message={describeError(error)} />
      <div className="flex gap-2">
        {!permanent && <Button onClick={onRetry}>Reintentar</Button>}
        {backHref && (
          <Button variant="outline" asChild>
            <Link href={backHref}>Volver al listado</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
