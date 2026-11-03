package com.tractoandes.catalog.book;

import java.time.Instant;
import java.util.UUID;

public record BookResponse(
        UUID id,
        String isbn,
        String title,
        String author,
        String genre,
        int publicationYear,
        int pages,
        String synopsis,
        ReadingStatus readingStatus,
        Instant createdAt,
        Instant updatedAt) {

    public static BookResponse from(Book book) {
        return new BookResponse(
                book.getId(),
                book.getIsbn(),
                book.getTitle(),
                book.getAuthor(),
                book.getGenre(),
                book.getPublicationYear(),
                book.getPages(),
                book.getSynopsis(),
                book.getReadingStatus(),
                book.getCreatedAt(),
                book.getUpdatedAt());
    }
}
