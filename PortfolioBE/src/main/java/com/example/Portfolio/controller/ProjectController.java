package com.example.Portfolio.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.Portfolio.dto.ProjectDetailResponse;
import com.example.Portfolio.dto.ProjectSummaryResponse;
import com.example.Portfolio.service.ProjectService;

import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("api/projects")
@Tag(name = "Project cong khai", description = "Khong yeu cau dang nhap")
public class ProjectController {
    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public List<ProjectSummaryResponse> getPublishedProjects() {
        return projectService.getPublishedProjects();
    }

    @GetMapping("/{slug}")
    public ProjectDetailResponse getProjectBySlug(@PathVariable String slug) {
        return projectService.getBySlug(slug);
    }

}
