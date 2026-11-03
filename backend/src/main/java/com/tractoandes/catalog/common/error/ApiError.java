package com.tractoandes.catalog.common.error;

import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;

/** Formato único de error de la API, también para los errores generados por Spring Security. */
public record ApiError(
        int status,
        ErrorCode code,
        String message,
        List<FieldErrorDetail> fieldErrors,
        String path,
        Instant timestamp) {

    public static ApiError of(HttpStatus status, ErrorCode code, String message, String path) {
        return withFieldErrors(status, code, message, List.of(), path);
    }

    public static ApiError withFieldErrors(
            HttpStatus status, ErrorCode code, String message, List<FieldErrorDetail> fieldErrors, String path) {
        return new ApiError(status.value(), code, message, fieldErrors, path, Instant.now());
    }
}
