import { apiFetch } from "./api-client";
import type { Book, BookInput } from "./types";

export function listBooks(): Promise<Book[]> {
  return apiFetch<Book[]>("/books");
}

export function getBook(id: string): Promise<Book> {
  return apiFetch<Book>(`/books/${encodeURIComponent(id)}`);
}

export function createBook(input: BookInput): Promise<Book> {
  return apiFetch<Book>("/books", { method: "POST", json: input });
}

export function updateBook(id: string, input: BookInput): Promise<Book> {
  return apiFetch<Book>(`/books/${encodeURIComponent(id)}`, {
    method: "PUT",
    json: input,
  });
}

export function deleteBook(id: string): Promise<void> {
  return apiFetch<void>(`/books/${encodeURIComponent(id)}`, { method: "DELETE" });
}
