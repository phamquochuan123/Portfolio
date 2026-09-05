package com.example.Portfolio.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ProjectSummaryResponse(
                Long id,
                String title,
                String slug,
                String summary,
                String thumbnailUrl,
                LocalDateTime publishedAt,
                List<TagResponse> tags) {
}
