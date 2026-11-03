package com.tractoandes.catalog.user;

import com.tractoandes.catalog.auth.RegisterRequest;
import com.tractoandes.catalog.common.error.ConflictException;
import com.tractoandes.catalog.common.error.DatabaseErrors;
import com.tractoandes.catalog.common.error.ErrorCode;
import com.tractoandes.catalog.common.error.FieldValidationException;
import java.nio.charset.StandardCharsets;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    /** BCrypt sólo procesa los primeros 72 bytes: se rechaza lo que excede en vez de truncarlo en silencio. */
    private static final int BCRYPT_MAX_BYTES = 72;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User register(RegisterRequest request) {
        if (request.password().getBytes(StandardCharsets.UTF_8).length > BCRYPT_MAX_BYTES) {
            throw new FieldValidationException("password", "La contraseña no puede superar los 72 bytes.");
        }
        User user = new User(
                request.name().trim(),
                User.normalizeEmail(request.email()),
                passwordEncoder.encode(request.password()));
        try {
            // saveAndFlush fuerza el INSERT aquí: la unicidad la decide PostgreSQL, no una consulta previa.
            return userRepository.saveAndFlush(user);
        } catch (DataIntegrityViolationException ex) {
            if (DatabaseErrors.isViolationOf(ex, "uk_users_email")) {
                throw new ConflictException(ErrorCode.EMAIL_DUPLICATED, "Ya existe una cuenta con ese correo.");
            }
            throw ex;
        }
    }
}
