package com.hireiq.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "resume_analyses")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ResumeAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seeker_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "resumeAnalyses"})
    private JobSeeker jobSeeker;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "applications"})
    private Job job; // nullable — can analyze resume without a specific job

    @Column(nullable = false)
    private Double score; // 0.0 - 100.0

    @Column(name = "matched_skills", columnDefinition = "TEXT")
    private String matchedSkills; // JSON array stored as string

    @Column(name = "missing_skills", columnDefinition = "TEXT")
    private String missingSkills; // JSON array

    @Column(name = "strengths", columnDefinition = "TEXT")
    private String strengths;

    @Column(name = "improvements", columnDefinition = "TEXT")
    private String improvements;

    @Column(name = "extracted_skills", columnDefinition = "TEXT")
    private String extractedSkills; // AI-extracted skills from resume

    @Column(name = "experience_summary", columnDefinition = "TEXT")
    private String experienceSummary;

    @CreationTimestamp
    @Column(name = "analyzed_at", updatable = false)
    private LocalDateTime analyzedAt;
}
