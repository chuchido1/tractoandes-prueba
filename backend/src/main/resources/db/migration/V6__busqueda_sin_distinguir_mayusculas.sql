-- La búsqueda y el filtro de género comparan con lower(...). Con collation "C" (la de la imagen
-- Alpine) lower() no convierte las mayúsculas con tilde ("Ángel" seguiría igual), así que se
-- aplica a autor y género la misma collation ICU que ya usa titulo.
ALTER TABLE books ALTER COLUMN autor  TYPE VARCHAR(255) COLLATE "es-x-icu";
ALTER TABLE books ALTER COLUMN genero TYPE VARCHAR(100) COLLATE "es-x-icu";
