import { apiFetch } from "./api-client";
import type { Book, BookFilters, BookInput, Page } from "./types";

export function listBooks(filters: BookFilters, page: number): Promise<Page<Book>> {
  const params = new URLSearchParams({ page: String(page) });
  if (filters.q) params.set("q", filters.q);
  if (filters.genre) params.set("genre", filters.genre);
  return apiFetch<Page<Book>>(`/books?${params}`);
}

export function listGenres(): Promise<string[]> {
  return apiFetch<string[]>("/books/genres");
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
