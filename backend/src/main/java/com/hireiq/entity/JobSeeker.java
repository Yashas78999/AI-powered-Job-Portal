package com.hireiq.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "job_seekers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class JobSeeker {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "jobSeeker", "employer"})
    private User user;

    @Column(name = "resume_url")
    private String resumeUrl;

    @Column(name = "resume_public_id") // Cloudinary public_id for deletion
    private String resumePublicId;

    @ElementCollection
    @CollectionTable(name = "seeker_skills", joinColumns = @JoinColumn(name = "seeker_id"))
    @Column(name = "skill")
    private List<String> skills;

    @Column(name = "experience_years")
    private Integer experienceYears;

    @Column(name = "current_title")
    private String currentTitle;

    private String location;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "linkedin_url")
    private String linkedinUrl;

    @Column(name = "github_url")
    private String githubUrl;

    @Column(name = "portfolio_url")
    private String portfolioUrl;

    @Column(name = "expected_salary")
    private Integer expectedSalary;

    @Column(name = "is_open_to_work")
    @Builder.Default
    private Boolean isOpenToWork = true;

    @OneToMany(mappedBy = "jobSeeker", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Application> applications;

    @OneToMany(mappedBy = "jobSeeker", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<ResumeAnalysis> resumeAnalyses;
}
