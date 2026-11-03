package com.tractoandes.catalog.book;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** Contrato HTTP del catálogo. Las reglas y transacciones viven en {@link BookService}. */
@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    /** q: texto en título o autor. genre: género exacto. status: estado de lectura. Se combinan con AND. */
    @GetMapping
    public PageResponse<BookResponse> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) ReadingStatus status,
            @RequestParam(defaultValue = "0") @Min(value = 0, message = "La página debe ser 0 o mayor.") int page,
            @RequestParam(defaultValue = "10")
            @Min(value = 1, message = "El tamaño de página debe ser al menos 1.")
            @Max(value = 50, message = "El tamaño de página no puede superar 50.") int size) {
        return PageResponse.from(bookService.search(q, genre, status, page, size), BookResponse::from);
    }

    @GetMapping("/genres")
    public List<String> genres() {
        return bookService.listGenres();
    }

    @GetMapping("/{id}")
    public BookResponse get(@PathVariable UUID id) {
        return BookResponse.from(bookService.get(id));
    }

    @PostMapping
    public ResponseEntity<BookResponse> create(@Valid @RequestBody BookRequest request) {
        BookResponse created = BookResponse.from(bookService.create(request));
        return ResponseEntity.created(URI.create("/api/books/" + created.id())).body(created);
    }

    @PutMapping("/{id}")
    public BookResponse update(@PathVariable UUID id, @Valid @RequestBody BookRequest request) {
        return BookResponse.from(bookService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        bookService.delete(id);
    }
}
