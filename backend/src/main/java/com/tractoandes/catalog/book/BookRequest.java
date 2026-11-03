package com.tractoandes.catalog.book;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/**
 * Datos de un libro para crear o editar. No incluye id ni fechas: los genera el
 * sistema, y cualquier valor que el cliente envíe para ellos se ignora.
 */
public record BookRequest(
        @NotBlank(message = "El ISBN es obligatorio.")
        @Size(max = 50, message = "El ISBN no puede superar los 50 caracteres.")
        String isbn,

        @NotBlank(message = "El título es obligatorio.")
        @Size(max = 255, message = "El título no puede superar los 255 caracteres.")
        String title,

        @NotBlank(message = "El autor es obligatorio.")
        @Size(max = 255, message = "El autor no puede superar los 255 caracteres.")
        String author,

        @NotBlank(message = "El género es obligatorio.")
        @Size(max = 100, message = "El género no puede superar los 100 caracteres.")
        String genre,

        @NotNull(message = "El año de publicación es obligatorio.")
        @NotFutureYear
        Integer publicationYear,

        @NotNull(message = "El número de páginas es obligatorio.")
        @Positive(message = "El número de páginas debe ser mayor que cero.")
        Integer pages,

        @Size(max = 5000, message = "La sinopsis no puede superar los 5000 caracteres.")
        String synopsis,

        /** Opcional: al crear, si falta, queda PENDIENTE; al editar, si falta, se conserva el actual. */
        ReadingStatus readingStatus) {
}
