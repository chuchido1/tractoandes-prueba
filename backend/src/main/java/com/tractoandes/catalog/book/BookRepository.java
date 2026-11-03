package com.tractoandes.catalog.book;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface BookRepository extends JpaRepository<Book, UUID>, JpaSpecificationExecutor<Book> {

    /** Un género por cada grafía distinta sin contar mayúsculas ("Novela" y "novela" salen una vez). */
    @Query("select min(b.genre) from Book b group by lower(b.genre) order by min(b.genre)")
    List<String> findDistinctGenres();
}
