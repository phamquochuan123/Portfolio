package com.example.Portfolio.mapper;

import java.util.List;

import com.example.Portfolio.dto.ProjectDetailResponse;
import com.example.Portfolio.dto.ProjectSummaryResponse;
import com.example.Portfolio.dto.TagResponse;
import com.example.Portfolio.entity.Project;

public final class ProjectMapper {
    private ProjectMapper() {

    }

    private static List<TagResponse> tags(Project project) {
        return project.getTags().stream().map(TagResponse::from).toList();
    }

    public static ProjectSummaryResponse toSummary(Project project) {
        return new ProjectSummaryResponse(
                project.getId(),
                project.getTitle(),
                project.getSlug(),
                project.getSummary(),
                project.getThumbnailUrl(),
                project.getPublishedAt(),
                tags(project));
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
                project.getPublishedAt(),
                tags(project)

        );
    }
}
