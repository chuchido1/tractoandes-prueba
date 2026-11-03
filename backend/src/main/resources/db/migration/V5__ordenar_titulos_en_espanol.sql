-- La imagen Alpine de PostgreSQL ordena con collation "C": las minúsculas quedan después
-- de las mayúsculas y las vocales con tilde después de la «z» ("El Hobbit" < "El amor").
-- Se fija el orden alfabético español en la columna que ordena el listado, sin depender
-- de cómo se inicializó el clúster.
ALTER TABLE books ALTER COLUMN titulo TYPE VARCHAR(255) COLLATE "es-x-icu";
