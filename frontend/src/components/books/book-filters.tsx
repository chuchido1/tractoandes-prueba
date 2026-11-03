"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BookFilters } from "@/lib/types";

type BookFiltersProps = {
  filters: BookFilters;
  genres: string[];
  onChange: (filters: BookFilters) => void;
};

const selectClassName =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

/** Búsqueda por título o autor (se aplica al enviar) y filtro de género (se aplica al elegir). */
export function BookFiltersBar({ filters, genres, onChange }: BookFiltersProps) {
  const [draft, setDraft] = useState(filters.q);
  // Si el género filtrado ya no existe en el catálogo sigue seleccionable para poder quitarlo.
  const options =
    filters.genre && !genres.includes(filters.genre)
      ? [filters.genre, ...genres]
      : genres;
  const active = filters.q !== "" || filters.genre !== "";

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onChange({ ...filters, q: draft.trim() });
  }

  function handleClear() {
    setDraft("");
    onChange({ q: "", genre: "" });
  }

  return (
    <form
      onSubmit={handleSearch}
      role="search"
      className="grid gap-3 sm:grid-cols-[1fr_14rem_auto] sm:items-end"
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
        <select
          id="genre-filter"
          className={selectClassName}
          value={filters.genre}
          onChange={(event) => onChange({ ...filters, genre: event.target.value })}
        >
          <option value="">Todos los géneros</option>
          {options.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>
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
