import Link from "next/link";
import { Button } from "@/components/ui/button";

export function NoPermission() {
  return (
    <section className="grid justify-items-center gap-3 py-12 text-center">
      <h1 className="text-xl font-semibold">Sin permisos</h1>
      <p className="text-muted-foreground">
        Tu cuenta es de sólo lectura: no puedes crear ni editar libros.
      </p>
      <Button asChild>
        <Link href="/books">Volver al listado</Link>
      </Button>
    </section>
  );
}
