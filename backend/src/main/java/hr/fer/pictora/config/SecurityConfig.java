
package hr.fer.pictora.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
            // CSRF 
            .csrf(csrf -> csrf.spa())

            // endpointovi za koje treba aut
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/api/health",
                    "/api/csrf",
                    "/oauth2/**",
                    "/login/**",
                    "/error"
                ).permitAll()

                
                .requestMatchers("/api/**").authenticated()

                .anyRequest().permitAll()
            )

            //vrati 401 ako nije autoriziran
            .exceptionHandling(exceptions -> exceptions
                .defaultAuthenticationEntryPointFor(
                    new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED),
                    request -> request.getRequestURI().startsWith("/api/")
                )
            )

            // google login
            .oauth2Login(oauth2 -> oauth2
                .defaultSuccessUrl(
                    "http://localhost:5173/workspace",
                    true
                )
                .failureUrl(
                    "http://localhost:5173/login?error"
                )
            )

            .logout(logout -> logout
                .logoutUrl("/api/logout")
                .logoutSuccessHandler((request, response, authentication) ->
                    response.setStatus(HttpStatus.NO_CONTENT.value())
                )
            );

        return http.build();
    }
}
