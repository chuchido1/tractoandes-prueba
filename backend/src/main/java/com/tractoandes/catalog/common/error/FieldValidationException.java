package com.tractoandes.catalog.common.error;

/** Error de validación detectado en el servicio, asociado a un campo concreto (400). */
public class FieldValidationException extends RuntimeException {

    private final String field;

    public FieldValidationException(String field, String message) {
        super(message);
        this.field = field;
    }

    public String getField() {
        return field;
    }
}
