import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-xl font-semibold">Página no encontrada</h1>
      <p className="text-sm text-muted-foreground">
        La página que buscas no existe o fue movida.
      </p>
      <Button asChild>
        <Link href="/books">Ir al catálogo</Link>
      </Button>
    </main>
  );
}
