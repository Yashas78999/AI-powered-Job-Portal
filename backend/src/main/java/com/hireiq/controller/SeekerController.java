package com.hireiq.controller;

import com.hireiq.ai.JobRecommendationService;
import com.hireiq.ai.ResumeAnalyzerService;
import com.hireiq.entity.Job;
import com.hireiq.entity.JobSeeker;
import com.hireiq.entity.ResumeAnalysis;
import com.hireiq.repository.JobRepository;
import com.hireiq.service.SeekerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/seeker")
@PreAuthorize("hasRole('SEEKER')")
@RequiredArgsConstructor
public class SeekerController {

    private final SeekerService seekerService;
    private final JobRecommendationService recommendationService;
    private final ResumeAnalyzerService resumeAnalyzerService;
    private final JobRepository jobRepository;

    // ─── Profile ──────────────────────────────────────────────────────────────

    @GetMapping("/profile")
    public ResponseEntity<JobSeeker> getProfile(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(seekerService.getProfile(user.getUsername()));
    }

    @PutMapping("/profile")
    public ResponseEntity<JobSeeker> updateProfile(@AuthenticationPrincipal UserDetails user,
                                                    @RequestBody JobSeeker updates) {
        return ResponseEntity.ok(seekerService.updateProfile(user.getUsername(), updates));
    }

    // ─── Resume ───────────────────────────────────────────────────────────────

    @PostMapping("/resume/upload")
    public ResponseEntity<JobSeeker> uploadResume(@AuthenticationPrincipal UserDetails user,
                                                   @RequestParam("file") MultipartFile file) throws Exception {
        return ResponseEntity.ok(seekerService.uploadResume(user.getUsername(), file));
    }

    @DeleteMapping("/resume")
    public ResponseEntity<Void> deleteResume(@AuthenticationPrincipal UserDetails user) {
        seekerService.deleteResume(user.getUsername());
        return ResponseEntity.noContent().build();
    }

    // ─── AI: Recommendations ─────────────────────────────────────────────────

    @GetMapping("/ai/recommendations")
    public ResponseEntity<List<Job>> getRecommendations(@AuthenticationPrincipal UserDetails user) {
        JobSeeker seeker = seekerService.getProfile(user.getUsername());
        return ResponseEntity.ok(recommendationService.getRecommendations(seeker));
    }

    @GetMapping("/ai/recommendations/{jobId}/explain")
    public ResponseEntity<String> explainRecommendation(@AuthenticationPrincipal UserDetails user,
                                                          @PathVariable Long jobId) {
        JobSeeker seeker = seekerService.getProfile(user.getUsername());
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        return ResponseEntity.ok(recommendationService.explainRecommendation(seeker, job));
    }

    // ─── AI: Resume Analysis ─────────────────────────────────────────────────

    @PostMapping("/ai/analyze-resume/{jobId}")
    public ResponseEntity<ResumeAnalysis> analyzeResume(@AuthenticationPrincipal UserDetails user,
                                                          @PathVariable Long jobId,
                                                          @RequestParam(required = false) String resumeText) {
        JobSeeker seeker = seekerService.getProfile(user.getUsername());
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (seeker.getResumeUrl() == null) {
            throw new RuntimeException("Please upload your resume first");
        }

        // resumeText can be extracted on frontend via PDF.js, or sent from backend PDF parser
        return ResponseEntity.ok(resumeAnalyzerService.analyzeResume(seeker, job, resumeText));
    }
}
