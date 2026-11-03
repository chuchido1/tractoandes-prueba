package com.tractoandes.catalog.common.error;

/** El recurso pedido no existe (404). */
public class NotFoundException extends RuntimeException {

    public NotFoundException(String message) {
        super(message);
    }
}
