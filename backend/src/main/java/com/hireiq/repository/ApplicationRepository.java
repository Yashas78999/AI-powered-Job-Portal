package com.hireiq.repository;

import com.hireiq.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    // All applications by a seeker
    List<Application> findByJobSeekerIdOrderByAppliedAtDesc(Long seekerId);

    // All applicants for a specific job (sorted by AI score descending)
    List<Application> findByJobIdOrderByAiMatchScoreDesc(Long jobId);

    // Check if a seeker already applied to a job
    boolean existsByJobIdAndJobSeekerId(Long jobId, Long seekerId);

    // Get specific application
    Optional<Application> findByJobIdAndJobSeekerId(Long jobId, Long seekerId);

    // Count applications per job
    long countByJobId(Long jobId);

    // Employer: all applications across all their jobs
    @Query("""
        SELECT a FROM Application a
        JOIN a.job j
        JOIN j.employer e
        WHERE e.id = :employerId
        ORDER BY a.appliedAt DESC
        """)
    List<Application> findByEmployerId(@Param("employerId") Long employerId);
}
