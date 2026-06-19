package com.hireiq.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.hireiq.entity.Employer;
import com.hireiq.entity.JobSeeker;
import com.hireiq.entity.User;
import com.hireiq.repository.EmployerRepository;
import com.hireiq.repository.JobSeekerRepository;
import com.hireiq.repository.UserRepository;
import com.hireiq.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleAuthService {

    private final UserRepository userRepository;
    private final JobSeekerRepository jobSeekerRepository;
    private final EmployerRepository employerRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    /**
     * Flow:
     * 1. Frontend: user clicks "Continue with Google" → Google popup
     * 2. Frontend: Google returns an ID token (JWT from Google)
     * 3. Frontend: sends that ID token to our backend
     * 4. Backend (here): verifies the token is genuine using Google's public keys
     * 5. Backend: extracts email/name/picture from token
     * 6. Backend: finds or creates user in our DB
     * 7. Backend: returns our own JWT to the frontend
     */
    @Transactional
    public Map<String, Object> loginWithGoogle(String idToken, User.Role role) {
        GoogleIdToken.Payload payload = verifyGoogleToken(idToken);

        String email = payload.getEmail();
        String name = (String) payload.get("name");
        String picture = (String) payload.get("picture");
        String googleSub = payload.getSubject(); // unique Google user ID

        // Find existing user or create new one
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> createGoogleUser(email, name, picture, googleSub, role));

        // If user exists but logged in with password before, link Google account
        if (user.getOauthId() == null) {
            user.setOauthId(googleSub);
            user.setOauthProvider("google");
            user.setProfilePicture(picture);
            userRepository.save(user);
        }

        String accessToken = jwtTokenProvider.generateToken(email, user.getRole().name());
        String refreshToken = jwtTokenProvider.generateRefreshToken(email);

        return Map.of(
                "accessToken", accessToken,
                "refreshToken", refreshToken,
                "user", Map.of(
                        "id", user.getId(),
                        "name", user.getName(),
                        "email", user.getEmail(),
                        "role", user.getRole().name(),
                        "profilePicture", user.getProfilePicture() != null ? user.getProfilePicture() : ""
                )
        );
    }

    private User createGoogleUser(String email, String name, String picture,
                                   String googleSub, User.Role role) {
        User user = User.builder()
                .email(email)
                .name(name)
                .profilePicture(picture)
                .oauthProvider("google")
                .oauthId(googleSub)
                .role(role != null ? role : User.Role.SEEKER) // default to SEEKER
                .isActive(true)
                // No password — Google users authenticate via Google
                .build();

        user = userRepository.save(user);

        // Create role profile
        if (user.getRole() == User.Role.SEEKER) {
            jobSeekerRepository.save(JobSeeker.builder().user(user).build());
        } else if (user.getRole() == User.Role.EMPLOYER) {
            employerRepository.save(Employer.builder()
                    .user(user)
                    .companyName(name + "'s Company")
                    .build());
        }

        log.info("New Google user created: {}", email);
        return user;
    }

    private GoogleIdToken.Payload verifyGoogleToken(String idTokenString) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                throw new RuntimeException("Invalid Google token");
            }

            return idToken.getPayload();

        } catch (Exception e) {
            log.error("Google token verification failed: {}", e.getMessage());
            throw new RuntimeException("Google authentication failed: " + e.getMessage());
        }
    }
}
