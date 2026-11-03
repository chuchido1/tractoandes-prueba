import type { Metadata } from "next";
import { BookDetail } from "@/components/books/book-detail";
import { canWriteCatalog } from "@/lib/permissions";
import { requireUser } from "@/lib/server-auth";

export const metadata: Metadata = { title: "Detalle del libro" };

export default async function BookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const canWrite = canWriteCatalog(await requireUser());
  const { id } = await params;
  return <BookDetail id={id} canWrite={canWrite} />;
}
