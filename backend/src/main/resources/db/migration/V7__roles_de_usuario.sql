-- ADMIN: CRUD completo. CONSULTA: sólo lectura. El valor por defecto es el de menos privilegios:
-- el registro público nunca crea administradores.
ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'CONSULTA';
ALTER TABLE users ADD CONSTRAINT ck_users_role CHECK (role IN ('ADMIN', 'CONSULTA'));

UPDATE users SET role = 'ADMIN' WHERE email = 'admin@clublectura.test';

-- Usuario de demostración de sólo lectura. Contraseña: Consulta1234 (sólo se guarda el hash BCrypt).
INSERT INTO users (name, email, password_hash, role) VALUES
    ('Usuario de Consulta', 'consulta@clublectura.test', '$2y$10$WR55XpTlJJE/.Ma0QElAJ.vrfpFt7WdWMAqUnzdLFRXkA4Qwi.LFe', 'CONSULTA');
