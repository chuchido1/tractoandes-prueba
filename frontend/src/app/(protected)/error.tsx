"use client";

import { Button } from "@/components/ui/button";

/** Se muestra cuando el servidor no puede validar la sesión (backend caído o con error). */
export default function ProtectedError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-xl font-semibold">No se pudo conectar con el servidor</h1>
      <p className="text-sm text-muted-foreground">
        Hubo un problema al comunicarse con el servidor. Comprueba tu conexión e
        inténtalo de nuevo.
      </p>
      <Button onClick={() => retry()}>Reintentar</Button>
    </main>
  );
}
