package com.tractoandes.catalog.common.error;

import org.hibernate.exception.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;

public final class DatabaseErrors {

    private DatabaseErrors() {
    }

    /** Indica si PostgreSQL rechazó la operación por violar la restricción con ese nombre. */
    public static boolean isViolationOf(DataIntegrityViolationException exception, String constraintName) {
        return exception.getCause() instanceof ConstraintViolationException violation
                && constraintName.equalsIgnoreCase(violation.getConstraintName());
    }
}
