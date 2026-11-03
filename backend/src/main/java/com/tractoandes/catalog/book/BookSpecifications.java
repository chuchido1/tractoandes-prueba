package com.tractoandes.catalog.book;

import java.util.Locale;
import org.springframework.data.jpa.domain.Specification;

/**
 * Filtros del listado. Se construyen con la API de criterios de JPA, que envía los
 * valores como parámetros enlazados (nunca concatenados en el SQL).
 */
final class BookSpecifications {

    private static final char LIKE_ESCAPE = '\\';

    private BookSpecifications() {
    }

    /** El texto aparece en el título O en el autor (contiene, sin distinguir mayúsculas). */
    static Specification<Book> titleOrAuthorContains(String text) {
        String pattern = "%" + escapeLike(text.toLowerCase(Locale.ROOT)) + "%";
        return (root, query, builder) -> builder.or(
                builder.like(builder.lower(root.get("title")), pattern, LIKE_ESCAPE),
                builder.like(builder.lower(root.get("author")), pattern, LIKE_ESCAPE));
    }

    /** Género exactamente igual, sin distinguir mayúsculas. */
    static Specification<Book> hasGenre(String genre) {
        String normalized = genre.toLowerCase(Locale.ROOT);
        return (root, query, builder) -> builder.equal(builder.lower(root.get("genre")), normalized);
    }

    static Specification<Book> hasReadingStatus(ReadingStatus status) {
        return (root, query, builder) -> builder.equal(root.get("readingStatus"), status);
    }

    /** Los comodines de LIKE escritos por el usuario (% _) se buscan como texto literal. */
    private static String escapeLike(String text) {
        return text
                .replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_");
    }
}
