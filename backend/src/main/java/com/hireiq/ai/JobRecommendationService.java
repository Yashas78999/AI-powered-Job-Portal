package com.hireiq.ai;

import com.hireiq.entity.Job;
import com.hireiq.entity.JobSeeker;
import com.hireiq.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobRecommendationService {

    private final ChatClient chatClient;
    private final JobRepository jobRepository;

    public List<Job> getRecommendations(JobSeeker seeker) {
        if (seeker.getSkills() == null || seeker.getSkills().isEmpty()) {
            return jobRepository.findTop10ByStatusOrderByCreatedAtDesc(Job.JobStatus.ACTIVE);
        }

        List<Job> activeJobs = jobRepository.findByStatus(Job.JobStatus.ACTIVE);
        if (activeJobs.isEmpty()) return List.of();

        Map<Job, Double> scored = new LinkedHashMap<>();
        for (Job job : activeJobs) {
            scored.put(job, calculateMatchScore(seeker, job));
        }

        return scored.entrySet().stream()
                .sorted(Map.Entry.<Job, Double>comparingByValue().reversed())
                .limit(10)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    public String explainRecommendation(JobSeeker seeker, Job job) {
        String prompt = """
            A job seeker with skills: %s (%d years exp, title: %s)
            is being recommended for: "%s" requiring: %s.

            In 2-3 sentences explain why this is a great match. Be specific and encouraging.
            """.formatted(
                String.join(", ", seeker.getSkills()),
                seeker.getExperienceYears() != null ? seeker.getExperienceYears() : 0,
                seeker.getCurrentTitle() != null ? seeker.getCurrentTitle() : "professional",
                job.getTitle(),
                String.join(", ", job.getRequiredSkills())
        );

        try {
            return chatClient.prompt().user(prompt).call().content();
        } catch (Exception e) {
            log.error("Explanation failed: {}", e.getMessage());
            return "This job matches your profile based on your skills and experience.";
        }
    }

    @Scheduled(cron = "0 0 0 * * *")
    public void refreshRecommendationCache() {
        log.info("Refreshing recommendation cache...");
    }

    private double calculateMatchScore(JobSeeker seeker, Job job) {
        if (job.getRequiredSkills() == null || job.getRequiredSkills().isEmpty()) return 0.5;

        List<String> seekerSkills = seeker.getSkills().stream()
                .map(String::toLowerCase).collect(Collectors.toList());

        long matched = job.getRequiredSkills().stream()
                .map(String::toLowerCase)
                .filter(seekerSkills::contains)
                .count();

        double skillScore = (double) matched / job.getRequiredSkills().size();
        double expScore = 1.0;

        if (job.getExperienceRequired() != null && seeker.getExperienceYears() != null) {
            int diff = Math.abs(seeker.getExperienceYears() - job.getExperienceRequired());
            expScore = Math.max(0, 1.0 - (diff * 0.2));
        }

        return (skillScore * 0.7) + (expScore * 0.3);
    }
}
