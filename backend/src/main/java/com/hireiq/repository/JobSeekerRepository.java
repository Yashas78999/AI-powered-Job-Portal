package com.hireiq.repository;

import com.hireiq.entity.JobSeeker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface JobSeekerRepository extends JpaRepository<JobSeeker, Long> {
    Optional<JobSeeker> findByUserId(Long userId);
    Optional<JobSeeker> findByUserEmail(String email);
}
