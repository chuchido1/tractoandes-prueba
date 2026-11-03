package com.tractoandes.catalog.user;

import java.util.List;
import java.util.UUID;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

/**
 * Usuario autenticado que Spring Security guarda en la sesión. Extiende el
 * usuario estándar (que borra la contraseña tras autenticar) añadiendo id, nombre y rol.
 * El rol se fija al iniciar sesión: un cambio en la base de datos aplica en el siguiente login.
 */
public class AppUserDetails extends org.springframework.security.core.userdetails.User {

    private final UUID id;
    private final String displayName;
    private final Role role;

    public AppUserDetails(User user) {
        // El prefijo ROLE_ es lo que espera hasRole("ADMIN") en SecurityConfig.
        super(user.getEmail(), user.getPasswordHash(), List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole())));
        this.id = user.getId();
        this.displayName = user.getName();
        this.role = user.getRole();
    }

    public UUID getId() {
        return id;
    }

    public String getDisplayName() {
        return displayName;
    }

    public Role getRole() {
        return role;
    }
}
