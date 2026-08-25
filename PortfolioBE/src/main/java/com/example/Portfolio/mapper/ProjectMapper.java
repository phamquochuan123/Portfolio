package com.example.Portfolio.mapper;

import com.example.Portfolio.dto.ProjectDetailResponse;
import com.example.Portfolio.dto.ProjectSummaryResponse;
import com.example.Portfolio.entity.Project;

public final class ProjectMapper {
    private ProjectMapper() {

    }

    public static ProjectSummaryResponse toSummary(Project project) {
        return new ProjectSummaryResponse(
                project.getId(),
                project.getTitle(),
                project.getSlug(),
                project.getSummary(),
                project.getThumbnailUrl(),
                project.getPublishedAt());
    }

    public static ProjectDetailResponse toDetail(Project project) {
        return new ProjectDetailResponse(
                project.getId(),
                project.getTitle(),
                project.getSlug(),
                project.getSummary(),
                project.getContent(),
                project.getThumbnailUrl(),
                project.getDemoUrl(),
                project.getRepoUrl(),
                project.getStatus(),
                project.getViewCount(),
                project.getPublishedAt()

        );
    }
}
