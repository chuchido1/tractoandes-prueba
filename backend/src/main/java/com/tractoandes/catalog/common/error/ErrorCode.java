package com.tractoandes.catalog.common.error;

/** Códigos de error estables que el frontend puede interpretar sin depender del texto del mensaje. */
public enum ErrorCode {
    VALIDATION_ERROR,
    MALFORMED_REQUEST,
    INVALID_PARAMETER,
    UNAUTHENTICATED,
    INVALID_CREDENTIALS,
    FORBIDDEN,
    CSRF_INVALID,
    NOT_FOUND,
    METHOD_NOT_ALLOWED,
    UNSUPPORTED_MEDIA_TYPE,
    ISBN_DUPLICATED,
    EMAIL_DUPLICATED,
    INTERNAL_ERROR
}
