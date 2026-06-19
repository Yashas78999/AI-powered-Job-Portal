package com.hireiq.service;

import com.hireiq.entity.*;
import com.hireiq.repository.UserRepository;
import com.hireiq.repository.JobSeekerRepository;
import com.hireiq.repository.EmployerRepository;
import com.hireiq.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JobSeekerRepository jobSeekerRepository;
    private final EmployerRepository employerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public Map<String, Object> register(String name, String email, String password, User.Role role) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already registered");
        }

        User user = User.builder()
                .name(name)
                .email(email)
                .password(passwordEncoder.encode(password))
                .role(role)
                .build();

        user = userRepository.save(user);

        // Create role-specific profile
        if (role == User.Role.SEEKER) {
            JobSeeker seeker = JobSeeker.builder().user(user).build();
            jobSeekerRepository.save(seeker);
        } else if (role == User.Role.EMPLOYER) {
            Employer employer = Employer.builder()
                    .user(user)
                    .companyName(name + "'s Company")
                    .build();
            employerRepository.save(employer);
        }

        String accessToken = jwtTokenProvider.generateToken(email, role.name());
        String refreshToken = jwtTokenProvider.generateRefreshToken(email);

        return buildAuthResponse(user, accessToken, refreshToken);
    }

    public Map<String, Object> login(String email, String password) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
        );

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String accessToken = jwtTokenProvider.generateToken(email, user.getRole().name());
        String refreshToken = jwtTokenProvider.generateRefreshToken(email);

        return buildAuthResponse(user, accessToken, refreshToken);
    }

    public Map<String, Object> refreshToken(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new RuntimeException("Invalid refresh token");
        }

        String email = jwtTokenProvider.extractEmail(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String newAccessToken = jwtTokenProvider.generateToken(email, user.getRole().name());
        return Map.of("accessToken", newAccessToken);
    }

    private Map<String, Object> buildAuthResponse(User user, String accessToken, String refreshToken) {
        return Map.of(
                "accessToken", accessToken,
                "refreshToken", refreshToken,
                "user", Map.of(
                        "id", user.getId(),
                        "name", user.getName(),
                        "email", user.getEmail(),
                        "role", user.getRole().name()
                )
        );
    }
}
