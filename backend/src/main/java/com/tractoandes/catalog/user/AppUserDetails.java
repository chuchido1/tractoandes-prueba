package com.tractoandes.catalog.user;

import java.util.List;
import java.util.UUID;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

/**
 * Usuario autenticado que Spring Security guarda en la sesión. Extiende el
 * usuario estándar (que borra la contraseña tras autenticar) añadiendo id y nombre.
 */
public class AppUserDetails extends org.springframework.security.core.userdetails.User {

    private final UUID id;
    private final String displayName;

    public AppUserDetails(User user) {
        super(user.getEmail(), user.getPasswordHash(), List.of(new SimpleGrantedAuthority("ROLE_USER")));
        this.id = user.getId();
        this.displayName = user.getName();
    }

    public UUID getId() {
        return id;
    }

    public String getDisplayName() {
        return displayName;
    }
}
