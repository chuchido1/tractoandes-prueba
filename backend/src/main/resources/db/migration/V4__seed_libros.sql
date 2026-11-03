-- Libros de demostración. Al ser una migración versionada se ejecuta una sola vez:
-- no se duplica al reiniciar ni vuelve a crear libros que el usuario haya eliminado.
-- Los ISBN son textos arbitrarios (no se valida su formato).
INSERT INTO books (isbn, titulo, autor, genero, anio_publicacion, paginas, sinopsis) VALUES
    ('DEMO-001', 'Cien años de soledad', 'Gabriel García Márquez', 'Novela', 1967, 471,
     'La saga de la familia Buendía a lo largo de siete generaciones en el pueblo imaginario de Macondo.'),
    ('DEMO-002', 'Don Quijote de la Mancha', 'Miguel de Cervantes', 'Novela', 1605, 1056,
     'Un hidalgo enloquecido por los libros de caballerías sale a recorrer España junto a su escudero Sancho Panza.'),
    ('DEMO-003', 'El amor en los tiempos del cólera', 'Gabriel García Márquez', 'Novela', 1985, 368, NULL),
    ('DEMO-004', 'Rayuela', 'Julio Cortázar', 'Novela', 1963, 600,
     'Novela experimental que puede leerse en más de un orden y sigue a Horacio Oliveira entre París y Buenos Aires.'),
    ('DEMO-005', 'Fundación', 'Isaac Asimov', 'Ciencia ficción', 1951, 255,
     'Un matemático predice la caída del Imperio Galáctico y crea una fundación para acortar la era de barbarie.'),
    ('DEMO-006', 'Dune', 'Frank Herbert', 'Ciencia ficción', 1965, 612,
     'La familia Atreides recibe el control del desértico planeta Arrakis, única fuente de la especia.'),
    ('DEMO-007', 'Neuromante', 'William Gibson', 'Ciencia ficción', 1984, 271, NULL),
    ('DEMO-008', 'Sapiens: de animales a dioses', 'Yuval Noah Harari', 'Historia', 2011, 498,
     'Un recorrido por la historia de la humanidad, desde los primeros humanos hasta la actualidad.'),
    ('DEMO-009', 'Las venas abiertas de América Latina', 'Eduardo Galeano', 'Historia', 1971, 400, NULL),
    ('DEMO-010', 'SPQR: una historia de la antigua Roma', 'Mary Beard', 'Historia', 2015, 608, NULL),
    ('DEMO-011', 'El Hobbit', 'J. R. R. Tolkien', 'Fantasía', 1937, 310,
     'Bilbo Bolsón abandona la comodidad de su hogar para acompañar a trece enanos a recuperar un tesoro custodiado por un dragón.'),
    ('DEMO-012', 'Un mago de Terramar', 'Ursula K. Le Guin', 'Fantasía', 1968, 183, NULL),
    ('DEMO-013', 'Veinte poemas de amor y una canción desesperada', 'Pablo Neruda', 'Poesía', 1924, 80, NULL),
    ('DEMO-014', 'Asesinato en el Orient Express', 'Agatha Christie', 'Misterio', 1934, 256,
     'Hércules Poirot investiga un crimen cometido en un tren detenido por la nieve.'),
    ('DEMO-015', 'El nombre de la rosa', 'Umberto Eco', 'Misterio', 1980, 512, NULL);
