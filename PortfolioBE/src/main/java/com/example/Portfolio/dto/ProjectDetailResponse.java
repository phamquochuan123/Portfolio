package com.example.Portfolio.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.example.Portfolio.entity.ProjectStatus;

public record ProjectDetailResponse(
                Long id,
                String title,
                String slug,
                String summary,
                String content,
                String thumbnailUrl,
                String demoUrl,
                String repoUrl,
                ProjectStatus status,
                Long viewCount,
                LocalDateTime publishedAt,
                List<TagResponse> tags

) {
}
