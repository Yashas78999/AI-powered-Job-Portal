package com.hireiq.service;

import com.hireiq.entity.JobSeeker;
import com.hireiq.entity.User;
import com.hireiq.repository.JobSeekerRepository;
import com.hireiq.repository.UserRepository;
import com.hireiq.storage.CloudinaryStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SeekerService {

    private final JobSeekerRepository jobSeekerRepository;
    private final UserRepository userRepository;
    private final CloudinaryStorageService cloudinaryStorageService;

    @Transactional
    public JobSeeker getProfile(String email) {
        return jobSeekerRepository.findByUserEmail(email)
                .orElseGet(() -> {
                    User user = userRepository.findByEmail(email)
                            .orElseThrow(() -> new RuntimeException("User not found"));
                    JobSeeker seeker = JobSeeker.builder()
                            .user(user)
                            .build();
                    return jobSeekerRepository.save(seeker);
                });
    }

    @Transactional
    public JobSeeker updateProfile(String email, JobSeeker updates) {
        JobSeeker seeker = getProfile(email);
        seeker.setSkills(updates.getSkills());
        seeker.setExperienceYears(updates.getExperienceYears());
        seeker.setCurrentTitle(updates.getCurrentTitle());
        seeker.setLocation(updates.getLocation());
        seeker.setBio(updates.getBio());
        seeker.setLinkedinUrl(updates.getLinkedinUrl());
        seeker.setGithubUrl(updates.getGithubUrl());
        seeker.setPortfolioUrl(updates.getPortfolioUrl());
        seeker.setExpectedSalary(updates.getExpectedSalary());
        seeker.setIsOpenToWork(updates.getIsOpenToWork());
        return jobSeekerRepository.save(seeker);
    }

    @Transactional
    public JobSeeker uploadResume(String email, MultipartFile file) throws Exception {
        JobSeeker seeker = getProfile(email);

        // Delete old resume from Cloudinary if exists
        if (seeker.getResumePublicId() != null) {
            cloudinaryStorageService.deleteResume(seeker.getResumePublicId());
        }

        CloudinaryStorageService.UploadResult result =
                cloudinaryStorageService.uploadResume(file, seeker.getId());

        seeker.setResumeUrl(result.url());
        seeker.setResumePublicId(result.publicId());
        return jobSeekerRepository.save(seeker);
    }

    @Transactional
    public void deleteResume(String email) {
        JobSeeker seeker = getProfile(email);
        if (seeker.getResumePublicId() != null) {
            cloudinaryStorageService.deleteResume(seeker.getResumePublicId());
            seeker.setResumeUrl(null);
            seeker.setResumePublicId(null);
            jobSeekerRepository.save(seeker);
        }
    }
}
