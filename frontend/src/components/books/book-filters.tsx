"use client";

import { useState, type FormEvent } from "react";
import { NativeSelect } from "@/components/native-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { READING_STATUSES } from "@/lib/reading-status";
import type { BookFilters, ReadingStatus } from "@/lib/types";

type BookFiltersProps = {
  filters: BookFilters;
  genres: string[];
  onChange: (filters: BookFilters) => void;
};

/** Búsqueda por título o autor (se aplica al enviar) y filtros de género y estado (al elegirlos). */
export function BookFiltersBar({ filters, genres, onChange }: BookFiltersProps) {
  const [draft, setDraft] = useState(filters.q);
  // Si el género filtrado ya no existe en el catálogo sigue seleccionable para poder quitarlo.
  const options =
    filters.genre && !genres.includes(filters.genre)
      ? [filters.genre, ...genres]
      : genres;
  const active = filters.q !== "" || filters.genre !== "" || filters.status !== "";

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onChange({ ...filters, q: draft.trim() });
  }

  function handleClear() {
    setDraft("");
    onChange({ q: "", genre: "", status: "" });
  }

  return (
    <form
      onSubmit={handleSearch}
      role="search"
      className="grid gap-3 sm:grid-cols-[1fr_12rem_10rem_auto] sm:items-end"
    >
      <div className="grid gap-1.5">
        <Label htmlFor="search">Buscar por título o autor</Label>
        <Input
          id="search"
          type="search"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ej. García, Dune…"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="genre-filter">Género</Label>
        <NativeSelect
          id="genre-filter"
          value={filters.genre}
          onChange={(event) => onChange({ ...filters, genre: event.target.value })}
        >
          <option value="">Todos los géneros</option>
          {options.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </NativeSelect>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="status-filter">Estado de lectura</Label>
        <NativeSelect
          id="status-filter"
          value={filters.status}
          onChange={(event) =>
            onChange({ ...filters, status: event.target.value as ReadingStatus | "" })
          }
        >
          <option value="">Todos</option>
          {READING_STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </NativeSelect>
      </div>
      <div className="flex gap-2">
        <Button type="submit">Buscar</Button>
        {active && (
          <Button type="button" variant="outline" onClick={handleClear}>
            Limpiar
          </Button>
        )}
      </div>
    </form>
  );
}
