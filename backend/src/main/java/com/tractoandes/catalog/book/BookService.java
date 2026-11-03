package com.tractoandes.catalog.book;

import com.tractoandes.catalog.common.error.ConflictException;
import com.tractoandes.catalog.common.error.DatabaseErrors;
import com.tractoandes.catalog.common.error.ErrorCode;
import com.tractoandes.catalog.common.error.NotFoundException;
import java.util.List;
import java.util.UUID;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class BookService {

    private static final String ISBN_CONSTRAINT = "uk_books_isbn";

    private final BookRepository bookRepository;

    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    /**
     * Busca (título O autor contiene el texto) y filtra por género y estado de lectura (todo
     * combinado con AND), en la base de datos y antes de paginar. Una página fuera de rango devuelve la lista vacía.
     */
    public Page<Book> search(String text, String genre, ReadingStatus status, int page, int size) {
        Specification<Book> filters = Specification.unrestricted();
        if (text != null && !text.isBlank()) {
            filters = filters.and(BookSpecifications.titleOrAuthorContains(text.trim()));
        }
        if (genre != null && !genre.isBlank()) {
            filters = filters.and(BookSpecifications.hasGenre(genre.trim()));
        }
        if (status != null) {
            filters = filters.and(BookSpecifications.hasReadingStatus(status));
        }
        // El id desempata títulos iguales: el orden (y por tanto las páginas) es siempre el mismo.
        return bookRepository.findAll(filters, PageRequest.of(page, size, Sort.by("title", "id")));
    }

    public List<String> listGenres() {
        return bookRepository.findDistinctGenres();
    }

    public Book get(UUID id) {
        return bookRepository.findById(id).orElseThrow(() -> new NotFoundException("El libro no existe."));
    }

    @Transactional
    public Book create(BookRequest request) {
        Book book = new Book(
                request.isbn().trim(),
                request.title().trim(),
                request.author().trim(),
                request.genre().trim(),
                request.publicationYear(),
                request.pages(),
                normalizeSynopsis(request.synopsis()),
                request.readingStatus() != null ? request.readingStatus() : ReadingStatus.PENDIENTE);
        return saveOrReportDuplicate(book);
    }

    @Transactional
    public Book update(UUID id, BookRequest request) {
        Book book = get(id);
        book.update(
                request.isbn().trim(),
                request.title().trim(),
                request.author().trim(),
                request.genre().trim(),
                request.publicationYear(),
                request.pages(),
                normalizeSynopsis(request.synopsis()),
                request.readingStatus() != null ? request.readingStatus() : book.getReadingStatus());
        return saveOrReportDuplicate(book);
    }

    @Transactional
    public void delete(UUID id) {
        bookRepository.delete(get(id));
    }

    /**
     * saveAndFlush ejecuta el INSERT/UPDATE ahora mismo: si el ISBN ya existe, es
     * PostgreSQL quien lo rechaza (restricción única). Editar un libro conservando
     * su propio ISBN no choca porque la restricción ignora la propia fila.
     */
    private Book saveOrReportDuplicate(Book book) {
        try {
            return bookRepository.saveAndFlush(book);
        } catch (DataIntegrityViolationException ex) {
            if (DatabaseErrors.isViolationOf(ex, ISBN_CONSTRAINT)) {
                throw new ConflictException(ErrorCode.ISBN_DUPLICATED, "Ya existe un libro con ese ISBN.");
            }
            throw ex;
        }
    }

    private static String normalizeSynopsis(String synopsis) {
        if (synopsis == null || synopsis.isBlank()) {
            return null;
        }
        return synopsis.trim();
    }
}
