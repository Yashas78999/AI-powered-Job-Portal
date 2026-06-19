package com.hireiq.controller;

import com.hireiq.ai.SmartSearchService;
import com.hireiq.entity.Job;
import com.hireiq.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;
    private final SmartSearchService smartSearchService;

    // ─── Public Endpoints ─────────────────────────────────────────────────────

    @GetMapping("/api/jobs/search")
    public ResponseEntity<List<Job>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(jobService.searchJobs(keyword, page, size));
    }

    @GetMapping("/api/jobs/smart-search")
    public ResponseEntity<List<Job>> smartSearch(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(smartSearchService.smartSearch(query, page, size));
    }

    @GetMapping("/api/jobs/featured")
    public ResponseEntity<List<Job>> featured() {
        return ResponseEntity.ok(jobService.getFeaturedJobs());
    }

    @GetMapping("/api/jobs/{id}")
    public ResponseEntity<Job> getById(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getJobById(id));
    }

    // ─── Employer Endpoints ───────────────────────────────────────────────────

    @PostMapping("/api/employer/jobs")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<Job> createJob(@AuthenticationPrincipal UserDetails user,
                                          @RequestBody Job job) {
        return ResponseEntity.ok(jobService.createJob(user.getUsername(), job));
    }

    @PutMapping("/api/employer/jobs/{id}")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<Job> updateJob(@PathVariable Long id,
                                          @AuthenticationPrincipal UserDetails user,
                                          @RequestBody Job job) {
        return ResponseEntity.ok(jobService.updateJob(id, user.getUsername(), job));
    }

    @DeleteMapping("/api/employer/jobs/{id}")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id,
                                           @AuthenticationPrincipal UserDetails user) {
        jobService.deleteJob(id, user.getUsername());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/api/employer/jobs/{id}/status")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<Job> updateStatus(@PathVariable Long id,
                                             @AuthenticationPrincipal UserDetails user,
                                             @RequestParam Job.JobStatus status) {
        return ResponseEntity.ok(jobService.updateJobStatus(id, user.getUsername(), status));
    }

    @GetMapping("/api/employer/jobs")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<List<Job>> getMyJobs(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(jobService.getMyJobs(user.getUsername()));
    }
}
