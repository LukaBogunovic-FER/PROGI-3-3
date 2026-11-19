
package hr.fer.pictora.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {

    //vrati iformacije o trenutnom useru
    @GetMapping("/api/me")
    public MeResponse getCurrentUser(
            @AuthenticationPrincipal OidcUser user) {

        return new MeResponse(
            user.getSubject(),
            user.getClaimAsString("name"),
            user.getClaimAsString("email"),
            user.getClaimAsString("picture")
        );
    }

    //csrf za frontend request
    @GetMapping("/api/csrf")
    public ResponseEntity<Void> getCsrfToken(CsrfToken csrfToken) {

        csrfToken.getToken();

        return ResponseEntity.noContent().build();
    }

    public record MeResponse(
        String id,
        String name,
        String email,
        String avatarUrl
    ) {}
}
