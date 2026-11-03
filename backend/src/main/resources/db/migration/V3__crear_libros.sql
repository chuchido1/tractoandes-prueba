-- Los nombres de columna siguen los del enunciado de la prueba.
CREATE TABLE books (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    isbn             VARCHAR(50)  NOT NULL,
    titulo           VARCHAR(255) NOT NULL,
    autor            VARCHAR(255) NOT NULL,
    genero           VARCHAR(100) NOT NULL,
    anio_publicacion INTEGER      NOT NULL,
    paginas          INTEGER      NOT NULL,
    sinopsis         TEXT,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    -- La unicidad del ISBN la garantiza PostgreSQL, no sólo la aplicación.
    CONSTRAINT uk_books_isbn UNIQUE (isbn),
    CONSTRAINT ck_books_isbn_not_blank CHECK (btrim(isbn) <> ''),
    CONSTRAINT ck_books_titulo_not_blank CHECK (btrim(titulo) <> ''),
    CONSTRAINT ck_books_autor_not_blank CHECK (btrim(autor) <> ''),
    CONSTRAINT ck_books_genero_not_blank CHECK (btrim(genero) <> ''),
    CONSTRAINT ck_books_paginas_positive CHECK (paginas > 0)
);
