package com.hireiq.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "employers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Employer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "jobSeeker", "employer"})
    private User user;

    @Column(name = "company_name")
    private String companyName;

    @Column(name = "company_logo_url")
    private String companyLogoUrl;

    private String website;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String industry;

    private String location;

    @Column(name = "company_size")
    private String companySize; // e.g. "1-10", "11-50", "51-200"

    @Column(name = "founded_year")
    private Integer foundedYear;

    @OneToMany(mappedBy = "employer", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Job> jobs;
}
