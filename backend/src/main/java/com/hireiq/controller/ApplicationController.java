package com.hireiq.controller;

import com.hireiq.entity.Application;
import com.hireiq.service.ApplicationService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    // ─── Seeker ───────────────────────────────────────────────────────────────

    @PostMapping("/api/seeker/jobs/{jobId}/apply")
    @PreAuthorize("hasRole('SEEKER')")
    public ResponseEntity<Application> apply(@PathVariable Long jobId,
                                              @AuthenticationPrincipal UserDetails user,
                                              @RequestBody(required = false) ApplyRequest req) {
        String coverLetter = req != null ? req.getCoverLetter() : null;
        return ResponseEntity.ok(applicationService.apply(user.getUsername(), jobId, coverLetter));
    }

    @GetMapping("/api/seeker/applications")
    @PreAuthorize("hasRole('SEEKER')")
    public ResponseEntity<List<Application>> myApplications(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(applicationService.getMyApplications(user.getUsername()));
    }

    // ─── Employer ─────────────────────────────────────────────────────────────

    @GetMapping("/api/employer/jobs/{jobId}/applications")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<List<Application>> jobApplications(@PathVariable Long jobId,
                                                              @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(applicationService.getJobApplications(jobId, user.getUsername()));
    }

    @PatchMapping("/api/employer/applications/{appId}/status")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<Application> updateStatus(@PathVariable Long appId,
                                                     @AuthenticationPrincipal UserDetails user,
                                                     @RequestBody StatusUpdateRequest req) {
        return ResponseEntity.ok(applicationService.updateStatus(
                appId, user.getUsername(), req.getStatus(), req.getNotes()));
    }

    @Data
    static class ApplyRequest {
        private String coverLetter;
    }

    @Data
    static class StatusUpdateRequest {
        private Application.ApplicationStatus status;
        private String notes;
    }
}
