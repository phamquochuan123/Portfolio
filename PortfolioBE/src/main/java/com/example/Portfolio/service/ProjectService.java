package com.example.Portfolio.service;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.Portfolio.dto.ProjectDetailResponse;
import com.example.Portfolio.dto.ProjectRequest;
import com.example.Portfolio.dto.ProjectSummaryResponse;
import com.example.Portfolio.entity.Project;
import com.example.Portfolio.entity.ProjectStatus;
import com.example.Portfolio.entity.Tag;
import com.example.Portfolio.repository.TagRepository;
import com.example.Portfolio.util.TagSlug;
import com.example.Portfolio.exception.DuplicateResourceException;
import com.example.Portfolio.exception.ResourceNotFoundException;
import com.example.Portfolio.mapper.ProjectMapper;
import com.example.Portfolio.repository.ProjectRepository;

@Service
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final TagRepository tagRepository;

    public ProjectService(ProjectRepository projectRepository, TagRepository tagRepository) {
        this.projectRepository = projectRepository;
        this.tagRepository = tagRepository;
    }

    /** Khoá cache tách theo tag để danh sách lọc và danh sách đầy đủ không đè lên nhau. */
    @Cacheable(value = "projects:list", key = "#tagSlug == null || #tagSlug.isBlank() ? 'all' : 'tag:' + #tagSlug")
    @Transactional(readOnly = true)
    public List<ProjectSummaryResponse> getPublishedProjects(String tagSlug) {
        List<Project> projects = (tagSlug == null || tagSlug.isBlank())
                ? projectRepository.findByStatusOrderByPublishedAtDesc(ProjectStatus.PUBLISHED)
                : projectRepository.findByStatusAndTagSlug(ProjectStatus.PUBLISHED, tagSlug);

        return projects.stream().map(ProjectMapper::toSummary).toList();
    }

    /** Đếm lượt xem tách khỏi getBySlug để cache hit vẫn được tính. */
    @Transactional
    public void recordView(String slug) {
        projectRepository.incrementViewCount(slug);
    }

    @Cacheable(value = "projects:detail", key = "#slug")
    @Transactional(readOnly = true)
    public ProjectDetailResponse getBySlug(String slug) {
        Project project = projectRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay project voi slug: " + slug));
        return ProjectMapper.toDetail(project);

    }

    @Transactional(readOnly = true)
    public List<ProjectDetailResponse> getAllForAdmin() {
        return projectRepository
                .findAll()
                .stream()
                .map(ProjectMapper::toDetail)
                .toList();
    }

    @Caching(evict = {
            @CacheEvict(value = "projects:list", allEntries = true),
            @CacheEvict(value = "projects:detail", allEntries = true)
    })
    @Transactional
    public ProjectDetailResponse create(ProjectRequest request) {
        if (projectRepository.existsBySlug(request.slug())) {
            throw new DuplicateResourceException("Slug đã tồn tại" + request.slug());
        }

        Project project = new Project(request.title(), request.slug());
        applyChanges(project, request);

        Project saved = projectRepository.save(project);
        return ProjectMapper.toDetail(saved);
    }

    @Caching(evict = {
            @CacheEvict(value = "projects:list", allEntries = true),
            @CacheEvict(value = "projects:detail", allEntries = true)
    })
    @Transactional
    public ProjectDetailResponse update(Long id, ProjectRequest request) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy project với id: " + id));

        if (!project.getSlug().equals(request.slug())
                && projectRepository.existsBySlug(request.slug())) {
            throw new DuplicateResourceException("Slug đã tồn tạil: " + request.slug());
        }
        project.setTitle(request.title());
        project.setSlug(request.slug());
        applyChanges(project, request);
        return ProjectMapper.toDetail(project);
    }

    @Caching(evict = {
            @CacheEvict(value = "projects:list", allEntries = true),
            @CacheEvict(value = "projects:detail", allEntries = true)
    })
    @Transactional
    public void softDelete(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy project với id: " + id));

        project.setDeleted(true);
    }

    private void applyChanges(Project project, ProjectRequest request) {
        project.setSummary(request.summary());
        project.setContent(request.content());
        project.setThumbnailUrl(request.thumbnailUrl());
        project.setDemoUrl(request.demoUrl());
        project.setRepoUrl(request.repoUrl());
        project.setStatus(request.status());
        applyTags(project, request.tagsOrEmpty());

        boolean vuaPublish = request.status() == ProjectStatus.PUBLISHED
                && project.getPublishedAt() == null;
        if (vuaPublish) {
            project.setPublishedAt(LocalDateTime.now());
        }
    }

    /**
     * Người dùng gõ tên tag; slug sinh từ tên. Tag nào chưa có thì tạo mới, có rồi
     * thì dùng lại, nên hai dự án gõ "Spring Boot" và "spring boot" vẫn về cùng một tag.
     */
    private void applyTags(Project project, List<String> tagNames) {
        Set<Tag> resolved = new LinkedHashSet<>();

        for (String raw : tagNames) {
            if (raw == null) {
                continue;
            }
            String name = raw.trim();
            String slug = TagSlug.of(name);
            if (name.isEmpty() || slug.isEmpty()) {
                continue;
            }
            Tag tag = tagRepository.findBySlug(slug)
                    .orElseGet(() -> tagRepository.save(new Tag(name, slug)));
            resolved.add(tag);
        }

        project.getTags().clear();
        project.getTags().addAll(resolved);
    }

}
