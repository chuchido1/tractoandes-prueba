-- El estado de lectura pertenece al libro (el catálogo es compartido), no a cada usuario.
ALTER TABLE books ADD COLUMN estado_lectura VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE';
ALTER TABLE books ADD CONSTRAINT ck_books_estado_lectura CHECK (estado_lectura IN ('PENDIENTE', 'LEYENDO', 'LEIDO'));

-- Algunos libros del seed con otro estado para poder probar el filtro.
UPDATE books SET estado_lectura = 'LEIDO'   WHERE isbn IN ('DEMO-001', 'DEMO-005', 'DEMO-011');
UPDATE books SET estado_lectura = 'LEYENDO' WHERE isbn IN ('DEMO-002', 'DEMO-006');
