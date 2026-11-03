package com.tractoandes.catalog.common.error;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.TypeMismatchException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.lang.Nullable;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;
import tools.jackson.databind.exc.MismatchedInputException;

/**
 * Traduce las excepciones de los controladores al formato {@link ApiError}.
 * Extiende la clase base de Spring para que también los errores del propio
 * framework (404, 405, 415...) salgan con el mismo formato.
 */
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        List<FieldErrorDetail> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> new FieldErrorDetail(error.getField(), error.getDefaultMessage()))
                .toList();
        return build(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR,
                "Los datos enviados no son válidos.", fieldErrors, request);
    }

    @Override
    protected ResponseEntity<Object> handleHttpMessageNotReadable(
            HttpMessageNotReadableException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        // Un valor del tipo equivocado (p. ej. 12.5 donde va un entero) se reporta como error del campo.
        if (ex.getCause() instanceof MismatchedInputException mismatch && !mismatch.getPath().isEmpty()) {
            String field = mismatch.getPath().getLast().getPropertyName();
            if (field != null) {
                return build(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR,
                        "Los datos enviados no son válidos.",
                        List.of(new FieldErrorDetail(field, mismatchMessage(mismatch))), request);
            }
        }
        return build(HttpStatus.BAD_REQUEST, ErrorCode.MALFORMED_REQUEST,
                "El cuerpo de la solicitud no es un JSON válido.", List.of(), request);
    }

    /** Parámetros de consulta fuera de rango (p. ej. size=500): 400 con el nombre del parámetro. */
    @Override
    protected ResponseEntity<Object> handleHandlerMethodValidationException(
            HandlerMethodValidationException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        List<FieldErrorDetail> fieldErrors = ex.getParameterValidationResults().stream()
                .flatMap(result -> result.getResolvableErrors().stream()
                        .map(error -> new FieldErrorDetail(
                                result.getMethodParameter().getParameterName(), error.getDefaultMessage())))
                .toList();
        return build(HttpStatus.BAD_REQUEST, ErrorCode.INVALID_PARAMETER,
                "Algún parámetro de la consulta no es válido.", fieldErrors, request);
    }

    @Override
    protected ResponseEntity<Object> handleTypeMismatch(
            TypeMismatchException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        return build(HttpStatus.BAD_REQUEST, ErrorCode.INVALID_PARAMETER,
                "El valor del parámetro «" + ex.getPropertyName() + "» no es válido.", List.of(), request);
    }

    @Override
    protected ResponseEntity<Object> handleExceptionInternal(
            Exception ex, @Nullable Object body, HttpHeaders headers, HttpStatusCode statusCode, WebRequest request) {
        HttpStatus status = HttpStatus.valueOf(statusCode.value());
        return switch (status) {
            case NOT_FOUND -> build(status, ErrorCode.NOT_FOUND, "El recurso solicitado no existe.", List.of(), request);
            case METHOD_NOT_ALLOWED -> build(status, ErrorCode.METHOD_NOT_ALLOWED,
                    "El método HTTP no está permitido para esta ruta.", List.of(), request);
            case UNSUPPORTED_MEDIA_TYPE -> build(status, ErrorCode.UNSUPPORTED_MEDIA_TYPE,
                    "El tipo de contenido no está soportado.", List.of(), request);
            default -> status.is5xxServerError()
                    ? internalError(ex, request)
                    : build(status, ErrorCode.MALFORMED_REQUEST, "La solicitud no es válida.", List.of(), request);
        };
    }

    @ExceptionHandler(NotFoundException.class)
    ResponseEntity<Object> handleNotFound(NotFoundException ex, HttpServletRequest request) {
        return build(HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND, ex.getMessage(), List.of(), request.getRequestURI());
    }

    @ExceptionHandler(ConflictException.class)
    ResponseEntity<Object> handleConflict(ConflictException ex, HttpServletRequest request) {
        return build(HttpStatus.CONFLICT, ex.getCode(), ex.getMessage(), List.of(), request.getRequestURI());
    }

    @ExceptionHandler(FieldValidationException.class)
    ResponseEntity<Object> handleFieldValidation(FieldValidationException ex, HttpServletRequest request) {
        return build(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR, "Los datos enviados no son válidos.",
                List.of(new FieldErrorDetail(ex.getField(), ex.getMessage())), request.getRequestURI());
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<Object> handleUnexpected(Exception ex, HttpServletRequest request) {
        log.error("Error no controlado en {}", request.getRequestURI(), ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR,
                "Ocurrió un error inesperado. Inténtalo de nuevo más tarde.", List.of(), request.getRequestURI());
    }

    private static String mismatchMessage(MismatchedInputException mismatch) {
        Class<?> target = mismatch.getTargetType();
        if (target == Integer.class || target == int.class) {
            return "Debe ser un número entero.";
        }
        return "El valor no tiene el formato esperado.";
    }

    private ResponseEntity<Object> internalError(Exception ex, WebRequest request) {
        log.error("Error del servidor", ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR,
                "Ocurrió un error inesperado. Inténtalo de nuevo más tarde.", List.of(), request);
    }

    private ResponseEntity<Object> build(
            HttpStatus status, ErrorCode code, String message, List<FieldErrorDetail> fieldErrors, WebRequest request) {
        String path = ((ServletWebRequest) request).getRequest().getRequestURI();
        return build(status, code, message, fieldErrors, path);
    }

    private ResponseEntity<Object> build(
            HttpStatus status, ErrorCode code, String message, List<FieldErrorDetail> fieldErrors, String path) {
        return ResponseEntity.status(status).body(ApiError.withFieldErrors(status, code, message, fieldErrors, path));
    }
}
