package com.hireiq.controller;

import com.hireiq.entity.User;
import com.hireiq.service.AuthService;
import com.hireiq.service.GoogleAuthService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final GoogleAuthService googleAuthService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.ok(authService.register(
                req.getName(), req.getEmail(), req.getPassword(), req.getRole()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req.getEmail(), req.getPassword()));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(authService.refreshToken(body.get("refreshToken")));
    }

    /**
     * Google Sign-In endpoint.
     * Frontend sends the Google ID token after the Google popup completes.
     * We verify it server-side and return our own JWT.
     */
    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody GoogleLoginRequest req) {
        return ResponseEntity.ok(googleAuthService.loginWithGoogle(
                req.getIdToken(),
                req.getRole()
        ));
    }

    // ─── Inner request classes ────────────────────────────────────────────────

    @Data
    static class RegisterRequest {
        @NotBlank private String name;
        @Email @NotBlank private String email;
        @Size(min = 8) @NotBlank private String password;
        private User.Role role = User.Role.SEEKER;
    }

    @Data
    static class LoginRequest {
        @Email @NotBlank private String email;
        @NotBlank private String password;
    }

    @Data
    static class GoogleLoginRequest {
        @NotBlank private String idToken;   // Google's ID token from frontend
        private User.Role role;             // SEEKER or EMPLOYER (for new users)
    }
}
