package com.hireiq.controller;

import com.hireiq.entity.Employer;
import com.hireiq.service.EmployerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employer")
@PreAuthorize("hasRole('EMPLOYER')")
@RequiredArgsConstructor
public class EmployerController {

    private final EmployerService employerService;

    @GetMapping("/profile")
    public ResponseEntity<Employer> getProfile(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(employerService.getProfile(user.getUsername()));
    }

    @PutMapping("/profile")
    public ResponseEntity<Employer> updateProfile(@AuthenticationPrincipal UserDetails user,
                                                   @RequestBody Employer updates) {
        return ResponseEntity.ok(employerService.updateProfile(user.getUsername(), updates));
    }
}
