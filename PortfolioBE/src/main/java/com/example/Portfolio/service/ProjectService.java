package com.example.Portfolio.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.Portfolio.dto.ProjectDetailResponse;
import com.example.Portfolio.dto.ProjectSummaryResponse;
import com.example.Portfolio.entity.Project;
import com.example.Portfolio.entity.ProjectStatus;
import com.example.Portfolio.exception.ResourceNotFoundException;
import com.example.Portfolio.mapper.ProjectMapper;
import com.example.Portfolio.repository.ProjectRepository;

@Service
public class ProjectService {
    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    @Transactional(readOnly = true)
    public List<ProjectSummaryResponse> getPublishedProjects() {
        return projectRepository
                .findByStatusOrderByPublishedAtDesc(ProjectStatus.PUBLISHED)
                .stream()
                .map(ProjectMapper::toSummary)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProjectDetailResponse getBySlug(String slug) {
        Project project = projectRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay project voi slug: " + slug));
        return ProjectMapper.toDetail(project);

    }

}
