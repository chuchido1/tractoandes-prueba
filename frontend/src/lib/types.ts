export type User = {
  id: string;
  name: string;
  email: string;
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
