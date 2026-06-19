package com.hireiq.service;

import com.hireiq.entity.Employer;
import com.hireiq.entity.User;
import com.hireiq.repository.EmployerRepository;
import com.hireiq.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EmployerService {

    private final EmployerRepository employerRepository;
    private final UserRepository userRepository;

    @Transactional
    public Employer getProfile(String email) {
        return employerRepository.findByUserEmail(email)
                .orElseGet(() -> {
                    User user = userRepository.findByEmail(email)
                            .orElseThrow(() -> new RuntimeException("User not found"));
                    Employer employer = Employer.builder()
                            .user(user)
                            .companyName(user.getName() + "'s Company")
                            .build();
                    return employerRepository.save(employer);
                });
    }

    @Transactional
    public Employer updateProfile(String email, Employer updates) {
        Employer employer = getProfile(email);
        employer.setCompanyName(updates.getCompanyName());
        employer.setWebsite(updates.getWebsite());
        employer.setDescription(updates.getDescription());
        employer.setIndustry(updates.getIndustry());
        employer.setLocation(updates.getLocation());
        employer.setCompanySize(updates.getCompanySize());
        employer.setFoundedYear(updates.getFoundedYear());
        return employerRepository.save(employer);
    }
}
