package com.hireiq.dto;

import com.hireiq.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

// ─── Request DTOs ───────────────────────────────────────────────────────────

class RegisterRequest {
    @NotBlank public String name;
    @Email @NotBlank public String email;
    @Size(min = 8) @NotBlank public String password;
    public User.Role role; // SEEKER or EMPLOYER
}

class LoginRequest {
    @Email @NotBlank public String email;
    @NotBlank public String password;
}

// ─── Response DTOs ──────────────────────────────────────────────────────────

@Data
class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private UserDTO user;
}

@Data
class UserDTO {
    private Long id;
    private String name;
    private String email;
    private String role;
    private String profilePicture;
}
