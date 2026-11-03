"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Settled<T> = { requestId: string; data?: T; error?: unknown };

/**
 * Carga un recurso al montar y cuando cambia `key`. Expone loading, error y
 * reload(). Mientras llega una nueva respuesta conserva el último dato recibido,
 * y las respuestas que llegan fuera de orden se descartan.
 */
export function useApiResource<T>(load: () => Promise<T>, key: string) {
  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState<Settled<T> | null>(null);
  const loadRef = useRef(load);

  useEffect(() => {
    loadRef.current = load;
  });

  const requestId = `${key}#${attempt}`;

  useEffect(() => {
    let cancelled = false;
    loadRef.current().then(
      (data) => {
        if (!cancelled) setSettled({ requestId, data });
      },
      (error: unknown) => {
        if (!cancelled) {
          setSettled((previous) => ({ requestId, data: previous?.data, error }));
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [requestId]);

  const reload = useCallback(() => setAttempt((count) => count + 1), []);
  const loading = settled?.requestId !== requestId;

  return {
    data: settled?.data,
    error: loading ? undefined : settled?.error,
    loading,
    reload,
  };
}
