export type Role = "ADMIN" | "CONSULTA";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type ReadingStatus = "PENDIENTE" | "LEYENDO" | "LEIDO";

export type Book = {
  id: string;
  isbn: string;
  title: string;
  author: string;
  genre: string;
  publicationYear: number;
  pages: number;
  synopsis: string | null;
  readingStatus: ReadingStatus;
  createdAt: string;
  updatedAt: string;
};

/** Página de resultados del backend. `page` empieza en 0. */
export type Page<T> = {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
};

export type BookFilters = {
  /** Texto buscado en título o autor. */
  q: string;
  /** Género exacto; vacío = todos. */
  genre: string;
  /** Estado de lectura; vacío = todos. */
  status: ReadingStatus | "";
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
  readingStatus: ReadingStatus;
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
