package com.hireiq.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hireiq.entity.Job;
import com.hireiq.repository.JobRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SmartSearchService {

    private final ChatClient chatClient;
    private final JobRepository jobRepository;
    private final ObjectMapper objectMapper;

    public List<Job> smartSearch(String query, int page, int size) {
        SearchFilters filters = extractFilters(query);
        log.info("Smart search filters: {}", filters);

        String keyword = filters.getKeyword();
        List<String> skills = filters.getSkills();
        if (skills != null && skills.isEmpty()) {
            skills = null;
        }

        // Fallback: if Gemini failed or didn't return any keyword or skills, use raw query as keyword search
        if ((keyword == null || keyword.isBlank()) && skills == null) {
            keyword = query;
        }

        if (keyword != null && keyword.isBlank()) {
            keyword = null;
        }

        Job.WorkMode workModeEnum = null;
        if (filters.getWorkMode() != null) {
            try {
                workModeEnum = Job.WorkMode.valueOf(filters.getWorkMode().toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid work mode: {}", filters.getWorkMode());
            }
        }

        Job.JobType jobTypeEnum = null;
        if (filters.getJobType() != null) {
            try {
                jobTypeEnum = Job.JobType.valueOf(filters.getJobType().toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid job type: {}", filters.getJobType());
            }
        }

        return jobRepository.smartSearch(
                keyword,
                skills,
                filters.getLocation(),
                workModeEnum,
                jobTypeEnum,
                filters.getSalaryMin(),
                filters.getExperienceMax(),
                PageRequest.of(page, size)
        );
    }

    private SearchFilters extractFilters(String query) {
        String prompt = """
            Parse this job search query into filters. Return ONLY valid JSON, no markdown.
            For keyword, extract the target job title, role name, or generic search phrase if mentioned (e.g. "AI Engineer", "React Developer", "Software Engineer"). Otherwise set to null.
            For workMode use: REMOTE, ONSITE, HYBRID, or null.
            For jobType use: FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, or null.

            Query: "%s"

            Return:
            {
              "keyword": null,
              "skills": [],
              "location": null,
              "workMode": null,
              "jobType": null,
              "salaryMin": null,
              "experienceMax": null
            }
            """.formatted(query);

        try {
            String response = chatClient.prompt().user(prompt).call().content();
            String cleanedResponse = cleanJsonResponse(response);
            Map<String, Object> parsed = objectMapper.readValue(cleanedResponse, Map.class);

            SearchFilters filters = new SearchFilters();
            filters.setKeyword((String) parsed.get("keyword"));
            filters.setSkills((List<String>) parsed.getOrDefault("skills", List.of()));
            filters.setLocation((String) parsed.get("location"));
            filters.setWorkMode((String) parsed.get("workMode"));
            filters.setJobType((String) parsed.get("jobType"));
            filters.setSalaryMin(parsed.get("salaryMin") != null
                    ? ((Number) parsed.get("salaryMin")).intValue() : null);
            filters.setExperienceMax(parsed.get("experienceMax") != null
                    ? ((Number) parsed.get("experienceMax")).intValue() : null);
            return filters;
        } catch (Exception e) {
            log.error("Smart search parsing failed, using empty filters: {}", e.getMessage());
            SearchFilters fallback = new SearchFilters();
            fallback.setSkills(List.of());
            return fallback;
        }
    }

    private String cleanJsonResponse(String response) {
        if (response == null) {
            return "";
        }
        response = response.trim();
        if (response.startsWith("```")) {
            response = response.replaceAll("^```[a-zA-Z]*\\s*", "");
            response = response.replaceAll("\\s*```$", "");
        }
        return response.trim();
    }

    @Data
    public static class SearchFilters {
        private String keyword;
        private List<String> skills = List.of();
        private String location;
        private String workMode;
        private String jobType;
        private Integer salaryMin;
        private Integer experienceMax;
    }
}
