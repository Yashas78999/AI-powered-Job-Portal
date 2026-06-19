package com.hireiq.service;

import com.hireiq.entity.Application;
import com.hireiq.entity.Job;
import com.hireiq.entity.JobSeeker;
import com.hireiq.entity.ResumeAnalysis;
import com.hireiq.repository.ApplicationRepository;
import com.hireiq.repository.JobRepository;
import com.hireiq.repository.JobSeekerRepository;
import com.hireiq.repository.ResumeAnalysisRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final JobSeekerRepository jobSeekerRepository;
    private final ResumeAnalysisRepository resumeAnalysisRepository;
    private final JavaMailSender mailSender;

    // ─── Seeker: Apply to a job ────────────────────────────────────────────────
    @Transactional
    public Application apply(String seekerEmail, Long jobId, String coverLetter) {
        JobSeeker seeker = jobSeekerRepository.findByUserEmail(seekerEmail)
                .orElseThrow(() -> new RuntimeException("Seeker profile not found"));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (job.getStatus() != Job.JobStatus.ACTIVE) {
            throw new RuntimeException("This job is no longer accepting applications");
        }

        if (applicationRepository.existsByJobIdAndJobSeekerId(jobId, seeker.getId())) {
            throw new RuntimeException("You have already applied for this job");
        }

        Double matchScore = resumeAnalysisRepository
                .findTopByJobSeekerIdAndJobIdOrderByAnalyzedAtDesc(seeker.getId(), job.getId())
                .map(ResumeAnalysis::getScore)
                .orElse(null);

        Application application = Application.builder()
                .job(job)
                .jobSeeker(seeker)
                .coverLetter(coverLetter)
                .aiMatchScore(matchScore)
                .status(Application.ApplicationStatus.APPLIED)
                .build();

        application = applicationRepository.save(application);

        // Notify employer by email
        sendEmailSafely(
                job.getEmployer().getUser().getEmail(),
                "New Application - " + job.getTitle(),
                String.format("Hi %s,\n\n%s has applied for your job: %s\n\nLogin to HireIQ to review their profile.",
                        job.getEmployer().getUser().getName(),
                        seeker.getUser().getName(),
                        job.getTitle())
        );

        return application;
    }

    // ─── Seeker: View my applications ─────────────────────────────────────────
    public List<Application> getMyApplications(String seekerEmail) {
        JobSeeker seeker = jobSeekerRepository.findByUserEmail(seekerEmail)
                .orElseThrow(() -> new RuntimeException("Seeker profile not found"));
        return applicationRepository.findByJobSeekerIdOrderByAppliedAtDesc(seeker.getId());
    }

    // ─── Employer: View applicants for a job ──────────────────────────────────
    public List<Application> getJobApplications(Long jobId, String employerEmail) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (!job.getEmployer().getUser().getEmail().equals(employerEmail)) {
            throw new RuntimeException("Access denied");
        }

        return applicationRepository.findByJobIdOrderByAiMatchScoreDesc(jobId);
    }

    // ─── Employer: Update application status ──────────────────────────────────
    @Transactional
    public Application updateStatus(Long appId, String employerEmail,
                                    Application.ApplicationStatus status, String notes) {
        Application app = applicationRepository.findById(appId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        if (!app.getJob().getEmployer().getUser().getEmail().equals(employerEmail)) {
            throw new RuntimeException("Access denied");
        }

        app.setStatus(status);
        if (notes != null) app.setEmployerNotes(notes);
        app = applicationRepository.save(app);

        // Notify seeker of status change
        String seekerEmail = app.getJobSeeker().getUser().getEmail();
        String seekerName = app.getJobSeeker().getUser().getName();
        String jobTitle = app.getJob().getTitle();

        sendEmailSafely(seekerEmail,
                "Application Update - " + jobTitle,
                String.format("Hi %s,\n\nYour application for \"%s\" has been updated to: %s\n\n%s\n\nGood luck!",
                        seekerName, jobTitle, status.name(),
                        notes != null ? "Employer note: " + notes : "")
        );

        return app;
    }

    // ─── Safe email sender (won't crash app if email fails) ───────────────────
    private void sendEmailSafely(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception e) {
            log.warn("Email failed to send to {}: {}", to, e.getMessage());
        }
    }
}
