import type { Metadata } from "next";
import { BookDetail } from "@/components/books/book-detail";
import { requireUser } from "@/lib/server-auth";

export const metadata: Metadata = { title: "Detalle del libro" };

export default async function BookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;
  return <BookDetail id={id} />;
}
