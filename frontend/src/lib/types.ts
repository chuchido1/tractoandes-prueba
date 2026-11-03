export type User = {
  id: string;
  name: string;
  email: string;
};

export type Book = {
  id: string;
  isbn: string;
  title: string;
  author: string;
  genre: string;
  publicationYear: number;
  pages: number;
  synopsis: string | null;
  createdAt: string;
  updatedAt: string;
};

/** Lo que el formulario envía. Los números van null si el campo está vacío: el backend valida. */
export type BookInput = {
  isbn: string;
  title: string;
  author: string;
  genre: string;
  publicationYear: number | null;
  pages: number | null;
  synopsis: string;
};

export type FieldError = {
  field: string;
  message: string;
};

/** Cuerpo de error uniforme que devuelve el backend (ver ApiError.java). */
export type ApiErrorBody = {
  status: number;
  code: string;
  message: string;
  fieldErrors: FieldError[];
  path: string;
  timestamp: string;
};
