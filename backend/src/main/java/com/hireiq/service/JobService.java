package com.hireiq.service;

import com.hireiq.entity.Employer;
import com.hireiq.entity.Job;
import com.hireiq.repository.EmployerRepository;
import com.hireiq.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final EmployerRepository employerRepository;

    // ─── Public ──────────────────────────────────────────────────────────────

    public List<Job> searchJobs(String keyword, int page, int size) {
        if (keyword == null || keyword.isBlank()) {
            return jobRepository.findByStatus(Job.JobStatus.ACTIVE);
        }
        return jobRepository.searchByKeyword(keyword, PageRequest.of(page, size));
    }

    @Transactional
    public Job getJobById(Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        jobRepository.incrementViews(id);
        return job;
    }

    public List<Job> getFeaturedJobs() {
        return jobRepository.findTop10ByStatusOrderByCreatedAtDesc(Job.JobStatus.ACTIVE);
    }

    // ─── Employer ─────────────────────────────────────────────────────────────

    @Transactional
    public Job createJob(String employerEmail, Job job) {
        Employer employer = employerRepository.findByUserEmail(employerEmail)
                .orElseThrow(() -> new RuntimeException("Employer profile not found"));
        job.setEmployer(employer);
        job.setStatus(Job.JobStatus.ACTIVE);
        return jobRepository.save(job);
    }

    @Transactional
    public Job updateJob(Long jobId, String employerEmail, Job updatedJob) {
        Job job = getJobOwnedBy(jobId, employerEmail);
        job.setTitle(updatedJob.getTitle());
        job.setDescription(updatedJob.getDescription());
        job.setRequiredSkills(updatedJob.getRequiredSkills());
        job.setSalaryMin(updatedJob.getSalaryMin());
        job.setSalaryMax(updatedJob.getSalaryMax());
        job.setLocation(updatedJob.getLocation());
        job.setJobType(updatedJob.getJobType());
        job.setWorkMode(updatedJob.getWorkMode());
        job.setExperienceRequired(updatedJob.getExperienceRequired());
        job.setApplicationDeadline(updatedJob.getApplicationDeadline());
        return jobRepository.save(job);
    }

    @Transactional
    public void deleteJob(Long jobId, String employerEmail) {
        Job job = getJobOwnedBy(jobId, employerEmail);
        jobRepository.delete(job);
    }

    @Transactional
    public Job updateJobStatus(Long jobId, String employerEmail, Job.JobStatus status) {
        Job job = getJobOwnedBy(jobId, employerEmail);
        job.setStatus(status);
        return jobRepository.save(job);
    }

    public List<Job> getMyJobs(String employerEmail) {
        Employer employer = employerRepository.findByUserEmail(employerEmail)
                .orElseThrow(() -> new RuntimeException("Employer profile not found"));
        return jobRepository.findByEmployerIdOrderByCreatedAtDesc(employer.getId());
    }

    // ─── Helper ───────────────────────────────────────────────────────────────

    private Job getJobOwnedBy(Long jobId, String employerEmail) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        if (!job.getEmployer().getUser().getEmail().equals(employerEmail)) {
            throw new RuntimeException("You don't own this job");
        }
        return job;
    }
}
