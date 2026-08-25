package com.example.Portfolio.dto;

import java.time.LocalDateTime;

public record ProjectSummaryResponse(
                Long id,
                String title,
                String slug,
                String summary,
                String thumbnailUrl,
                LocalDateTime publishedAt) {
}
