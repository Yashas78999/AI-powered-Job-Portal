package com.hireiq.repository;

import com.hireiq.entity.ResumeAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeAnalysisRepository extends JpaRepository<ResumeAnalysis, Long> {

    // Latest analysis for a seeker against a specific job
    Optional<ResumeAnalysis> findTopByJobSeekerIdAndJobIdOrderByAnalyzedAtDesc(
            Long seekerId, Long jobId);

    // All analyses for a seeker
    List<ResumeAnalysis> findByJobSeekerIdOrderByAnalyzedAtDesc(Long seekerId);
}
