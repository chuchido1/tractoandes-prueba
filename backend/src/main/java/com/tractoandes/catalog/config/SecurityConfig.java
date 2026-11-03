package com.tractoandes.catalog.config;

import com.tractoandes.catalog.auth.UserResponse;
import com.tractoandes.catalog.common.error.ErrorCode;
import com.tractoandes.catalog.common.error.JsonResponseWriter;
import com.tractoandes.catalog.user.AppUserDetails;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.CsrfConfigurer;
import org.springframework.security.config.annotation.web.configurers.RequestCacheConfigurer;
import org.springframework.security.config.annotation.web.configurers.SessionManagementConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler;
import org.springframework.security.web.csrf.CsrfException;

@Configuration
public class SecurityConfig {

    private static final String SESSION_COOKIE = "JSESSIONID";

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, JsonResponseWriter writer) throws Exception {
        http
                // CSRF para SPA: cookie XSRF-TOKEN legible por JavaScript + cabecera X-XSRF-TOKEN.
                .csrf(CsrfConfigurer::spa)
                // Sin caché de petición: un 401 no debe crear una sesión ni guardar la URL pedida.
                .requestCache(RequestCacheConfigurer::disable)
                // Al autenticar se cambia el identificador de sesión (protección contra fijación de sesión).
                .sessionManagement(session -> session.sessionFixation(SessionManagementConfigurer.SessionFixationConfigurer::changeSessionId))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.GET, "/api/auth/csrf").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/register").permitAll()
                        .anyRequest().authenticated())
                // Login con formulario URL-encoded (email, password); responde JSON en vez de redirigir.
                .formLogin(form -> form
                        .loginPage("/login")
                        .loginProcessingUrl("/api/auth/login")
                        .usernameParameter("email")
                        .successHandler((request, response, authentication) -> writer.writeBody(
                                response, HttpStatus.OK, UserResponse.from((AppUserDetails) authentication.getPrincipal())))
                        .failureHandler((request, response, exception) -> writer.writeError(
                                request, response, HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_CREDENTIALS,
                                "Correo o contraseña incorrectos.")))
                .logout(logout -> logout
                        .logoutUrl("/api/auth/logout")
                        .invalidateHttpSession(true)
                        .deleteCookies(SESSION_COOKIE)
                        .logoutSuccessHandler(new HttpStatusReturningLogoutSuccessHandler(HttpStatus.NO_CONTENT)))
                .exceptionHandling(handling -> handling
                        .authenticationEntryPoint((request, response, exception) -> writer.writeError(
                                request, response, HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHENTICATED,
                                "Debes iniciar sesión para continuar."))
                        .accessDeniedHandler((request, response, exception) -> {
                            if (exception instanceof CsrfException) {
                                writer.writeError(request, response, HttpStatus.FORBIDDEN, ErrorCode.CSRF_INVALID,
                                        "El token de seguridad (CSRF) falta o no es válido. Recarga la página e inténtalo de nuevo.");
                            } else {
                                writer.writeError(request, response, HttpStatus.FORBIDDEN, ErrorCode.FORBIDDEN,
                                        "No tienes permisos para realizar esta acción.");
                            }
                        }));
        return http.build();
    }
}
