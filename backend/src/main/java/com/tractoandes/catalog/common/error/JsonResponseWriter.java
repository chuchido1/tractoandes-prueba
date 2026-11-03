package com.tractoandes.catalog.common.error;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import tools.jackson.databind.json.JsonMapper;

/**
 * Escribe respuestas JSON directamente en el servlet. Lo usan los componentes de
 * Spring Security (filtros), que se ejecutan antes de llegar a los controladores
 * y por eso no pasan por {@link GlobalExceptionHandler}.
 */
@Component
public class JsonResponseWriter {

    private final JsonMapper jsonMapper;

    public JsonResponseWriter(JsonMapper jsonMapper) {
        this.jsonMapper = jsonMapper;
    }

    public void writeBody(HttpServletResponse response, HttpStatus status, Object body) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        jsonMapper.writeValue(response.getOutputStream(), body);
    }

    public void writeError(
            HttpServletRequest request, HttpServletResponse response, HttpStatus status, ErrorCode code, String message)
            throws IOException {
        writeBody(response, status, ApiError.of(status, code, message, request.getRequestURI()));
    }
}
