package com.tractoandes.catalog.auth;

import com.tractoandes.catalog.user.AppUserDetails;
import com.tractoandes.catalog.user.Role;
import com.tractoandes.catalog.user.User;
import java.util.UUID;

/** Respuesta pública de un usuario. Nunca incluye el hash de la contraseña. */
public record UserResponse(UUID id, String name, String email, Role role) {

    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole());
    }

    public static UserResponse from(AppUserDetails principal) {
        return new UserResponse(principal.getId(), principal.getDisplayName(), principal.getUsername(), principal.getRole());
    }
}
