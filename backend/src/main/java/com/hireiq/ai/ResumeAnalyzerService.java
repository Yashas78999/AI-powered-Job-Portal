package com.hireiq.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hireiq.entity.Application;
import com.hireiq.entity.Job;
import com.hireiq.entity.JobSeeker;
import com.hireiq.entity.ResumeAnalysis;
import com.hireiq.repository.ApplicationRepository;
import com.hireiq.repository.ResumeAnalysisRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResumeAnalyzerService {

    private final ChatClient chatClient;
    private final ResumeAnalysisRepository resumeAnalysisRepository;
    private final ApplicationRepository applicationRepository;
    private final ObjectMapper objectMapper;

    public ResumeAnalysis analyzeResume(JobSeeker seeker, Job job, String resumeText) {
        if (resumeText == null || resumeText.trim().isEmpty()) {
            StringBuilder sb = new StringBuilder();
            sb.append("Candidate Name: ").append(seeker.getUser().getName()).append("\n");
            sb.append("Current Title: ").append(seeker.getCurrentTitle() != null ? seeker.getCurrentTitle() : "N/A").append("\n");
            sb.append("Experience: ").append(seeker.getExperienceYears() != null ? seeker.getExperienceYears() : 0).append(" years\n");
            sb.append("Skills: ").append(seeker.getSkills() != null ? String.join(", ", seeker.getSkills()) : "N/A").append("\n");
            sb.append("Bio: ").append(seeker.getBio() != null ? seeker.getBio() : "N/A").append("\n");
            resumeText = sb.toString();
        }
        String prompt = """
            You are an expert HR analyst. Analyze the resume against the job and return ONLY valid JSON, no markdown.

            Job Title: %s
            Job Description: %s
            Required Skills: %s
            Experience Required: %d years

            Resume:
            %s

            Return exactly:
            {
              "score": <0-100>,
              "matchedSkills": ["skill1"],
              "missingSkills": ["skill1"],
              "extractedSkills": ["skill1"],
              "experienceSummary": "summary",
              "strengths": "strengths text",
              "improvements": "improvements text"
            }
            """.formatted(
                job.getTitle(),
                job.getDescription(),
                String.join(", ", job.getRequiredSkills()),
                job.getExperienceRequired() != null ? job.getExperienceRequired() : 0,
                resumeText
        );

        try {
            String response = chatClient.prompt().user(prompt).call().content();
            String cleanedResponse = cleanJsonResponse(response);
            Map<String, Object> result = objectMapper.readValue(cleanedResponse, Map.class);

            ResumeAnalysis analysis = ResumeAnalysis.builder()
                    .jobSeeker(seeker)
                    .job(job)
                    .score(((Number) result.get("score")).doubleValue())
                    .matchedSkills(objectMapper.writeValueAsString(result.get("matchedSkills")))
                    .missingSkills(objectMapper.writeValueAsString(result.get("missingSkills")))
                    .extractedSkills(objectMapper.writeValueAsString(result.get("extractedSkills")))
                    .experienceSummary((String) result.get("experienceSummary"))
                    .strengths((String) result.get("strengths"))
                    .improvements((String) result.get("improvements"))
                    .build();

            analysis = resumeAnalysisRepository.save(analysis);

            // Update application AI score if seeker has already applied
            final Double scoreValue = analysis.getScore();
            applicationRepository.findByJobIdAndJobSeekerId(job.getId(), seeker.getId())
                    .ifPresent(app -> {
                        app.setAiMatchScore(scoreValue);
                        applicationRepository.save(app);
                    });

            return analysis;
        } catch (Exception e) {
            log.error("Resume analysis failed: {}", e.getMessage());
            throw new RuntimeException("Failed to analyze resume: " + e.getMessage());
        }
    }

    public Map<String, Object> extractResumeInfo(String resumeText) {
        String prompt = """
            Extract structured info from this resume. Return ONLY valid JSON:
            {
              "name": "candidate name",
              "skills": ["skill1"],
              "experienceYears": 0,
              "currentTitle": "job title",
              "education": "degree",
              "summary": "2-sentence summary"
            }

            Resume:
            %s
            """.formatted(resumeText);

        try {
            String response = chatClient.prompt().user(prompt).call().content();
            String cleanedResponse = cleanJsonResponse(response);
            return objectMapper.readValue(cleanedResponse, Map.class);
        } catch (Exception e) {
            log.error("Resume extraction failed: {}", e.getMessage());
            throw new RuntimeException("Failed to extract resume info");
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
}
