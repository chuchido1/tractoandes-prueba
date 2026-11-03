package com.tractoandes.catalog.book;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.time.Year;

public class NotFutureYearValidator implements ConstraintValidator<NotFutureYear, Integer> {

    @Override
    public boolean isValid(Integer year, ConstraintValidatorContext context) {
        // null lo rechaza @NotNull; aquí sólo se valida el límite superior.
        return year == null || year <= Year.now().getValue();
    }
}
