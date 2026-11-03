import { Badge } from "@/components/ui/badge";
import { readingStatusLabel } from "@/lib/reading-status";
import type { ReadingStatus } from "@/lib/types";

const VARIANTS = {
  PENDIENTE: "outline",
  LEYENDO: "secondary",
  LEIDO: "default",
} as const;

export function ReadingStatusBadge({ status }: { status: ReadingStatus }) {
  return <Badge variant={VARIANTS[status]}>{readingStatusLabel(status)}</Badge>;
}
