package com.tractoandes.catalog.book;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/** El año no puede ser mayor al año actual, calculado en cada validación (no es una constante). */
@Documented
@Constraint(validatedBy = NotFutureYearValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER, ElementType.RECORD_COMPONENT})
@Retention(RetentionPolicy.RUNTIME)
public @interface NotFutureYear {

    String message() default "El año de publicación no puede ser mayor al año actual.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
