import type { ReadingStatus } from "./types";

export const READING_STATUSES: { value: ReadingStatus; label: string }[] = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "LEYENDO", label: "Leyendo" },
  { value: "LEIDO", label: "Leído" },
];

export function readingStatusLabel(status: ReadingStatus): string {
  return READING_STATUSES.find((entry) => entry.value === status)?.label ?? status;
}
