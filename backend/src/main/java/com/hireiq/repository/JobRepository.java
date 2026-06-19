package com.hireiq.repository;

import com.hireiq.entity.Job;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

    List<Job> findByStatus(Job.JobStatus status);

    List<Job> findTop10ByStatusOrderByCreatedAtDesc(Job.JobStatus status);

    List<Job> findByEmployerIdOrderByCreatedAtDesc(Long employerId);

    // ─── Smart Search Query ───────────────────────────────────────────────────
    // Filters by any combination of skills, location, workMode, jobType, salary, experience
    // Skills filter: checks if ANY of the required job skills match the searched skills
    @Query("""
        SELECT DISTINCT j FROM Job j
        LEFT JOIN j.requiredSkills s
        WHERE j.status = 'ACTIVE'
        AND (
            (CAST(:keyword AS string) IS NULL AND :skills IS NULL)
            OR
            (CAST(:keyword AS string) IS NOT NULL AND (
                LOWER(j.title) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) 
                OR LOWER(j.description) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%'))
            ))
            OR
            (:skills IS NOT NULL AND s IN :skills)
        )
        AND (CAST(:location AS string) IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', CAST(:location AS string), '%')))
        AND (:workMode IS NULL OR j.workMode = :workMode)
        AND (:jobType IS NULL OR j.jobType = :jobType)
        AND (:salaryMin IS NULL OR j.salaryMin >= :salaryMin)
        AND (:experienceMax IS NULL OR j.experienceRequired <= :experienceMax)
        ORDER BY j.createdAt DESC
        """)
    List<Job> smartSearch(
            @Param("keyword") String keyword,
            @Param("skills") List<String> skills,
            @Param("location") String location,
            @Param("workMode") Job.WorkMode workMode,
            @Param("jobType") Job.JobType jobType,
            @Param("salaryMin") Integer salaryMin,
            @Param("experienceMax") Integer experienceMax,
            Pageable pageable
    );

    // ─── Basic Search (keyword in title or description) ────────────────────
    @Query("""
        SELECT j FROM Job j
        WHERE j.status = 'ACTIVE'
        AND (LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%')))
        ORDER BY j.createdAt DESC
        """)
    List<Job> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    // ─── Increment view count ──────────────────────────────────────────────
    @Modifying
    @Query("UPDATE Job j SET j.viewsCount = j.viewsCount + 1 WHERE j.id = :id")
    void incrementViews(@Param("id") Long id);
}
