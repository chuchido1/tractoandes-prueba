-- Usuario de demostración. Contraseña: Admin1234 (sólo se guarda su hash BCrypt).
-- Al ser una migración versionada, se ejecuta una sola vez: no se duplica al
-- reiniciar ni se restablece la contraseña si el usuario la cambia.
INSERT INTO users (name, email, password_hash) VALUES
    ('Administrador Demo', 'admin@clublectura.test', '$2y$10$Ekr9yuI4QE5N/KJFHCsYb.WrWRNlyvDlPMrvhMdI3WyXIxUU0wHT.');
