package com.tractoandes.catalog.book;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "books")
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "isbn", nullable = false)
    private String isbn;

    @Column(name = "titulo", nullable = false)
    private String title;

    @Column(name = "autor", nullable = false)
    private String author;

    @Column(name = "genero", nullable = false)
    private String genre;

    @Column(name = "anio_publicacion", nullable = false)
    private int publicationYear;

    @Column(name = "paginas", nullable = false)
    private int pages;

    @Column(name = "sinopsis")
    private String synopsis;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Book() {
    }

    public Book(String isbn, String title, String author, String genre, int publicationYear, int pages, String synopsis) {
        update(isbn, title, author, genre, publicationYear, pages, synopsis);
    }

    public void update(
            String isbn, String title, String author, String genre, int publicationYear, int pages, String synopsis) {
        this.isbn = isbn;
        this.title = title;
        this.author = author;
        this.genre = genre;
        this.publicationYear = publicationYear;
        this.pages = pages;
        this.synopsis = synopsis;
    }

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public String getIsbn() {
        return isbn;
    }

    public String getTitle() {
        return title;
    }

    public String getAuthor() {
        return author;
    }

    public String getGenre() {
        return genre;
    }

    public int getPublicationYear() {
        return publicationYear;
    }

    public int getPages() {
        return pages;
    }

    public String getSynopsis() {
        return synopsis;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
